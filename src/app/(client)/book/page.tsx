"use client";

import { useBookingStore, Location, Service, Flexologist } from "@/store/useBookingStore";
import { formatCurrency } from "@/lib/formatters";
import { useState, useEffect, useMemo } from "react";
import { format, addDays } from "date-fns";
import { CheckCircle2, ChevronLeft, CalendarClock, ChevronRight, MapPin, Activity, Star, Tag, Sparkles, Clock, User, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function BookingWizard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(() => {
     if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('step') === '3' ? 3 : 1;
     }
     return 1;
  });
  const router = useRouter();
  
  const { 
    mode, setMode,
    selectedLocation, setLocation, 
    selectedService, setService,
    selectedDate, setDate,
    selectedTime, setTime,
    selectedFlexologist, setFlexologist,
    homeAddress, homeMapLink, setHomeAddress,
    resetBooking
  } = useBookingStore();

  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [flexologists, setFlexologists] = useState<Flexologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FLX Points & Tier Economy State
  const [dbPoints, setDbPoints] = useState<number>(0);
  const [dbTier, setDbTier] = useState<string>('FLEX');
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isHappyHourActive, setIsHappyHourActive] = useState(false);

  // Guest Checkout State
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
    
    Promise.all([
      fetch('/api/locations').then(res => res.json()),
      fetch('/api/services').then(res => res.json()),
      fetch('/api/flexologists').then(res => res.json()),
      fetch('/api/user/points').then(async res => {
          if (res.status === 401) return { isGuest: true };
          const data = await res.json();
          return { ...data, isGuest: false };
      })
    ]).then(([locData, srvData, flexData, pointsData]) => {
      setLocations(locData);
      setServices(srvData);
      setFlexologists(flexData);
      
      if (pointsData.isGuest) {
          setIsGuest(true);
      } else {
          setDbPoints(pointsData.points || 0);
          setDbTier(pointsData.tier || 'FLEX');
      }
      setIsLoading(false);
      
      // Handle the deep link from Service Carousel
      const targetServiceId = searchParams.get("service");
      if (targetServiceId && srvData) {
         const target = srvData.find((s: any) => s.id === targetServiceId);
         if (target) {
            setService(target);
            setStep(2); // Jump straight to Location/Service verification
         }
      }
    }).catch(console.error);
  }, []);

  // Calculate Subscriptions
  const basePrice = selectedService?.price || 0;
  let tierDiscountAmount = 0;
  if (dbTier === 'FLEX_PLUS') tierDiscountAmount = Math.floor(basePrice * 0.10);
  if (dbTier === 'PREMIUM') tierDiscountAmount = Math.floor(basePrice * 0.15);
  
  // Phase 6 AI Dynamic Pricing Application
  let aiDiscountAmount = 0;
  if (isHappyHourActive) aiDiscountAmount = Math.floor(basePrice * 0.30);

  const priceAfterTierAndAI = Math.max(0, basePrice - tierDiscountAmount - aiDiscountAmount);

  // Recalculate caps if they switch services or toggle points
  const maxPointsAllowed = selectedService ? Math.min(dbPoints, priceAfterTierAndAI) : 0;
  
  // Update state constraints automatically
  useEffect(() => {
    if (usePoints) {
      if (pointsToUse === 0) setPointsToUse(Math.min(dbPoints, selectedService?.price || 0));
      if (pointsToUse > maxPointsAllowed) setPointsToUse(maxPointsAllowed);
    } else {
      setPointsToUse(0);
    }
  }, [usePoints, selectedService, dbPoints, maxPointsAllowed]);

  const handleNext = () => {
    if (step < 5) {
       setStep(step + 1);
       if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      router.push("/");
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && mode === 'outlet' && !selectedLocation) return true;
    if (step === 1 && mode === 'home' && !homeAddress) return true;
    if (step === 2 && !selectedService) return true;
    if (step === 3 && (!selectedDate || !selectedTime)) return true;
    
    // Prevent booking without therapist (FLX-005 / FLX-015)
    if (step === 4) {
       if (!selectedFlexologist || selectedFlexologist.id === '') return true;
       // If no therapists are available, they cannot bypass by having "any" cached
       if (selectedFlexologist.id === 'any' && availableFlexologists.length === 0) return true;
    }
    
    if (step === 5 && usePoints && pointsToUse > maxPointsAllowed) return true;
    return false;
  };

  // Generate dates for next 7 days
  const upcomingDates = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i)), []);

  const timeSlots = useMemo(() => {
    let rawOpen = "08:00";
    let rawClose = "22:00";
    
    if (mode === 'outlet' && selectedLocation) {
       rawOpen = selectedLocation.openTime || "08:00";
       rawClose = selectedLocation.closeTime || "22:00";
    }
    
    // Parse times
    const [openH, openM] = rawOpen.split(":").map(Number);
    const [closeH, closeM] = rawClose.split(":").map(Number);
    const durationMins = selectedService?.duration || 60;
    
    const startTotalMins = openH * 60 + openM;
    const endTotalMins = closeH * 60 + closeM;
    
    let currentMins = startTotalMins;
    const slots: { time: string, isHappyHour: boolean }[] = [];
    
    // Phase 6: Revenue Intelligence Algorithm
    while (currentMins + durationMins <= endTotalMins) {
       const h = String(Math.floor(currentMins / 60)).padStart(2, '0');
       const m = String(currentMins % 60).padStart(2, '0');
       
       const bookingEndMins = currentMins + durationMins;
       let surplusCount = 0;
       
       flexologists.forEach(f => {
          if (f.isOnDuty === false) return;
          const [startH, startM] = (f.shiftStart || "08:00").split(":").map(Number);
          const [endH, endM] = (f.shiftEnd || "22:00").split(":").map(Number);
          const shiftStartMins = startH * 60 + startM;
          const shiftEndMins = endH * 60 + endM;
          if (currentMins >= shiftStartMins && bookingEndMins <= shiftEndMins) {
             surplusCount++;
          }
       });

       if (surplusCount > 0) {
         // Intelligence Hook: Between 14:00 (840) and 16:00 (960) with surplus therapists
         const isHappyHour = (currentMins >= 840 && currentMins <= 960) && (surplusCount > 1) && (selectedDate && new Date(selectedDate).getDay() !== 0 && new Date(selectedDate).getDay() !== 6);
         slots.push({ time: `${h}:${m}`, isHappyHour: !!isHappyHour });
       }
       currentMins += 30;
    }
    return slots;
  }, [mode, selectedLocation, selectedService, flexologists, selectedDate]);

  const availableFlexologists = useMemo(() => {
     if (!selectedTime) return flexologists.filter(f => f.isOnDuty !== false); // fallback

     const [selH, selM] = selectedTime.split(":").map(Number);
     const selMins = selH * 60 + selM;
     const dur = selectedService?.duration || 60;
     const bookingEndMins = selMins + dur;

     return flexologists.filter(f => {
        if (f.isOnDuty === false) return false;
        
        if (mode === 'outlet' && selectedLocation) {
           if (f.locationId && f.locationId !== selectedLocation.id) return false;
        } else if (mode === 'home') {
           if (!f.canHomeService) return false;
        }
        
        const [startH, startM] = (f.shiftStart || "08:00").split(":").map(Number);
        const [endH, endM] = (f.shiftEnd || "22:00").split(":").map(Number);
        
        const shiftStartMins = startH * 60 + startM;
        const shiftEndMins = endH * 60 + endM;
        
        if (selMins < shiftStartMins || bookingEndMins > shiftEndMins) return false;
        
        return true;
     });
  }, [flexologists, selectedTime, selectedService, mode, selectedLocation]);
  const renderStepContent = () => {
    switch (step) {
      case 1:
        if (mode === null) {
          return (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <h2 className="text-2xl font-bold tracking-tight mb-2">Service Type</h2>
               <p className="text-flx-text-muted text-sm mb-4">How would you like to experience Flex?</p>
               
               <div className="bg-flx-teal/10 border border-flx-teal/20 text-flx-teal px-4 py-3 rounded-2xl text-xs font-bold tracking-tight mb-6 flex items-center gap-2 shadow-[0_0_15px_rgba(12,242,212,0.1)]">
                 <Star className="w-4 h-4 fill-flx-teal text-flx-teal" /> Over 3,000+ recovery sessions completed in Indonesia
               </div>

               <div className="flex flex-col gap-4">
                 <button 
                    onClick={() => setMode('outlet')} 
                    className="w-full text-left p-6 rounded-2xl border border-flx-border bg-flx-card hover:border-black active:scale-[0.98] transition-all flex items-center gap-4"
                 >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-flx-border shrink-0">
                       <MapPin className="w-6 h-6 text-black" />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg text-black mb-1">In Studio</h3>
                       <p className="text-xs text-flx-text-muted">Visit one of our premium recovery centers</p>
                    </div>
                 </button>
                 <button 
                    onClick={() => setMode('home')} 
                    className="w-full text-left p-6 rounded-2xl border border-flx-border bg-flx-card hover:border-black active:scale-[0.98] transition-all flex items-center gap-4"
                 >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-flx-border shrink-0">
                       <Activity className="w-6 h-6 text-black" />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg text-black mb-1">At-Home Service</h3>
                       <p className="text-xs text-flx-text-muted">A Flexologist comes directly to your location</p>
                    </div>
                 </button>
               </div>
             </motion.div>
          );
        }

        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {mode === 'outlet' ? (
              <>
                <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center justify-between">Select Outlet <button onClick={() => setMode(null as any)} className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">Change Mode</button></h2>
                <p className="text-flx-text-muted text-sm mb-6">Where would you like to recover today?</p>
                <div className="flex flex-col gap-4">
                  {isLoading && <p className="text-sm text-flx-text-muted animate-pulse">Loading outlets...</p>}
                  {locations
                     .filter(loc => flexologists.some(f => f.locationId === loc.id))
                     .map(loc => (
                    <div 
                      key={loc.id} 
                      onClick={() => setLocation(loc)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        selectedLocation?.id === loc.id 
                        ? 'border-flx-teal bg-flx-teal/5 shadow-[0_0_15px_rgba(12,242,212,0.15)]' 
                        : 'border-flx-border bg-flx-card hover:border-flx-teal/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full border border-flx-border ${selectedLocation?.id === loc.id ? 'bg-black text-white' : 'bg-white text-flx-text'}`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight mb-1 text-flx-text">{loc.name}</h3>
                            <p className="text-xs text-flx-text-muted leading-relaxed line-clamp-2 pr-6">{loc.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center justify-between">Service Address <button onClick={() => setMode(null as any)} className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">Change Mode</button></h2>
                <p className="text-flx-text-muted text-sm mb-6">Where should we send your therapist?</p>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-bold text-flx-text mb-2">Full Address</label>
                    <textarea 
                      value={homeAddress || ''}
                      onChange={(e) => setHomeAddress(e.target.value, homeMapLink || undefined)}
                      placeholder="Street name, apartment number, etc."
                      className="w-full p-4 rounded-xl border border-flx-border bg-flx-card text-flx-text focus:outline-none focus:border-black focus:ring-1 focus:ring-black min-h-[100px] resize-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-flx-text mb-2">Google Maps Link <span className="text-flx-text-muted font-normal">(Optional)</span></label>
                    <input 
                      type="url"
                      value={homeMapLink || ''}
                      onChange={(e) => setHomeAddress(homeAddress || '', e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full p-4 rounded-xl border border-flx-border bg-flx-card text-flx-text focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                    <p className="text-xs text-flx-text-muted mt-2">Providing a pin helps your therapist find you faster.</p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Choose Service</h2>
            <p className="text-flx-text-muted text-sm mb-6">Select a targeted recovery technique.</p>
            <div className="flex flex-col gap-4">
              {isLoading && <p className="text-sm text-flx-text-muted animate-pulse">Loading services...</p>}
              {services.map(srv => (
                <div 
                  key={srv.id} 
                  onClick={() => setService(srv)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedService?.id === srv.id 
                    ? 'border-flx-teal bg-flx-teal/5' 
                    : 'border-flx-border bg-flx-card hover:border-flx-teal/50'
                  }`}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                           <Activity className={`w-5 h-5 ${selectedService?.id === srv.id ? 'text-flx-teal' : 'text-flx-text-muted'}`} />
                           <h3 className="font-bold text-lg text-flx-text">{srv.name}</h3>
                           <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase flex items-center gap-1 ml-1"><Star className="w-2.5 h-2.5 fill-yellow-500" /> 4.9/5</span>
                        </div>
                      </div>
                      <p className="text-xs text-flx-text-muted mb-4">{srv.description}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="flex items-center gap-1.5 bg-flx-card border border-flx-border px-3 py-1.5 rounded-full"><Clock className="w-3.5 h-3.5 text-flx-teal" /> {srv.duration} min</span>
                      <span className="text-flx-text">{formatCurrency(srv.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Book Time</h2>
            <p className="text-flx-text-muted text-sm mb-6">Select when you'd like your session.</p>
            
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3 text-flx-text">Date Selection</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                {upcomingDates.map(date => {
                  const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  return (
                    <div 
                      key={date.toISOString()}
                      onClick={() => setDate(date)}
                      className={`min-w-[70px] flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-flx-teal border-flx-teal text-white' : 'bg-flx-card border-flx-border text-flx-text hover:border-flx-teal/50'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-80">{format(date, 'EEE')}</span>
                      <span className="text-xl font-bold mt-1">{format(date, 'd')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-2">
              <h3 className="font-bold text-sm text-flx-text mb-3 flex items-center justify-between">
                 <span>Time Slots</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map(slot => (
                  <div 
                    key={slot.time}
                    onClick={() => {
                        setTime(slot.time);
                        setIsHappyHourActive(slot.isHappyHour);
                    }}
                    className={`relative py-3 rounded-xl border text-center font-medium cursor-pointer transition-colors ${
                      selectedTime === slot.time ? 'bg-flx-teal border-flx-teal text-white' : 'bg-flx-card border-flx-border text-flx-text hover:border-flx-teal/50'
                    }`}
                  >
                    {slot.isHappyHour && <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[9px] tracking-tight font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 shadow-sm border border-yellow-500 z-10 animate-pulse">⚡ SAVER</div>}
                    {slot.time}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Select Flexologist</h2>
            <p className="text-flx-text-muted text-sm mb-6">Choose an expert for your session.</p>
            
            <div className="flex flex-col gap-4">
              {isLoading && <p className="text-sm text-flx-text-muted animate-pulse">Loading staff...</p>}
              {!isLoading && availableFlexologists.length === 0 && (
                 <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
                    No therapists are currently On-Duty for your configured <b>{selectedTime}</b> session block. Please select a different time or outlet.
                 </div>
              )}
              
              {!isLoading && availableFlexologists.length > 0 && (
                  <div 
                      onClick={() => setFlexologist({ id: "any", name: "Any Available", rating: 4.9, reviews: 0, specialty: [], imageUrl: "" })}
                      className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-colors ${
                        selectedFlexologist?.id === "any" ? 'border-flx-teal bg-flx-teal/5' : 'border-flx-border bg-white hover:border-flx-teal/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-flx-card border border-dashed border-flx-border flex items-center justify-center text-flx-text-muted">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-flx-text">First Available</h3>
                        <p className="text-xs text-flx-text-muted">Match with the quickest expert</p>
                      </div>
                  </div>
              )}
              {availableFlexologists.map(flex => (
                <div 
                  key={flex.id}
                  onClick={() => setFlexologist(flex)}
                  className={`p-4 rounded-2xl border flex gap-4 cursor-pointer transition-colors ${
                    selectedFlexologist?.id === flex.id ? 'border-flx-teal bg-flx-teal/5' : 'border-flx-border bg-white hover:border-flx-teal/50'
                  }`}
                >
                  <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 border border-gray-300 text-2xl uppercase shadow-inner">
                     {flex.name.charAt(0)}
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-flx-text">{flex.name}</h3>
                      <div className="flex items-center gap-1 bg-flx-dark border border-flx-border px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 text-black fill-black" />
                        <span className="text-xs font-bold text-black">{flex.rating}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-flx-text-muted">{flex.specialty.join(" • ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex flex-col items-center justify-center py-6 mb-4">
               <div className="w-16 h-16 bg-flx-card border-2 border-flx-border rounded-full flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 rounded-full border border-flx-teal animate-ping opacity-20"></div>
                  <CheckCircle2 className="w-8 h-8 text-flx-teal drop-shadow-[0_0_8px_rgba(12,242,212,0.8)]" />
               </div>
               <h2 className="text-2xl font-bold tracking-tight text-center">Summary</h2>
               <p className="text-flx-text-muted text-sm text-center">Review your session details</p>
            </div>

            <div className="bg-white border border-flx-border rounded-2xl p-6 mb-4 text-sm space-y-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-flx-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Service</p>
                  <p className="font-semibold text-base text-flx-text">{selectedService?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-base tracking-tight text-flx-text mb-0.5">{formatCurrency(basePrice)}</p>
                  <p className="text-[10px] bg-flx-card border border-flx-border px-2 py-0.5 rounded-md inline-block text-flx-text">{selectedService?.duration} min</p>
                </div>
              </div>

              {tierDiscountAmount > 0 && (
                 <>
                   <hr className="border-flx-border/30 border-dashed" />
                   <div className="flex justify-between items-center bg-green-50/50 p-2.5 rounded-xl border border-green-100">
                     <span className="text-xs font-bold text-green-700 uppercase tracking-tight flex items-center gap-1.5"><Star className="w-3 h-3" /> {dbTier.replace('_', ' ')} Discount</span>
                     <span className="text-xs font-mono font-bold text-green-600">-{formatCurrency(tierDiscountAmount)}</span>
                   </div>
                 </>
              )}

              {aiDiscountAmount > 0 && (
                 <>
                   <hr className="border-flx-border/30 border-dashed" />
                   <div className="flex justify-between items-center bg-yellow-50/80 p-2.5 rounded-xl border border-yellow-200">
                     <span className="text-xs font-bold text-yellow-800 uppercase tracking-tight flex items-center gap-1.5">⚡ AI Happy Hour</span>
                     <span className="text-xs font-mono font-bold text-yellow-700">-{formatCurrency(aiDiscountAmount)}</span>
                   </div>
                 </>
              )}

              <hr className="border-flx-border/60" />

              <div>
                <p className="text-flx-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">When</p>
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-black" />
                  <p className="font-semibold text-flx-text">
                    {selectedDate && format(selectedDate, "EEE, MMM do")} at {selectedTime}
                  </p>
                </div>
              </div>

              <hr className="border-flx-border/60" />

              <div>
                <p className="text-flx-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Where</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <div>
                    {mode === 'outlet' ? (
                      <>
                        <p className="font-semibold text-flx-text">{selectedLocation?.name}</p>
                        <p className="text-xs text-flx-text-muted mt-0.5">{selectedLocation?.address}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-flx-text">At-Home Service</p>
                        <p className="text-xs text-flx-text-muted mt-0.5 whitespace-pre-line">{homeAddress}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
            </div>

            {/* FLX BURN ENGINE UI */}
            {dbPoints > 0 && selectedService && (
              <div className="bg-flx-teal/10 border border-flx-teal/30 p-5 rounded-2xl mb-4">
                 <div className="flex items-center justify-between mb-3">
                    <div>
                       <h3 className="font-bold text-flx-teal text-sm flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Apply FLX Reward Points
                       </h3>
                       <p className="text-[10px] text-gray-500 mt-1">Avail Balance: <span className="font-bold">{dbPoints.toLocaleString()} PTS</span></p>
                    </div>
                    
                    {/* Native Toggle Switch */}
                    <div 
                      onClick={() => setUsePoints(!usePoints)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${usePoints ? 'bg-flx-teal' : 'bg-gray-300'}`}
                    >
                       <motion.div 
                         layout
                         className="bg-white w-4 h-4 rounded-full shadow-sm"
                         transition={{ type: "spring", stiffness: 500, damping: 30 }}
                         style={{ transform: usePoints ? 'translateX(24px)' : 'translateX(0px)' }}
                       />
                    </div>
                 </div>

                 {/* Expansion Area */}
                 <AnimatePresence>
                    {usePoints && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden pt-2"
                       >
                          <hr className="border-flx-teal/20 mb-3" />
                          <div className="flex justify-between items-center mb-2">
                             <label className="text-[10px] uppercase font-bold text-flx-teal tracking-widest">Points to Burn</label>
                             <input 
                               type="number" 
                               min="0"
                               max={maxPointsAllowed}
                               value={pointsToUse}
                               onChange={(e) => {
                                 const val = parseInt(e.target.value) || 0;
                                 setPointsToUse(val > maxPointsAllowed ? maxPointsAllowed : val);
                               }}
                               className="w-20 p-1 text-center bg-white border border-flx-teal/50 rounded-md font-mono text-sm font-bold text-black outline-none focus:ring-1 focus:ring-flx-teal"
                             />
                          </div>
                          
                          <input 
                             type="range"
                             min="0"
                             max={maxPointsAllowed}
                             value={pointsToUse}
                             onChange={(e) => setPointsToUse(parseInt(e.target.value))}
                             className="w-full accent-flx-teal h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2"
                          />
                          <div className="flex justify-between text-[10px] font-bold text-gray-400">
                             <span>0</span>
                             <span>Max: {maxPointsAllowed.toLocaleString()}</span>
                          </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            )}

            {isGuest && (
              <div className="bg-flx-card border border-flx-border p-5 rounded-2xl mb-4 text-sm mt-4">
                 <h3 className="font-bold text-flx-text mb-4 flex items-center gap-2"><User className="w-4 h-4 text-black" /> Contact Details</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] uppercase font-bold text-flx-text-muted">Full Name</label>
                       <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} required placeholder="Jane Doe" className="w-full mt-1 p-3 bg-white border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" />
                    </div>
                    <div>
                       <label className="text-[10px] uppercase font-bold text-flx-text-muted">Mobile Number (WhatsApp)</label>
                       <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} required placeholder="08_____" className="w-full mt-1 p-3 bg-white border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" />
                    </div>
                 </div>
              </div>
            )}

            <div className="flex justify-between items-center bg-black p-5 rounded-2xl mb-6">
               <span className="font-bold text-white">Total Due</span>
               <div className="flex flex-col items-end">
                  {usePoints && pointsToUse > 0 && selectedService && (
                    <span className="text-xs text-gray-500 line-through mb-1 tracking-tight">{formatCurrency(priceAfterTierAndAI)}</span>
                  )}
                  <span className="text-xl font-mono text-white font-bold">
                     {selectedService ? formatCurrency(priceAfterTierAndAI - (usePoints ? pointsToUse : 0)) : formatCurrency(0)}
                  </span>
               </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Dynamic Header */}
      <header className="px-6 py-4 pt-10 flex items-center justify-between sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-flx-border shadow-sm">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-flx-card transition-colors">
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <div className="flex flex-col items-center">
           <span className="text-[10px] uppercase font-bold tracking-widest text-flx-text-muted mb-1">Step {step} of 5</span>
           <div className="flex gap-1.5 items-center">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-black' : i < step ? 'w-2 bg-black/40' : 'w-2 bg-black/10'}`} />
              ))}
           </div>
        </div>
        <div className="w-10"></div> {/* Spacer to center dots */}
      </header>

      {/* Main Checkout Area (FLX-008 Safe Area Fix) */}
      <main className="flex-1 overflow-y-auto px-6 py-4 pb-[240px] scrollbar-hide">
         <AnimatePresence mode="wait">
            {renderStepContent()}
         </AnimatePresence>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="absolute bottom-0 left-0 w-full p-6 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent z-50">
         {step < 5 ? (
           <button 
             onClick={handleNext}
             disabled={isNextDisabled() || (step === 1 && mode === null)}
             className="w-full bg-black text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
           >
             Continue <ChevronRight className="w-5 h-5 -mr-1" />
           </button>
         ) : (
           <button 
             onClick={async () => {
                setIsSubmitting(true);
                try {
                  const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      mode: mode === 'home' ? 'HOME' : 'OUTLET',
                      locationId: selectedLocation?.id,
                      serviceId: selectedService?.id,
                      flexologistId: selectedFlexologist?.id,
                      homeAddress,
                        homeMapLink,
                        scheduledDate: selectedDate?.toISOString(),
                        pointsUsed: usePoints ? pointsToUse : 0,
                        guestName: isGuest ? guestName : undefined,
                        guestPhone: isGuest ? guestPhone : undefined
                      })
                    });
                    
                    if (!response.ok) {
                       throw new Error("Booking failed");
                    }
                    const data = await response.json();
                    
                    resetBooking();
                    router.push(`/checkout/booking/${data.id}`);
                  } catch(e) {
                    console.error(e);
                    setIsSubmitting(false);
                    alert("Unable to secure booking slot. It may have been taken.");
                  }
               }}
               disabled={isSubmitting || (isGuest && (!guestName || !guestPhone))}
               className={`w-full text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                 isSubmitting || (isGuest && (!guestName || !guestPhone)) 
                 ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                 : 'bg-black hover:bg-black/90 shadow-[0_8px_16px_rgba(0,0,0,0.15)]'
               }`}
             >
             {isSubmitting ? 'Processing...' : 'Confirm Booking'}
           </button>
         )}
      </div>
    </div>
  );
}
