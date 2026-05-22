import { PICKUP_HUB } from "./operations";
import { DEFAULT_VEHICLE_IMAGE } from "./vehicle-images";

export const driver = {
  name: "Arjun Mehta",
  id: "NEEV-DR-04821",
  mobile: "+91 98XXX 41122",
  license: "DL-0420190034512",
  joined: "12 Mar 2024",
  hub: "Whitefield Hub · Bengaluru",
  status: "Active",
  ecoScore: 92,
  workingDays: 184,
  emiCompletion: 38,
  totalRentPaid: 142500,
  profileCompletion: 88,
};

export interface AssignedVehicle {
  id: string;
  reg: string;
  model: string;
  image: string;
  imageUrl: string;
  battery: number;
  range: number;
  shift: string;
  pickup: string;
  pickupCoords: { lat: number; lng: number };
  status: string;
  assignmentMessage: string;
}

/** Management-controlled daily vehicle pool — rotates automatically by date. */
export const dailyVehicleAssignments: AssignedVehicle[] = [
  {
    id: "mgmt-1",
    reg: "KA 05 EV 4421",
    model: "Tata Xpres-T EV",
    image: "tata-xpres",
    imageUrl: DEFAULT_VEHICLE_IMAGE,
    battery: 86,
    range: 248,
    shift: "06:00 — 18:00",
    pickup: "Whitefield Hub, Bay 14",
    pickupCoords: PICKUP_HUB,
    status: "Assigned",
    assignmentMessage: "Vehicle assigned by Neev Operations Team",
  },
  {
    id: "mgmt-2",
    reg: "KA 51 EV 8801",
    model: "MG ZS EV",
    image: "mg-zs",
    imageUrl: DEFAULT_VEHICLE_IMAGE,
    battery: 78,
    range: 264,
    shift: "06:00 — 18:00",
    pickup: "Whitefield Hub, Bay 7",
    pickupCoords: PICKUP_HUB,
    status: "Assigned",
    assignmentMessage: "Vehicle assigned by Neev Operations Team",
  },
  {
    id: "mgmt-3",
    reg: "KA 09 EV 1129",
    model: "Tiago EV",
    image: "tiago-ev",
    imageUrl: DEFAULT_VEHICLE_IMAGE,
    battery: 91,
    range: 212,
    shift: "06:00 — 18:00",
    pickup: "Whitefield Hub, Bay 3",
    pickupCoords: PICKUP_HUB,
    status: "Assigned",
    assignmentMessage: "Vehicle assigned by Neev Operations Team",
  },
];

/** @deprecated Use getTodaysAssignment from operations — kept for legacy imports. */
export const assignedVehicle = dailyVehicleAssignments[0];

export const emi = {
  totalDeposit: 180000,
  paid: 68400,
  remaining: 111600,
  monthly: 5700,
  nextDue: "28 May 2026",
  installments: Array.from({ length: 12 }, (_, i) => ({
    n: i + 1,
    date: `${String(i + 1).padStart(2, "0")} May 2026`,
    amount: 5700,
    status: i < 4 ? "paid" : i === 4 ? "due" : "upcoming",
  })),
};

export const rentBase = 1400;
export const rentPenalty = 250;

export const tripHistory = [
  { date: "21 May 2026", vehicle: "Tata Xpres-T EV", reg: "KA 05 EV 4421", shift: "06:00–18:00", start: "06:12", end: "17:58", odometer: "24210 → 24398", verification: "Verified" },
  { date: "20 May 2026", vehicle: "MG ZS EV", reg: "KA 51 EV 8801", shift: "06:00–18:00", start: "06:05", end: "18:02", odometer: "24050 → 24210", verification: "Verified" },
  { date: "19 May 2026", vehicle: "Tiago EV", reg: "KA 09 EV 1129", shift: "06:00–18:00", start: "06:18", end: "17:45", odometer: "18120 → 18302", verification: "Verified" },
];

export const rentHistory = [
  { date: "20 May 2026", amount: 1400, lateFee: 0, status: "Paid" },
  { date: "19 May 2026", amount: 1400, lateFee: 250, status: "Late Fee Applied" },
  { date: "18 May 2026", amount: 1400, lateFee: 0, status: "Paid" },
  { date: "17 May 2026", amount: 1400, lateFee: 0, status: "Paid" },
];

export const emiPaymentHistory = [
  { date: "01 May 2026", amount: 5700, receipt: "EMI-884201" },
  { date: "01 Apr 2026", amount: 5700, receipt: "EMI-772910" },
  { date: "01 Mar 2026", amount: 5700, receipt: "EMI-661204" },
  { date: "01 Feb 2026", amount: 5700, receipt: "EMI-550118" },
];

export type Capture = { key: string; label: string; isVideo?: boolean };
export const captures: Capture[] = [
  { key: "front", label: "Front View" },
  { key: "rear", label: "Rear View" },
  { key: "left", label: "Left Side" },
  { key: "right", label: "Right Side" },
  { key: "dash", label: "Dashboard View" },
  { key: "cabin", label: "Rear Interior" },
  { key: "charge", label: "Charging Area" },
  { key: "video", label: "Full Vehicle Walkaround Video", isVideo: true },
];

export const photoCaptures = captures.filter((c) => !c.isVideo);
