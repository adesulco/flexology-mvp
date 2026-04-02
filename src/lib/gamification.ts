import { prisma } from "@/lib/prisma";
import { TierRank } from "@prisma/client";

// Tier Multipliers and Thresholds (Total accumulated spend equivalent in FLX Points)
export const TIER_THRESHOLDS = {
  FLEX: { minPoints: 0, mult: 1 },         // Base tier
  FLEX_PLUS: { minPoints: 200000, mult: 1.5 }, // 2M IDR spend (or 200k base points)
  PREMIUM: { minPoints: 500000, mult: 2.0 },   // 5M IDR spend (or 500k base points)
};

export async function processBookingGamification(userId: string, bookingId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bookings: true }
  });
  if (!user) return null;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== "COMPLETED") return null;

  // 1. Calculate Points with Tier Multipliers
  const basePoints = booking.totalPrice; // 1 FLX point per 1 IDR 
  const currentTierData = TIER_THRESHOLDS[user.tier] || TIER_THRESHOLDS.FLEX;
  const pointsEarned = Math.floor(basePoints * currentTierData.mult);

  // 2. Add points
  const newTotalPoints = user.points + pointsEarned;

  // 3. Check for Tier Upgrade based on Lifetime base points (using current points as proxy for simplicity)
  // To avoid deranking users who spend points, we should ideally track lifetime points. For now, max logic works.
  let newTier = user.tier;
  if (newTotalPoints >= TIER_THRESHOLDS.PREMIUM.minPoints) newTier = "PREMIUM";
  else if (newTotalPoints >= TIER_THRESHOLDS.FLEX_PLUS.minPoints && newTier !== "PREMIUM") newTier = "FLEX_PLUS";

  // 4. Achievement Evaluator
  const newBadges: string[] = [...user.badges];
  const completedBookings = user.bookings.filter(b => b.status === "COMPLETED" || b.id === bookingId);
  const totalCompleted = completedBookings.length;

  if (totalCompleted === 1 && !newBadges.includes("FIRST_TIMER")) newBadges.push("FIRST_TIMER");
  if (totalCompleted >= 5 && !newBadges.includes("FLEX_REGULAR")) newBadges.push("FLEX_REGULAR");
  
  // Early Bird Badge Check
  const bookingTime = booking.scheduledDate.getHours();
  if (bookingTime <= 9 && !newBadges.includes("EARLY_BIRD")) newBadges.push("EARLY_BIRD");

  // Multiverse (Locations) Check
  const uniqueLocations = new Set(completedBookings.map(b => b.locationId).filter(Boolean));
  if (uniqueLocations.size >= 2 && !newBadges.includes("EXPLORER")) newBadges.push("EXPLORER");

  // 5. Wellness Streak Engine
  // For simplicity: Increment consecutive streak if they completed a booking. 
  // In a robust cron job, streaks reset if 30 days lapse.
  const streak = user.currentStreak + 1;
  const longest = Math.max(user.longestStreak, streak);
  if (streak >= 3 && !newBadges.includes("STREAK_LEGEND")) newBadges.push("STREAK_LEGEND");

  // 6. Mystery Box Algorithm (20% Drop Rate)
  let mysteryBoxWon = false;
  if (Math.random() < 0.20) {
     mysteryBoxWon = true;
  }

  // Execute single atomic transaction update
  const [updatedUser, finalBooking] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: pointsEarned },
        tier: newTier as TierRank,
        badges: { set: newBadges },
        currentStreak: streak,
        longestStreak: longest,
        ...(mysteryBoxWon ? { mysteryBoxes: { increment: 1 } } : {})
      }
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: { pointsAwarded: true }
    })
  ]);

  return { pointsEarned, newTier, mysteryBoxWon, streak };
}
