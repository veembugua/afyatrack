import type { Child, Vaccination, VaccineSchedule } from "../types";

export const calculateVaccineCoverage = (
  vaccine: VaccineSchedule,
  children: Child[],
  vaccinations: Vaccination[],
) => {
  const today = new Date();

  // 1. Find "eligible" children (children whose age in weeks >= the vaccine's scheduled age)
  const eligibleChildren = children.filter((child) => {
    const ageInMs = today.getTime() - new Date(child.dateOfBirth).getTime();
    const ageInWeeks = ageInMs / (1000 * 60 * 60 * 24 * 7);
    return ageInWeeks >= vaccine.ageInWeeks;
  });

  if (eligibleChildren.length === 0) {
    return { eligible: 0, vaccinated: 0, percentage: 0 };
  }

  // 2. Count how many eligible children have this specific vaccine completed
  const eligibleChildIds = new Set(eligibleChildren.map((c) => c.id));
  const vaccinatedCount = vaccinations.filter(
    (v) =>
      v.vaccineId === vaccine.id &&
      v.status === "completed" &&
      eligibleChildIds.has(v.childId),
  ).length;

  const percentage = Math.round(
    (vaccinatedCount / eligibleChildren.length) * 100,
  );

  return {
    eligible: eligibleChildren.length,
    vaccinated: vaccinatedCount,
    percentage,
  };
};
