import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { VaccineSchedule } from "../types";

// Standard EPI Schedule (mapped to weeks)
const vaccineScheduleData: Omit<VaccineSchedule, "id">[] = [
  // Birth
  {
    country: "KE",
    name: "BCG",
    ageInWeeks: 0,
    description: "Bacillus Calmette-Guérin",
    disease: "Tuberculosis",
    doseNumber: 1,
    isBooster: false,
    isActive: true,
  },
  {
    country: "KE",
    name: "OPV 0",
    ageInWeeks: 0,
    description: "Oral Polio Vaccine",
    disease: "Poliomyelitis",
    doseNumber: 0,
    isBooster: false,
    isActive: true,
  },

  // 6 Weeks
  {
    country: "KE",
    name: "Pentavalent 1",
    ageInWeeks: 6,
    description: "Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib",
    disease: "DPT-HepB-Hib",
    doseNumber: 1,
    isBooster: false,
    isActive: true,
  },
  {
    country: "KE",
    name: "OPV 1",
    ageInWeeks: 6,
    description: "Oral Polio Vaccine",
    disease: "Poliomyelitis",
    doseNumber: 1,
    isBooster: false,
    isActive: true,
  },
  {
    country: "KE",
    name: "PCV 1",
    ageInWeeks: 6,
    description: "Pneumococcal Conjugate Vaccine",
    disease: "Pneumonia",
    doseNumber: 1,
    isBooster: false,
    isActive: true,
  },
  {
    country: "KE",
    name: "Rota 1",
    ageInWeeks: 6,
    description: "Rotavirus Vaccine",
    disease: "Rotavirus Diarrhea",
    doseNumber: 1,
    isBooster: false,
    isActive: true,
  },

  // 10 Weeks
  {
    country: "KE",
    name: "Pentavalent 2",
    ageInWeeks: 10,
    description: "Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib",
    disease: "DPT-HepB-Hib",
    doseNumber: 2,
    isBooster: false,
    isActive: true,
  },
  {
    country: "KE",
    name: "OPV 2",
    ageInWeeks: 10,
    description: "Oral Polio Vaccine",
    disease: "Poliomyelitis",
    doseNumber: 2,
    isBooster: false,
    isActive: true,
  },
  {
    country: "KE",
    name: "PCV 2",
    ageInWeeks: 10,
    description: "Pneumococcal Conjugate Vaccine",
    disease: "Pneumonia",
    doseNumber: 2,
    isBooster: false,
    isActive: true,
  },
  {
    country: "KE",
    name: "Rota 2",
    ageInWeeks: 10,
    description: "Rotavirus Vaccine",
    disease: "Rotavirus Diarrhea",
    doseNumber: 2,
    isBooster: false,
    isActive: true,
  },

  // 14 Weeks
  {
    country: "KE",
    name: "Pentavalent 3",
    ageInWeeks: 14,
    description: "Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib",
    disease: "DPT-HepB-Hib",
    doseNumber: 3,
    isBooster: false,
    isActive: true,
  },
  {
    country: "KE",
    name: "OPV 3",
    ageInWeeks: 14,
    description: "Oral Polio Vaccine",
    disease: "Poliomyelitis",
    doseNumber: 3,
    isBooster: false,
    isActive: true,
  },
  {
    country: "KE",
    name: "PCV 3",
    ageInWeeks: 14,
    description: "Pneumococcal Conjugate Vaccine",
    disease: "Pneumonia",
    doseNumber: 3,
    isBooster: false,
    isActive: true,
  },

  // 6 Months (26 weeks)
  {
    country: "KE",
    name: "Vitamin A",
    ageInWeeks: 26,
    description: "Vitamin A Supplement",
    disease: "Vitamin A Deficiency",
    doseNumber: 1,
    isBooster: false,
    isActive: true,
  },

  // 9 Months (39 weeks)
  {
    country: "KE",
    name: "MR 1",
    ageInWeeks: 39,
    description: "Measles-Rubella Vaccine",
    disease: "Measles, Rubella",
    doseNumber: 1,
    isBooster: false,
    isActive: true,
  },
  {
    country: "KE",
    name: "Yellow Fever",
    ageInWeeks: 39,
    description: "Yellow Fever Vaccine",
    disease: "Yellow Fever",
    doseNumber: 1,
    isBooster: false,
    isActive: true,
  },

  // 18 Months (78 weeks)
  {
    country: "KE",
    name: "Pentavalent Booster",
    ageInWeeks: 78,
    description: "Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib",
    disease: "DPT-HepB-Hib",
    doseNumber: 4,
    isBooster: true,
    isActive: true,
  },
  {
    country: "KE",
    name: "OPV Booster",
    ageInWeeks: 78,
    description: "Oral Polio Vaccine",
    disease: "Poliomyelitis",
    doseNumber: 4,
    isBooster: true,
    isActive: true,
  },
  {
    country: "KE",
    name: "MR 2",
    ageInWeeks: 78,
    description: "Measles-Rubella Vaccine",
    disease: "Measles, Rubella",
    doseNumber: 2,
    isBooster: true,
    isActive: true,
  },

  // 5 Years (260 weeks)
  {
    country: "KE",
    name: "Td",
    ageInWeeks: 260,
    description: "Tetanus and Diphtheria Toxoids",
    disease: "Tetanus, Diphtheria",
    doseNumber: 1,
    isBooster: true,
    isActive: true,
  },
];

export const seedVaccineSchedule = async () => {
  try {
    // Check if already seeded to avoid duplicates
    const snapshot = await getDocs(collection(db, "vaccineSchedule"));
    if (snapshot.size > 0) {
      console.log("✅ Vaccine schedule already seeded. Skipping.");
      return;
    }

    const collectionRef = collection(db, "vaccineSchedule");
    for (const vaccine of vaccineScheduleData) {
      // Create a unique ID based on country and name
      const docId = `${vaccine.country.toLowerCase()}_${vaccine.name.toLowerCase().replace(/\s+/g, "_")}`;
      await setDoc(doc(collectionRef, docId), {
        ...vaccine,
        id: docId,
      });
    }
    console.log(
      `✅ Successfully seeded ${vaccineScheduleData.length} vaccines.`,
    );
  } catch (error) {
    console.error("❌ Failed to seed vaccine schedule:", error);
  }
};
