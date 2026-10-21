import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { HealthFacility } from "../types";

const facilities: HealthFacility[] = [
  {
    id: "kikuyu-health-centre",
    name: "Kikuyu Health Centre",
    type: "healthCentre",
    address: "Kikuyu Town, Kiambu",
    country: "KE",
    region: "Kiambu County",
    phone: "+254700000001",
    createdAt: new Date(),
  },
  {
    id: "wangige-sub-county-hospital",
    name: "Wangige Sub-County Hospital",
    type: "hospital",
    address: "Wangige, Kiambu",
    country: "KE",
    region: "Kiambu County",
    phone: "+254700000002",
    createdAt: new Date(),
  },
  {
    id: "nyathuna-dispensary",
    name: "Nyathuna Dispensary",
    type: "dispensary",
    address: "Nyathuna, Kiambu",
    country: "KE",
    region: "Kiambu County",
    phone: "+254700000003",
    createdAt: new Date(),
  },
  {
    id: "karura-community-clinic",
    name: "Karura Community Clinic",
    type: "clinic",
    address: "Karura, Kiambu",
    country: "KE",
    region: "Kiambu County",
    phone: "+254700000004",
    createdAt: new Date(),
  },
  {
    id: "mulago-national-referral",
    name: "Mulago National Referral Hospital",
    type: "hospital",
    address: "Mulago Hill, Kampala",
    country: "UG",
    region: "Central Region",
    phone: "+256700000001",
    createdAt: new Date(),
  },
  {
    id: "muhimbili-national-hospital",
    name: "Muhimbili National Hospital",
    type: "hospital",
    address: "Upanga West, Dar es Salaam",
    country: "TZ",
    region: "Dar es Salaam",
    phone: "+255700000001",
    createdAt: new Date(),
  },
];

export const seedFacilities = async () => {
  const facilitiesRef = collection(db, "healthFacilities");
  for (const facility of facilities) {
    await setDoc(doc(facilitiesRef, facility.id), facility);
  }
  console.log("✅ Seeded", facilities.length, "facilities");
};
