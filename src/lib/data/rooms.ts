// ==============================================================================
// ShunyOS Rooms, Buildings, Floors, Beds & Ledger Data Store
// Connects to Supabase tables with live in-memory store matching shunyos-ui.html
// ==============================================================================

import { createClient } from "@/lib/supabase/server";

export interface TenantProfileItem {
  id: string;
  pgId: string;
  name: string;
  phone: string;
  parentPhone: string;
  college: string;
  joinDate: string;
  deposit: number;
  rentPaid: boolean;
  kycStatus: "Verified" | "Pending";
}

export interface BedItem {
  id: string;
  label: string;
  occupied: boolean;
  tenant?: TenantProfileItem | null;
}

export interface RoomItem {
  id: string;
  number: string;
  sharing: number;
  rent: number;
  beds: BedItem[];
}

export interface FloorItem {
  id: string;
  name: string;
  rooms: RoomItem[];
}

export interface BuildingItem {
  id: string;
  pgId: string;
  name: string;
  type: string;
  floors: FloorItem[];
}

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  scope: string;
  date: string;
}

export interface UpiApprovalItem {
  id: string;
  tenantId: string;
  tenantName: string;
  room: string;
  amount: number;
  utr: string;
  status: "Pending" | "Approved" | "Rejected";
  time: string;
}

export interface StaffItem {
  id: string;
  name: string;
  phone: string;
  assignedBuildingIds: string[];
  permissions: {
    manage_tenants: boolean;
    collect_cash: boolean;
    resolve_complaints: boolean;
    manage_mess: boolean;
    issue_passes: boolean;
  };
}

export interface ComplaintItem {
  id: string;
  tenantId: string;
  tenantName: string;
  buildingId: string;
  room: string;
  cat: string;
  desc: string;
  status: "Open" | "In Progress" | "Resolved";
  note?: string;
  time: string;
}

export interface AuditLogItem {
  id: string;
  text: string;
  time: string;
}

export interface MessMenu {
  breakfast: string;
  lunch: string;
  dinner: string;
  baseYes: number;
}

// In-Memory Global State for ShunyOS Prototype Data
let memoryBuildings: BuildingItem[] = [
  {
    id: "b-a",
    pgId: "pg-royal",
    name: "Block A",
    type: "Boys",
    floors: [
      {
        id: "fl-a0",
        name: "Ground",
        rooms: [
          {
            id: "r-g01",
            number: "G-01",
            sharing: 2,
            rent: 8500,
            beds: [
              {
                id: "bed-1",
                label: "Bed A",
                occupied: true,
                tenant: {
                  id: "t-rahul",
                  pgId: "pg-royal",
                  name: "Rahul Sharma",
                  phone: "9876543210",
                  parentPhone: "9811122233",
                  college: "Amity University",
                  joinDate: "01 Aug 2026",
                  deposit: 8500,
                  rentPaid: false,
                  kycStatus: "Pending",
                },
              },
              { id: "bed-2", label: "Bed B", occupied: false, tenant: null },
            ],
          },
          {
            id: "r-g02",
            number: "G-02",
            sharing: 2,
            rent: 8500,
            beds: [
              {
                id: "bed-3",
                label: "Bed A",
                occupied: true,
                tenant: {
                  id: "t-aman",
                  pgId: "pg-royal",
                  name: "Aman Verma",
                  phone: "9876500112",
                  parentPhone: "9822334455",
                  college: "TCS Sector 62",
                  joinDate: "15 Jul 2026",
                  deposit: 8500,
                  rentPaid: true,
                  kycStatus: "Verified",
                },
              },
              {
                id: "bed-4",
                label: "Bed B",
                occupied: true,
                tenant: {
                  id: "t-karan",
                  pgId: "pg-royal",
                  name: "Karan Mehta",
                  phone: "9811998877",
                  parentPhone: "9811009988",
                  college: "JIIT Noida",
                  joinDate: "10 Sep 2026",
                  deposit: 8500,
                  rentPaid: false,
                  kycStatus: "Pending",
                },
              },
            ],
          },
        ],
      },
      {
        id: "fl-a1",
        name: "1st Floor",
        rooms: [
          {
            id: "r-101",
            number: "101",
            sharing: 3,
            rent: 7500,
            beds: [
              {
                id: "bed-5",
                label: "Bed A",
                occupied: true,
                tenant: {
                  id: "t-devansh",
                  pgId: "pg-royal",
                  name: "Devansh Singh",
                  phone: "9911223344",
                  parentPhone: "9911556677",
                  college: "Galgotias Univ",
                  joinDate: "05 Aug 2026",
                  deposit: 7500,
                  rentPaid: true,
                  kycStatus: "Verified",
                },
              },
              { id: "bed-6", label: "Bed B", occupied: false, tenant: null },
              { id: "bed-7", label: "Bed C", occupied: false, tenant: null },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "b-k",
    pgId: "pg-krishna",
    name: "Krishna Bhawan",
    type: "Girls",
    floors: [
      {
        id: "fl-k0",
        name: "Ground",
        rooms: [
          {
            id: "r-k01",
            number: "G-01",
            sharing: 2,
            rent: 9500,
            beds: [
              {
                id: "bed-8",
                label: "Bed A",
                occupied: true,
                tenant: {
                  id: "t-priya",
                  pgId: "pg-krishna",
                  name: "Priya Nair",
                  phone: "9818112233",
                  parentPhone: "9818776655",
                  college: "Infosys Gurugram",
                  joinDate: "12 Aug 2026",
                  deposit: 9500,
                  rentPaid: true,
                  kycStatus: "Verified",
                },
              },
              { id: "bed-9", label: "Bed B", occupied: false, tenant: null },
            ],
          },
        ],
      },
    ],
  },
];

let memoryExpenses: ExpenseItem[] = [
  { id: "e1", category: "Electricity Bill", amount: 14500, scope: "All Buildings", date: "10 Nov 2026" },
  { id: "e2", category: "Mess Ration & Gas", amount: 18000, scope: "Block A", date: "08 Nov 2026" },
  { id: "e3", category: "Staff Salary", amount: 12000, scope: "All Buildings", date: "05 Nov 2026" },
];

let memoryUpiApprovals: UpiApprovalItem[] = [
  {
    id: "u-rahul",
    tenantId: "t-rahul",
    tenantName: "Rahul Sharma",
    room: "Block A • G-01",
    amount: 8500,
    utr: "UTR40929910",
    status: "Pending",
    time: "14 mins ago",
  },
];

let memoryStaffList: StaffItem[] = [
  {
    id: "st-1",
    name: "Ramesh Verma",
    phone: "9810011223",
    assignedBuildingIds: ["b-a"],
    permissions: {
      manage_tenants: true,
      collect_cash: true,
      resolve_complaints: true,
      manage_mess: true,
      issue_passes: true,
    },
  },
];

let memoryComplaints: ComplaintItem[] = [
  {
    id: "T-209",
    tenantId: "t-rahul",
    tenantName: "Rahul Sharma",
    buildingId: "b-a",
    room: "Block A • G-01",
    cat: "Wi-Fi",
    desc: "Router speed drops after 10:30 PM in Room G-01",
    status: "In Progress",
    note: "Technician assigned for 5:00 PM",
    time: "2 hrs ago",
  },
  {
    id: "T-210",
    tenantId: "t-karan",
    tenantName: "Karan Mehta",
    buildingId: "b-a",
    room: "Block A • G-02",
    cat: "Plumbing",
    desc: "Washroom tap leaking continuously",
    status: "Open",
    note: "",
    time: "40 mins ago",
  },
];

let memoryAuditLogs: AuditLogItem[] = [
  { id: "a1", text: "Warden Ramesh Verma issued Day Pass GP-108 for Karan Mehta (Pending Owner Approval)", time: "10 mins ago" },
  { id: "a2", text: "Warden Ramesh Verma saved Block A morning attendance (3 Present, 1 Night Pass)", time: "5 hrs ago" },
];

let memoryMessMenu: MessMenu = {
  breakfast: "Aloo Paratha, Curd & Ginger Tea (8:00 - 9:30 AM)",
  lunch: "Rajma Chawal, Mix Veg & Roti (1:00 - 2:30 PM)",
  dinner: "Paneer Butter Masala, Dal Tadka & Roti (8:00 - 10:00 PM)",
  baseYes: 34,
};

// --- DATA ACCESS FUNCTIONS ---

export async function getAllBuildings(selectedBuildingId?: string | null): Promise<BuildingItem[]> {
  try {
    const supabase = await createClient();
    // Attempt Supabase query if buildings table exists
    const { data: dbBuildings } = await supabase.from("buildings").select("*");
    if (dbBuildings && dbBuildings.length > 0) {
      // Map database buildings or complement with in-memory beds
    }
  } catch {
    // Keep in-memory fallback
  }

  if (!selectedBuildingId || selectedBuildingId === "all") {
    return memoryBuildings;
  }
  return memoryBuildings.filter((b) => b.id === selectedBuildingId);
}

export function computePropertyStats(selectedBuildingId?: string | null) {
  const bldgs = (!selectedBuildingId || selectedBuildingId === "all")
    ? memoryBuildings
    : memoryBuildings.filter((b) => b.id === selectedBuildingId);

  let total = 0;
  let occupied = 0;
  let expected = 0;
  let collected = 0;

  bldgs.forEach((b) => {
    b.floors.forEach((f) => {
      f.rooms.forEach((r) => {
        r.beds.forEach((bed) => {
          total++;
          if (bed.occupied && bed.tenant) {
            occupied++;
            expected += r.rent;
            if (bed.tenant.rentPaid) {
              collected += r.rent;
            }
          }
        });
      });
    });
  });

  const vacant = total - occupied;
  const pending = Math.max(0, expected - collected);

  return { total, occupied, vacant, expected, collected, pending };
}

export function getAllOccupiedBeds(selectedBuildingId?: string | null) {
  const bldgs = (!selectedBuildingId || selectedBuildingId === "all")
    ? memoryBuildings
    : memoryBuildings.filter((b) => b.id === selectedBuildingId);

  const results: {
    building: BuildingItem;
    floor: FloorItem;
    floorIdx: number;
    room: RoomItem;
    bed: BedItem;
    bedIdx: number;
    tenant: TenantProfileItem;
  }[] = [];

  bldgs.forEach((b) => {
    b.floors.forEach((f, fIdx) => {
      f.rooms.forEach((r) => {
        r.beds.forEach((bed, bIdx) => {
          if (bed.occupied && bed.tenant) {
            results.push({
              building: b,
              floor: f,
              floorIdx: fIdx,
              room: r,
              bed,
              bedIdx: bIdx,
              tenant: bed.tenant,
            });
          }
        });
      });
    });
  });

  return results;
}

export function getBedDetails(buildingId: string, floorIdx: number, roomId: string, bedIdx: number) {
  const building = memoryBuildings.find((b) => b.id === buildingId);
  if (!building) return null;
  const floor = building.floors[floorIdx];
  if (!floor) return null;
  const room = floor.rooms.find((r) => r.id === roomId);
  if (!room) return null;
  const bed = room.beds[bedIdx];
  if (!bed) return null;

  return { building, floor, room, bed };
}

// --- MUTATION ACTIONS ---

export async function addAutoBuilding(data: {
  name: string;
  type: string;
  floorsCount: number;
  roomsPerFloor: number;
  sharing: number;
  rent: number;
}) {
  const bId = `b-${Date.now()}`;
  const floors: FloorItem[] = [];

  for (let f = 0; f < data.floorsCount; f++) {
    const floorName = f === 0 ? "Ground" : `${f}th Floor`;
    const rooms: RoomItem[] = [];

    for (let r = 1; r <= data.roomsPerFloor; r++) {
      const roomNum = f === 0 ? `G-0${r}` : `${f}0${r}`;
      const beds: BedItem[] = [];

      for (let b = 0; b < data.sharing; b++) {
        beds.push({
          id: `bed-${bId}-${f}-${r}-${b}`,
          label: `Bed ${String.fromCharCode(65 + b)}`,
          occupied: false,
          tenant: null,
        });
      }

      rooms.push({
        id: `rm-${bId}-${f}-${r}`,
        number: roomNum,
        sharing: data.sharing,
        rent: data.rent,
        beds,
      });
    }

    floors.push({
      id: `fl-${bId}-${f}`,
      name: floorName,
      rooms,
    });
  }

  const newBuilding: BuildingItem = {
    id: bId,
    pgId: "pg-royal",
    name: data.name,
    type: data.type,
    floors,
  };

  memoryBuildings.push(newBuilding);
  return { success: true, building: newBuilding };
}

export async function addFloor(buildingId: string, name: string, initialRooms: number) {
  const b = memoryBuildings.find((x) => x.id === buildingId);
  if (!b) return { error: "Building not found" };

  const fIdx = b.floors.length;
  const rooms: RoomItem[] = [];

  for (let r = 1; r <= initialRooms; r++) {
    rooms.push({
      id: `rm-${buildingId}-${fIdx}-${r}`,
      number: `${fIdx * 100 + r}`,
      sharing: 2,
      rent: 8500,
      beds: [
        { id: `bed-${Date.now()}-1`, label: "Bed A", occupied: false, tenant: null },
        { id: `bed-${Date.now()}-2`, label: "Bed B", occupied: false, tenant: null },
      ],
    });
  }

  b.floors.push({
    id: `fl-${buildingId}-${fIdx}`,
    name,
    rooms,
  });

  return { success: true };
}

export async function addRoom(
  buildingId: string,
  floorIdx: number,
  mode: "single" | "bulk",
  data: { roomNumber?: string; startNo?: number; endNo?: number; sharing: number; rent: number }
) {
  const b = memoryBuildings.find((x) => x.id === buildingId);
  if (!b || !b.floors[floorIdx]) return { error: "Floor not found" };

  const floor = b.floors[floorIdx];

  const createBeds = (roomId: string, count: number) => {
    const beds: BedItem[] = [];
    for (let i = 0; i < count; i++) {
      beds.push({
        id: `bed-${roomId}-${i}`,
        label: `Bed ${String.fromCharCode(65 + i)}`,
        occupied: false,
        tenant: null,
      });
    }
    return beds;
  };

  if (mode === "single") {
    const num = data.roomNumber || `${(floorIdx + 1) * 100 + floor.rooms.length + 1}`;
    const rId = `rm-${buildingId}-${floorIdx}-${Date.now()}`;
    floor.rooms.push({
      id: rId,
      number: num,
      sharing: data.sharing,
      rent: data.rent,
      beds: createBeds(rId, data.sharing),
    });
  } else {
    const start = data.startNo || 101;
    const end = data.endNo || 104;
    for (let n = start; n <= end; n++) {
      const rId = `rm-${buildingId}-${floorIdx}-${n}`;
      floor.rooms.push({
        id: rId,
        number: `${n}`,
        sharing: data.sharing,
        rent: data.rent,
        beds: createBeds(rId, data.sharing),
      });
    }
  }

  return { success: true };
}

export async function addBed(buildingId: string, floorIdx: number, roomId: string, label: string) {
  const b = memoryBuildings.find((x) => x.id === buildingId);
  if (!b) return { error: "Building not found" };
  const room = b.floors[floorIdx]?.rooms.find((r) => r.id === roomId);
  if (!room) return { error: "Room not found" };

  room.beds.push({
    id: `bed-${Date.now()}`,
    label,
    occupied: false,
    tenant: null,
  });

  return { success: true };
}

export async function walkInAddTenant(
  buildingId: string,
  floorIdx: number,
  roomId: string,
  bedIdx: number,
  data: { name: string; phone: string; joinDate: string; rentPaid: boolean }
) {
  const b = memoryBuildings.find((x) => x.id === buildingId);
  if (!b) return { error: "Building not found" };
  const room = b.floors[floorIdx]?.rooms.find((r) => r.id === roomId);
  if (!room) return { error: "Room not found" };
  const bed = room.beds[bedIdx];
  if (!bed) return { error: "Bed not found" };

  const newTenant: TenantProfileItem = {
    id: `t-${Date.now()}`,
    pgId: b.pgId,
    name: data.name,
    phone: data.phone,
    parentPhone: "9811002233",
    college: "Walk-In Resident",
    joinDate: data.joinDate,
    deposit: room.rent,
    rentPaid: data.rentPaid,
    kycStatus: "Pending",
  };

  bed.occupied = true;
  bed.tenant = newTenant;

  memoryAuditLogs.unshift({
    id: `a-${Date.now()}`,
    text: `Walk-in tenant ${data.name} assigned to ${b.name} Room ${room.number} (${bed.label})`,
    time: "Just now",
  });

  return { success: true, tenant: newTenant };
}

export async function vacateBed(buildingId: string, floorIdx: number, roomId: string, bedIdx: number) {
  const b = memoryBuildings.find((x) => x.id === buildingId);
  if (!b) return { error: "Building not found" };
  const room = b.floors[floorIdx]?.rooms.find((r) => r.id === roomId);
  if (!room) return { error: "Room not found" };
  const bed = room.beds[bedIdx];
  if (!bed) return { error: "Bed not found" };

  const oldTenant = bed.tenant;
  bed.occupied = false;
  bed.tenant = null;

  if (oldTenant) {
    memoryAuditLogs.unshift({
      id: `a-${Date.now()}`,
      text: `Bed vacated for ${oldTenant.name} from ${b.name} Room ${room.number} (${bed.label})`,
      time: "Just now",
    });
  }

  return { success: true };
}

export async function verifyTenantKyc(tenantId: string) {
  memoryBuildings.forEach((b) => {
    b.floors.forEach((f) => {
      f.rooms.forEach((r) => {
        r.beds.forEach((bed) => {
          if (bed.tenant && bed.tenant.id === tenantId) {
            bed.tenant.kycStatus = "Verified";
          }
        });
      });
    });
  });

  return { success: true };
}

export async function markBedRentPaid(tenantId: string) {
  memoryBuildings.forEach((b) => {
    b.floors.forEach((f) => {
      f.rooms.forEach((r) => {
        r.beds.forEach((bed) => {
          if (bed.tenant && bed.tenant.id === tenantId) {
            bed.tenant.rentPaid = true;
          }
        });
      });
    });
  });

  return { success: true };
}

// --- LEDGER & EXPENSES ---

export async function getExpenses() {
  return memoryExpenses;
}

export async function logExpense(category: string, amount: number, scope: string) {
  const newExp: ExpenseItem = {
    id: `e-${Date.now()}`,
    category,
    amount,
    scope,
    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  };
  memoryExpenses.unshift(newExp);
  return { success: true, expense: newExp };
}

export async function getUpiApprovals() {
  return memoryUpiApprovals;
}

export async function approveUpiPayment(id: string) {
  const upi = memoryUpiApprovals.find((u) => u.id === id);
  if (upi) {
    upi.status = "Approved";
    markBedRentPaid(upi.tenantId);
  }
  return { success: true };
}

export async function rejectUpiPayment(id: string) {
  const upi = memoryUpiApprovals.find((u) => u.id === id);
  if (upi) {
    upi.status = "Rejected";
  }
  return { success: true };
}

// --- STAFF & OPS ---

export async function getStaffList() {
  return memoryStaffList;
}

export async function toggleStaffPermission(staffId: string, permKey: string) {
  const staff = memoryStaffList.find((s) => s.id === staffId);
  if (staff && permKey in staff.permissions) {
    const k = permKey as keyof typeof staff.permissions;
    staff.permissions[k] = !staff.permissions[k];
  }
  return { success: true, staff };
}

export async function getComplaints() {
  return memoryComplaints;
}

export async function resolveComplaint(id: string, note?: string) {
  const comp = memoryComplaints.find((c) => c.id === id);
  if (comp) {
    comp.status = "Resolved";
    comp.note = note || "Resolved by Staff";
  }
  return { success: true };
}

export async function getMessMenu() {
  return memoryMessMenu;
}

export async function updateMessMenu(data: Partial<MessMenu>) {
  memoryMessMenu = { ...memoryMessMenu, ...data };
  return { success: true, messMenu: memoryMessMenu };
}

export async function getAuditLogs() {
  return memoryAuditLogs;
}
