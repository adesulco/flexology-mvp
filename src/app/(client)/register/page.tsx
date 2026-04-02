import { prisma } from "@/lib/prisma";
import RegisterFormClient from "./RegisterFormClient";

export default async function RegisterPage() {
  let bonus = "10000";
  try {
     const setting = await prisma.systemSetting.findUnique({ where: { key: 'REGISTRATION_BONUS' } });
     if (setting && setting.value) {
        bonus = setting.value;
     }
  } catch (e) {
     console.error("Failed to load registration bonus setting", e);
  }

  return <RegisterFormClient bonus={bonus} />;
}
