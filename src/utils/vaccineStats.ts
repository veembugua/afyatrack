import type { VaccineSchedule, Vaccination } from "../types";

export const calculateVaccineStats = (
  childDob: Date,
  schedule: VaccineSchedule[],
  completedVaccines: Vaccination[],
) => {
  let upcoming = 0;
  let missed = 0;
  let completedCount = 0;

  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const gracePeriod = new Date();
  gracePeriod.setDate(today.getDate() - 14); // 14-day grace period before marking as "missed"

  const completedVaccineIds = new Set(
    completedVaccines.map((v) => v.vaccineId),
  );

  for (const vax of schedule) {
    if (completedVaccineIds.has(vax.id)) {
      completedCount++;
      continue;
    }

    // Calculate scheduled date: DOB + ageInWeeks weeks
    const scheduledDate = new Date(childDob);
    scheduledDate.setDate(scheduledDate.getDate() + vax.ageInWeeks * 7);

    if (scheduledDate < gracePeriod) {
      missed++;
    } else if (scheduledDate <= thirtyDaysFromNow) {
      upcoming++;
    }
  }

  return { upcoming, missed, completed: completedCount };
};
