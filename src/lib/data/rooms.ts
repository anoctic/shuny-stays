// ==============================================================================
// Shuny Stays Rooms, Buildings, Floors, Beds & Ledger Data Store
// Connects to Supabase tables with live in-memory store matching UI design blueprint
// ==============================================================================

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserSession } from "@/lib/auth/session";

// Safe deep-clone helper to prevent cross-request memory mutation in shared worker isolates
function deepClone<T>(obj: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

export interface TenantProfileItem {
  id: string;
  pgId: string;
  name: string;
  phone: string;
  parentPhone: string;
  college: string;
  joinDate: string;
  deposit: number;
  depositStatus: "paid" | "pending" | "refunded" | "partially_refunded";
  depositPaymentMode?: "cash" | "upi" | "bank_transfer";
  depositCollectedBy?: string;
  depositCollectedByName?: string;
  depositCollectedAt?: string;
  depositDeduction?: number;
  depositDeductionReason?: string;
  depositRefundedAmount?: number;
  depositRefundedAt?: string;
  depositReceiptNo?: string;
  rentPaid: boolean;
  kycStatus: "Verified" | "Pending";
}

export interface SecurityDepositItem {
  id: string; // e.g. "DEP-202611-001"
  pgId: string;
  buildingId: string;
  buildingName: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  bedLabel: string;
  expectedAmount: number;
  paidAmount: number;
  status: "pending" | "paid" | "refunded" | "partially_refunded";
  paymentMode: "cash" | "upi" | "bank_transfer";
  transactionRef?: string;
  collectedBy?: string;
  collectedByName?: string;
  collectedAt?: string;
  deductionAmount: number;
  deductionReason?: string;
  refundedAmount: number;
  refundedAt?: string;
  refundedByName?: string;
  createdAt: string;
}

export interface RentPaymentRecord {
  id: string; // e.g. "INV-202611-01"
  pgId: string;
  buildingId: string;
  tenantId: string;
  tenantName: string;
  room: string;
  billingMonth: string;
  amount: number;
  status: "collected_by_admin" | "settled_with_owner" | "pending" | "paid" | "verified";
  paymentMode: "cash" | "admin_upi" | "pg_bank_upi" | "upi" | "bank_transfer";
  transactionRef?: string;
  collectedBy?: string;
  collectedByName?: string;
  collectedByRole?: "owner" | "admin";
  collectedAt: string;
  settledAt?: string;
  settledBy?: string;
  settledByName?: string;
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
  buildingId?: string;
  room: string;
  cat?: string;
  category?: string;
  desc?: string;
  issue?: string;
  priority?: string;
  status: "Open" | "In Progress" | "Resolved" | "Pending";
  note?: string;
  time: string;
}

export interface AuditLogItem {
  id: string;
  text: string;
  time: string;
}

export interface ReceiptItem {
  id: string;
  tenantId: string;
  tenantName: string;
  pgId: string;
  room: string;
  month: string;
  amount: number;
  utr: string;
  date: string;
}

export interface MessMenu {
  breakfast: string;
  lunch: string;
  snacks?: string;
  dinner: string;
  baseYes: number;
  updatedAt?: string;
}

// In-Memory Global State for Shuny Stays Prototype Data
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
                  depositStatus: "paid",
                  depositPaymentMode: "upi",
                  depositCollectedByName: "Warden Ramesh Verma",
                  depositCollectedAt: "01 Nov 2026, 10:00 AM",
                  depositReceiptNo: "DEP-202611-001",
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
                  depositStatus: "paid",
                  depositPaymentMode: "cash",
                  depositCollectedByName: "Owner Manoj Kumar",
                  depositCollectedAt: "01 Nov 2026, 12:30 PM",
                  depositReceiptNo: "DEP-202611-002",
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
                  depositStatus: "pending",
                  depositPaymentMode: "cash",
                  depositReceiptNo: "DEP-202611-003",
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
                  depositStatus: "paid",
                  depositPaymentMode: "bank_transfer",
                  depositCollectedByName: "Owner Manoj Kumar",
                  depositCollectedAt: "05 Aug 2026",
                  depositReceiptNo: "DEP-202608-001",
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
                  depositStatus: "paid",
                  depositPaymentMode: "upi",
                  depositCollectedByName: "Warden Sunita Devi",
                  depositCollectedAt: "12 Aug 2026",
                  depositReceiptNo: "DEP-202608-002",
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
  snacks: "Tea, Biscuits & Samosa (5:00 - 6:00 PM)",
  dinner: "Paneer Butter Masala, Dal Tadka & Roti (8:00 - 10:00 PM)",
  baseYes: 34,
};

let memorySecurityDeposits: SecurityDepositItem[] = [
  {
    id: "DEP-202611-001",
    pgId: "pg-royal",
    buildingId: "b-a",
    buildingName: "Block A",
    tenantId: "t-rahul",
    tenantName: "Rahul Sharma",
    roomNumber: "G-01",
    bedLabel: "Bed A",
    expectedAmount: 8500,
    paidAmount: 8500,
    status: "paid",
    paymentMode: "upi",
    transactionRef: "UPI-DEP-99410",
    collectedByName: "Warden Ramesh Verma",
    collectedAt: "01 Nov 2026, 10:00 AM",
    deductionAmount: 0,
    refundedAmount: 0,
    createdAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "DEP-202611-002",
    pgId: "pg-royal",
    buildingId: "b-a",
    buildingName: "Block A",
    tenantId: "t-aman",
    tenantName: "Aman Verma",
    roomNumber: "G-02",
    bedLabel: "Bed A",
    expectedAmount: 8500,
    paidAmount: 8500,
    status: "paid",
    paymentMode: "cash",
    collectedByName: "Owner Manoj Kumar",
    collectedAt: "01 Nov 2026, 12:30 PM",
    deductionAmount: 0,
    refundedAmount: 0,
    createdAt: "2026-11-01T12:30:00Z",
  },
  {
    id: "DEP-202611-003",
    pgId: "pg-royal",
    buildingId: "b-a",
    buildingName: "Block A",
    tenantId: "t-karan",
    tenantName: "Karan Mehta",
    roomNumber: "G-02",
    bedLabel: "Bed B",
    expectedAmount: 8500,
    paidAmount: 0,
    status: "pending",
    paymentMode: "cash",
    deductionAmount: 0,
    refundedAmount: 0,
    createdAt: "2026-11-01T12:35:00Z",
  },
  {
    id: "DEP-202608-001",
    pgId: "pg-royal",
    buildingId: "b-a",
    buildingName: "Block A",
    tenantId: "t-devansh",
    tenantName: "Devansh Singh",
    roomNumber: "101",
    bedLabel: "Bed A",
    expectedAmount: 7500,
    paidAmount: 7500,
    status: "paid",
    paymentMode: "bank_transfer",
    collectedByName: "Owner Manoj Kumar",
    collectedAt: "05 Aug 2026, 02:00 PM",
    deductionAmount: 0,
    refundedAmount: 0,
    createdAt: "2026-08-05T14:00:00Z",
  },
  {
    id: "DEP-202608-002",
    pgId: "pg-krishna",
    buildingId: "b-k",
    buildingName: "Krishna Bhawan",
    tenantId: "t-priya",
    tenantName: "Priya Nair",
    roomNumber: "G-01",
    bedLabel: "Bed A",
    expectedAmount: 9500,
    paidAmount: 9500,
    status: "paid",
    paymentMode: "upi",
    collectedByName: "Warden Sunita Devi",
    collectedAt: "12 Aug 2026, 11:15 AM",
    deductionAmount: 0,
    refundedAmount: 0,
    createdAt: "2026-08-12T11:15:00Z",
  },
];

let memoryRentPayments: RentPaymentRecord[] = [
  {
    id: "INV-202611-01",
    pgId: "pg-royal",
    buildingId: "b-a",
    tenantId: "t-aman",
    tenantName: "Aman Verma",
    room: "Block A • Room G-02",
    billingMonth: "November 2026",
    amount: 8500,
    status: "settled_with_owner",
    paymentMode: "cash",
    collectedByName: "Warden Suresh",
    collectedByRole: "admin",
    collectedAt: "15 Nov 2026, 11:00 AM",
    settledAt: "15 Nov 2026, 06:00 PM",
    settledByName: "Owner Manoj Kumar",
  },
  {
    id: "INV-202611-02",
    pgId: "pg-royal",
    buildingId: "b-a",
    tenantId: "t-devansh",
    tenantName: "Devansh Singh",
    room: "Block A • Room 101",
    billingMonth: "November 2026",
    amount: 7500,
    status: "settled_with_owner",
    paymentMode: "pg_bank_upi",
    collectedByName: "Owner Manoj Kumar",
    collectedByRole: "owner",
    collectedAt: "12 Nov 2026, 09:30 AM",
    settledAt: "12 Nov 2026, 09:30 AM",
    settledByName: "Owner Manoj Kumar",
  },
  {
    id: "INV-202611-03",
    pgId: "pg-krishna",
    buildingId: "b-k",
    tenantId: "t-priya",
    tenantName: "Priya Nair",
    room: "Krishna Bhawan • Room G-01",
    billingMonth: "November 2026",
    amount: 9500,
    status: "settled_with_owner",
    paymentMode: "admin_upi",
    collectedByName: "Warden Sunita Devi",
    collectedByRole: "admin",
    collectedAt: "10 Nov 2026, 04:15 PM",
    settledAt: "10 Nov 2026, 08:00 PM",
    settledByName: "Owner Manoj Kumar",
  },
  {
    id: "INV-202611-04",
    pgId: "pg-royal",
    buildingId: "b-a",
    tenantId: "t-rahul",
    tenantName: "Rahul Sharma",
    room: "Block A • Room G-01",
    billingMonth: "November 2026",
    amount: 8500,
    status: "collected_by_admin",
    paymentMode: "cash",
    collectedByName: "Warden Suresh",
    collectedByRole: "admin",
    collectedAt: "Today, 11:30 AM",
  },
  {
    id: "INV-202611-05",
    pgId: "pg-royal",
    buildingId: "b-a",
    tenantId: "t-karan",
    tenantName: "Karan Mehta",
    room: "Block A • Room G-02",
    billingMonth: "November 2026",
    amount: 8500,
    status: "collected_by_admin",
    paymentMode: "cash",
    collectedByName: "Warden Suresh",
    collectedByRole: "admin",
    collectedAt: "Yesterday, 06:15 PM",
  },
];

// --- DATA ACCESS FUNCTIONS ---

export async function getAllBuildings(selectedBuildingId?: string | null): Promise<BuildingItem[]> {
  try {
    const session = await getCurrentUserSession();
    const admin = createAdminClient();
    let query = admin.from("buildings").select(`
      id, pg_id, name, gender_type,
      floors (
        id, floor_number, floor_name,
        rooms (
          id, room_number, sharing_type, base_rent_monthly,
          beds (
            id, bed_name, status, monthly_rent,
            tenants (
              id, full_name, phone, emergency_contact_phone, work_or_college, check_in_date, rent_amount, deposit_amount, is_active
            )
          )
        )
      )
    `);

    // If owner or admin with assigned pg_id, scope to their PG
    if (session.pg_id && session.role !== "super_admin") {
      query = query.eq("pg_id", session.pg_id);
    }

    if (selectedBuildingId && selectedBuildingId !== "all") {
      query = query.eq("id", selectedBuildingId);
    }

    const { data: dbBuildings, error } = await query;
    if (error) {
      console.error("Supabase query error in getAllBuildings:", error);
    }
    if (dbBuildings && dbBuildings.length > 0) {
      return dbBuildings.map((b: any) => {
        const sortedFloors = (b.floors || []).sort(
          (f1: any, f2: any) => (f1.floor_number ?? 0) - (f2.floor_number ?? 0)
        );

        return {
          id: b.id,
          pgId: b.pg_id,
          name: b.name,
          type: b.gender_type === "boys" ? "Boys Hostel" : b.gender_type === "girls" ? "Girls Hostel" : "Co-living PG",
          floors: sortedFloors.map((f: any) => {
            const sortedRooms = (f.rooms || []).sort((r1: any, r2: any) =>
              String(r1.room_number).localeCompare(String(r2.room_number), undefined, { numeric: true })
            );

            return {
              id: f.id,
              name: f.floor_name || `Floor ${f.floor_number}`,
              rooms: sortedRooms.map((r: any) => {
                const sortedBeds = (r.beds || []).sort((b1: any, b2: any) =>
                  String(b1.bed_name).localeCompare(String(b2.bed_name))
                );

                return {
                  id: r.id,
                  number: r.room_number,
                  sharing: r.sharing_type,
                  rent: Number(r.base_rent_monthly) || 0,
                  beds: sortedBeds.map((bed: any) => {
                    const rawTenant = Array.isArray(bed.tenants) ? bed.tenants[0] : bed.tenants;
                    const isOccupied = bed.status === "occupied" || !!rawTenant;

                    let tenantProfile: TenantProfileItem | null = null;
                    if (rawTenant) {
                      tenantProfile = {
                        id: rawTenant.id,
                        pgId: b.pg_id,
                        name: rawTenant.full_name,
                        phone: rawTenant.phone,
                        parentPhone: rawTenant.emergency_contact_phone || "",
                        college: rawTenant.work_or_college || "",
                        joinDate: rawTenant.check_in_date || "2026-08-01",
                        deposit: Number(rawTenant.deposit_amount) || 0,
                        depositStatus: "paid",
                        rentPaid: true,
                        kycStatus: "Verified",
                      };
                    }

                    return {
                      id: bed.id,
                      label: bed.bed_name,
                      occupied: isOccupied,
                      tenant: tenantProfile,
                    };
                  }),
                };
              }),
            };
          }),
        };
      });
    }
  } catch (err) {
    console.error("Error fetching live buildings from Supabase:", err);
  }

  return [];
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

  return deepClone({ building, floor, room, bed });
}

// --- MUTATION ACTIONS ---

export async function addAutoBuilding(data: {
  pgId?: string | null;
  name: string;
  type: string;
  floorsCount: number;
  roomsPerFloor: number;
  sharing: number;
  rent: number;
}) {
  try {
    const admin = createAdminClient();
    const bId = crypto.randomUUID();

    // Determine target pgId
    let targetPgId: string = data.pgId || "";
    if (!targetPgId) {
      const { data: firstPg } = await (admin.from("pgs" as any) as any)
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      targetPgId = firstPg?.id || "23594b9e-da90-4884-95aa-5f978d91a0d2";
    }

    // Map gender_type ('boys' | 'girls' | 'coliving')
    let genderType: "boys" | "girls" | "coliving" = "coliving";
    const rawType = (data.type || "").toLowerCase();
    if (rawType.includes("boy")) {
      genderType = "boys";
    } else if (rawType.includes("girl")) {
      genderType = "girls";
    }

    const floorsCount = Math.max(1, Math.min(10, data.floorsCount || 3));
    const roomsPerFloor = Math.max(1, Math.min(50, data.roomsPerFloor || 3));
    const sharing = Math.max(1, Math.min(10, data.sharing || 2));
    const rent = Math.max(0, data.rent || 8500);

    // 1. Insert building record into Supabase
    const { error: bErr } = await (admin.from("buildings" as any) as any).insert({
      id: bId,
      pg_id: targetPgId,
      name: data.name.trim(),
      gender_type: genderType,
      address: `${data.name.trim()}, Silicon Valley Road`,
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      total_floors: floorsCount,
      amenities: ["High-speed Wi-Fi", "24/7 Power Backup", "RO Water", "Daily Housekeeping"],
    } as any);

    if (bErr) {
      console.error("addAutoBuilding insert building error:", bErr);
      return { error: `Failed to insert building: ${bErr.message || JSON.stringify(bErr)}` };
    }

    // 2. Generate and batch insert floors into Supabase
    const floorsToInsert: any[] = [];
    const floorsStructure: FloorItem[] = [];

    for (let f = 0; f < floorsCount; f++) {
      const fId = crypto.randomUUID();
      const floorName =
        f === 0
          ? "Ground Floor"
          : f === 1
          ? "1st Floor"
          : f === 2
          ? "2nd Floor"
          : f === 3
          ? "3rd Floor"
          : `${f}th Floor`;

      floorsToInsert.push({
        id: fId,
        pg_id: targetPgId,
        building_id: bId,
        floor_number: f,
        floor_name: floorName,
      });
    }

    const { error: fErr } = await (admin.from("floors" as any) as any).insert(floorsToInsert);
    if (fErr) {
      console.error("addAutoBuilding insert floors error:", fErr);
      return { error: `Failed to insert floors: ${fErr.message || JSON.stringify(fErr)}` };
    }

    // 3. Generate and batch insert rooms into Supabase
    // (Postgres trigger trg_rooms_auto_create_beds will automatically create the vacant beds for each room!)
    const roomsToInsert: any[] = [];

    for (let f = 0; f < floorsCount; f++) {
      const floorRow = floorsToInsert[f];
      const floorRooms: RoomItem[] = [];

      for (let r = 1; r <= roomsPerFloor; r++) {
        const roomId = crypto.randomUUID();
        const roomNum = f === 0 ? (r < 10 ? `G-0${r}` : `G-${r}`) : `${f * 100 + r}`;

        roomsToInsert.push({
          id: roomId,
          pg_id: targetPgId,
          building_id: bId,
          floor_id: floorRow.id,
          room_number: roomNum,
          sharing_type: sharing,
          room_type: "standard",
          is_ac: false,
          has_attached_bathroom: true,
          has_balcony: false,
          base_rent_monthly: rent,
          default_deposit: rent,
        });

        const beds: BedItem[] = [];
        for (let b = 0; b < sharing; b++) {
          beds.push({
            id: `bed-${roomId}-${b}`,
            label: `Bed ${String.fromCharCode(65 + b)}`,
            occupied: false,
            tenant: null,
          });
        }

        floorRooms.push({
          id: roomId,
          number: roomNum,
          sharing,
          rent,
          beds,
        });
      }

      floorsStructure.push({
        id: floorRow.id,
        name: floorRow.floor_name,
        rooms: floorRooms,
      });
    }

    const { error: rErr } = await (admin.from("rooms" as any) as any).insert(roomsToInsert);
    if (rErr) {
      console.error("addAutoBuilding insert rooms error:", rErr);
      return { error: `Failed to insert rooms: ${rErr.message || JSON.stringify(rErr)}` };
    }

    const newBuilding: BuildingItem = {
      id: bId,
      pgId: targetPgId || "23594b9e-da90-4884-95aa-5f978d91a0d2",
      name: data.name.trim(),
      type: genderType === "boys" ? "Boys Hostel" : genderType === "girls" ? "Girls Hostel" : "Co-living PG",
      floors: floorsStructure,
    };

    memoryBuildings.push(newBuilding);
    return { success: true, building: newBuilding };
  } catch (err: any) {
    console.error("Unhandled error in addAutoBuilding:", err);
    return { error: `Building creation failed: ${err?.message || "Unknown error"}` };
  }
}

export async function addFloor(buildingId: string, name: string, initialRooms: number) {
  try {
    const admin = createAdminClient();

    const { data: bldg, error: bErr } = await (admin.from("buildings" as any) as any)
      .select("id, pg_id, total_floors")
      .eq("id", buildingId)
      .single();

    if (bErr || !bldg) {
      return { error: "Building not found in database." };
    }

    const { data: existingFloors } = await (admin.from("floors" as any) as any)
      .select("floor_number")
      .eq("building_id", buildingId);

    const maxFloorNum = (existingFloors || []).reduce(
      (max: number, fl: any) => Math.max(max, fl.floor_number ?? 0),
      -1
    );
    const nextFloorNum = maxFloorNum + 1;
    const floorId = crypto.randomUUID();
    const floorName = name.trim() || `${nextFloorNum}th Floor`;

    const { error: fErr } = await (admin.from("floors" as any) as any).insert({
      id: floorId,
      pg_id: bldg.pg_id,
      building_id: buildingId,
      floor_number: nextFloorNum,
      floor_name: floorName,
    } as any);

    if (fErr) {
      return { error: `Failed to add floor: ${fErr.message}` };
    }

    await (admin.from("buildings" as any) as any)
      .update({ total_floors: Math.max(bldg.total_floors || 0, nextFloorNum + 1) } as any)
      .eq("id", buildingId);

    if (initialRooms > 0) {
      const roomsToInsert: any[] = [];
      for (let r = 1; r <= initialRooms; r++) {
        const roomNum = nextFloorNum === 0 ? (r < 10 ? `G-0${r}` : `G-${r}`) : `${nextFloorNum * 100 + r}`;
        roomsToInsert.push({
          id: crypto.randomUUID(),
          pg_id: bldg.pg_id,
          building_id: buildingId,
          floor_id: floorId,
          room_number: roomNum,
          sharing_type: 2,
          room_type: "standard",
          base_rent_monthly: 8500,
          default_deposit: 8500,
        });
      }
      await (admin.from("rooms" as any) as any).insert(roomsToInsert);
    }

    const b = memoryBuildings.find((x) => x.id === buildingId);
    if (b) {
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
      b.floors.push({ id: floorId, name: floorName, rooms });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unhandled error in addFloor:", err);
    return { error: `Failed to add floor: ${err?.message || "Unknown error"}` };
  }
}

export async function addRoom(
  buildingId: string,
  floorIdx: number,
  mode: "single" | "bulk",
  data: { roomNumber?: string; startNo?: number; endNo?: number; sharing: number; rent: number }
) {
  try {
    const admin = createAdminClient();

    const { data: bldg, error: bErr } = await (admin.from("buildings" as any) as any)
      .select("id, pg_id")
      .eq("id", buildingId)
      .single();

    if (bErr || !bldg) return { error: "Building not found in database." };

    const { data: floorList } = await (admin.from("floors" as any) as any)
      .select("id, floor_number")
      .eq("building_id", buildingId)
      .order("floor_number", { ascending: true });

    const targetFloor = (floorList || [])[floorIdx] || (floorList || [])[0];
    if (!targetFloor) return { error: "Floor not found in database." };

    const roomsToInsert: any[] = [];
    if (mode === "single") {
      const roomNum = data.roomNumber?.trim() || `${(targetFloor.floor_number + 1) * 100 + 1}`;
      roomsToInsert.push({
        id: crypto.randomUUID(),
        pg_id: bldg.pg_id,
        building_id: buildingId,
        floor_id: targetFloor.id,
        room_number: roomNum,
        sharing_type: data.sharing,
        room_type: "standard",
        base_rent_monthly: data.rent,
        default_deposit: data.rent,
      });
    } else {
      const start = data.startNo || 101;
      const end = data.endNo || 104;
      for (let n = start; n <= end; n++) {
        roomsToInsert.push({
          id: crypto.randomUUID(),
          pg_id: bldg.pg_id,
          building_id: buildingId,
          floor_id: targetFloor.id,
          room_number: `${n}`,
          sharing_type: data.sharing,
          room_type: "standard",
          base_rent_monthly: data.rent,
          default_deposit: data.rent,
        });
      }
    }

    const { error: rErr } = await (admin.from("rooms" as any) as any).insert(roomsToInsert);
    if (rErr) {
      return { error: `Failed to insert rooms: ${rErr.message}` };
    }

    const b = memoryBuildings.find((x) => x.id === buildingId);
    if (b && b.floors[floorIdx]) {
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
      roomsToInsert.forEach((r) => {
        floor.rooms.push({
          id: r.id,
          number: r.room_number,
          sharing: r.sharing_type,
          rent: r.base_rent_monthly,
          beds: createBeds(r.id, r.sharing_type),
        });
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unhandled error in addRoom:", err);
    return { error: `Failed to add room: ${err?.message || "Unknown error"}` };
  }
}

export async function addBed(buildingId: string, floorIdx: number, roomId: string, label: string) {
  try {
    const admin = createAdminClient();

    const { data: room, error: rErr } = await (admin.from("rooms" as any) as any)
      .select("id, pg_id, building_id, sharing_type, base_rent_monthly")
      .eq("id", roomId)
      .single();

    if (rErr || !room) return { error: "Room not found in database." };

    const { error: bedErr } = await (admin.from("beds" as any) as any).insert({
      id: crypto.randomUUID(),
      pg_id: room.pg_id,
      building_id: room.building_id,
      room_id: room.id,
      bed_name: label.trim() || `Bed ${room.sharing_type + 1}`,
      status: "vacant",
      monthly_rent: room.base_rent_monthly,
    } as any);

    if (bedErr) {
      return { error: `Failed to add bed: ${bedErr.message}` };
    }

    await (admin.from("rooms" as any) as any)
      .update({ sharing_type: Math.min(10, room.sharing_type + 1) } as any)
      .eq("id", roomId);

    const b = memoryBuildings.find((x) => x.id === buildingId);
    if (b) {
      const r = b.floors[floorIdx]?.rooms.find((x) => x.id === roomId);
      if (r) {
        r.beds.push({
          id: `bed-${Date.now()}`,
          label: label.trim() || `Bed ${r.beds.length + 1}`,
          occupied: false,
          tenant: null,
        });
        r.sharing = Math.min(10, r.sharing + 1);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unhandled error in addBed:", err);
    return { error: `Failed to add bed: ${err?.message || "Unknown error"}` };
  }
}

export async function walkInAddTenant(
  buildingId: string,
  floorIdx: number,
  roomId: string,
  bedIdx: number,
  data: {
    name: string;
    phone: string;
    joinDate: string;
    rentPaid: boolean;
    depositAmount?: number;
    depositStatus?: "paid" | "pending";
    depositPaymentMode?: "cash" | "upi" | "bank_transfer";
    depositRef?: string;
    collectorName?: string;
    collectorId?: string;
  }
) {
  const admin = createAdminClient();

  let targetBedId: string | null = null;
  let targetPgId: string | null = null;
  let roomRent = 8500;

  const { data: dbRoom } = await (admin.from("rooms" as any) as any)
    .select("id, pg_id, base_rent_monthly")
    .eq("id", roomId)
    .maybeSingle();

  if (dbRoom) {
    targetPgId = dbRoom.pg_id;
    roomRent = Number(dbRoom.base_rent_monthly) || 8500;

    const { data: dbBeds } = await (admin.from("beds" as any) as any)
      .select("id, status")
      .eq("room_id", roomId)
      .order("bed_name", { ascending: true });

    if (dbBeds && dbBeds[bedIdx]) {
      targetBedId = dbBeds[bedIdx].id;
    }
  }

  const tenantId = crypto.randomUUID();
  const depAmount = data.depositAmount ?? roomRent;
  const depStatus = data.depositStatus ?? "paid";

  if (targetPgId && targetBedId) {
    await (admin.from("tenants" as any) as any).insert({
      id: tenantId,
      pg_id: targetPgId,
      building_id: buildingId,
      room_id: roomId,
      bed_id: targetBedId,
      full_name: data.name.trim(),
      phone: data.phone.trim(),
      rent_amount: roomRent,
      deposit_amount: depAmount,
      check_in_date: new Date().toISOString().split("T")[0],
      is_active: true,
    } as any);

    await (admin.from("beds" as any) as any)
      .update({ status: "occupied" } as any)
      .eq("id", targetBedId);
  }

  const b = memoryBuildings.find((x) => x.id === buildingId);
  if (!b) return { success: true, tenantId };
  const room = b.floors[floorIdx]?.rooms.find((r) => r.id === roomId);
  if (!room) return { success: true, tenantId };
  const bed = room.beds[bedIdx];
  if (!bed) return { success: true, tenantId };

  const depMode = data.depositPaymentMode ?? "cash";
  const depReceiptNo = `DEP-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(100 + Math.random() * 900)}`;

  const newTenant: TenantProfileItem = {
    id: tenantId,
    pgId: b.pgId,
    name: data.name,
    phone: data.phone,
    parentPhone: "9811002233",
    college: "Walk-In Resident",
    joinDate: data.joinDate,
    deposit: depAmount,
    depositStatus: depStatus,
    depositPaymentMode: depMode,
    depositCollectedByName: depStatus === "paid" ? (data.collectorName || "Warden Staff") : undefined,
    depositCollectedAt: depStatus === "paid" ? new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : undefined,
    depositReceiptNo: depReceiptNo,
    rentPaid: data.rentPaid,
    kycStatus: "Pending",
  };

  bed.occupied = true;
  bed.tenant = newTenant;

  // Insert into security deposits list
  const newDeposit: SecurityDepositItem = {
    id: depReceiptNo,
    pgId: b.pgId,
    buildingId: b.id,
    buildingName: b.name,
    tenantId,
    tenantName: data.name,
    roomNumber: room.number,
    bedLabel: bed.label,
    expectedAmount: depAmount,
    paidAmount: depStatus === "paid" ? depAmount : 0,
    status: depStatus,
    paymentMode: depMode,
    transactionRef: data.depositRef,
    collectedByName: depStatus === "paid" ? (data.collectorName || "Warden Staff") : undefined,
    collectedAt: depStatus === "paid" ? new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : undefined,
    deductionAmount: 0,
    refundedAmount: 0,
    createdAt: new Date().toISOString(),
  };
  memorySecurityDeposits.unshift(newDeposit);

  // If rent is marked paid on walk-in, generate an invoice
  let invNo: string | undefined;
  if (data.rentPaid) {
    invNo = `INV-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRent: RentPaymentRecord = {
      id: invNo,
      pgId: b.pgId,
      buildingId: b.id,
      tenantId,
      tenantName: data.name,
      room: `${b.name} • Room ${room.number}`,
      billingMonth: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      amount: room.rent,
      status: "settled_with_owner",
      paymentMode: "cash",
      collectedByName: data.collectorName || "Staff Desk",
      collectedByRole: "owner",
      collectedAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      settledAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    memoryRentPayments.unshift(newRent);
  }

  // Live Supabase Sync (falls back gracefully)
  try {
    const supabase = await createClient();
    await (supabase.from("security_deposits" as any) as any).insert({
      pg_id: b.pgId,
      building_id: b.id,
      tenant_id: tenantId,
      expected_amount: depAmount,
      paid_amount: depStatus === "paid" ? depAmount : 0,
      status: depStatus,
      payment_mode: depMode,
      transaction_ref: data.depositRef || null,
      collected_by: data.collectorId || null,
      collected_by_name: depStatus === "paid" ? (data.collectorName || "Warden Staff") : null,
      collected_at: depStatus === "paid" ? new Date().toISOString() : null,
    } as any);

    if (data.rentPaid && invNo) {
      await (supabase.from("rent_payments" as any) as any).insert({
        pg_id: b.pgId,
        building_id: b.id,
        tenant_id: tenantId,
        tenant_name: data.name,
        room_number: `${b.name} • Room ${room.number}`,
        billing_month: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        amount: room.rent,
        status: "settled_with_owner",
        payment_mode: "cash",
        invoice_number: invNo,
        collected_by: data.collectorId || null,
        collected_by_name: data.collectorName || "Staff Desk",
        collected_by_role: "owner",
        collected_at: new Date().toISOString(),
        settled_at: new Date().toISOString(),
      } as any);
    }
  } catch (err) {
    // In-memory fallback
  }

  memoryAuditLogs.unshift({
    id: `a-${Date.now()}`,
    text: `Walk-in tenant ${data.name} assigned to ${b.name} Room ${room.number} (${bed.label}). Security Deposit: ₹${depAmount} (${depStatus}).`,
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

// --- SECURITY DEPOSIT FUNCTIONS ---

export async function getAllSecurityDeposits(pgId?: string, buildingId?: string): Promise<SecurityDepositItem[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("security_deposits")
      .select("*, buildings ( name ), tenants ( full_name )")
      .order("created_at", { ascending: false });

    if (buildingId && buildingId !== "all") {
      query = query.eq("building_id", buildingId);
    }

    const { data } = await query;
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        pgId: d.pg_id,
        buildingId: d.building_id,
        buildingName: d.buildings?.name || "Block A",
        tenantId: d.tenant_id,
        tenantName: d.tenants?.full_name || "Resident",
        roomNumber: "101",
        bedLabel: "Bed A",
        expectedAmount: Number(d.expected_amount) || 0,
        paidAmount: Number(d.paid_amount) || 0,
        status: d.status,
        paymentMode: d.payment_mode || "upi",
        transactionRef: d.transaction_ref,
        collectedBy: d.collected_by,
        collectedByName: d.collected_by_name || "Anoctic",
        collectedAt: d.collected_at || d.created_at,
        deductionAmount: Number(d.deduction_amount) || 0,
        deductionReason: d.deduction_reason,
        refundedAmount: Number(d.refunded_amount) || 0,
        refundedAt: d.refunded_at,
        createdAt: d.created_at,
      }));
    }
  } catch (err) {
    console.error("Error fetching security deposits from Supabase:", err);
  }

  return [];
}

export async function getSecurityDepositForTenant(tenantId: string): Promise<SecurityDepositItem | null> {
  if (!tenantId) return null;
  try {
    const supabase = await createClient();
    const { data: tenantData } = await (supabase.from("tenants" as any) as any)
      .select("id, full_name, room_id, bed_id, rooms(room_number), beds(bed_name), buildings(name)")
      .or(`id.eq.${tenantId},user_id.eq.${tenantId}`)
      .limit(1)
      .single();

    const actualTenantId = tenantData?.id || tenantId;

    const { data: d } = await (supabase.from("security_deposits" as any) as any)
      .select("*, buildings(name)")
      .eq("tenant_id", actualTenantId)
      .limit(1)
      .single();

    if (d) {
      return {
        id: d.id,
        pgId: d.pg_id,
        buildingId: d.building_id,
        buildingName: d.buildings?.name || tenantData?.buildings?.name || "Block A",
        tenantId: d.tenant_id,
        tenantName: tenantData?.full_name || "Resident",
        roomNumber: tenantData?.rooms?.room_number || "101",
        bedLabel: tenantData?.beds?.bed_name || "Bed A",
        expectedAmount: Number(d.expected_amount) || 0,
        paidAmount: Number(d.paid_amount) || 0,
        status: d.status,
        paymentMode: d.payment_mode || "upi",
        transactionRef: d.transaction_ref,
        collectedBy: d.collected_by,
        collectedByName: d.collected_by_name || "Management",
        collectedAt: d.collected_at || d.created_at,
        deductionAmount: Number(d.deduction_amount) || 0,
        deductionReason: d.deduction_reason,
        refundedAmount: Number(d.refunded_amount) || 0,
        refundedAt: d.refunded_at,
        createdAt: d.created_at,
      };
    }
  } catch (err) {
    console.error("Error fetching security deposit for tenant:", err);
  }

  return null;
}

export async function collectSecurityDeposit(params: {
  tenantId: string;
  amount: number;
  paymentMode: "cash" | "upi" | "bank_transfer";
  transactionRef?: string;
  collectorName: string;
  collectorId?: string;
}) {
  const { tenantId, amount, paymentMode, transactionRef, collectorName, collectorId } = params;
  const nowStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let dep = memorySecurityDeposits.find((d) => d.tenantId === tenantId);
  if (dep) {
    dep.paidAmount = amount;
    dep.status = "paid";
    dep.paymentMode = paymentMode;
    dep.transactionRef = transactionRef;
    dep.collectedByName = collectorName;
    dep.collectedBy = collectorId;
    dep.collectedAt = nowStr;
  } else {
    dep = {
      id: `DEP-${Date.now()}`,
      pgId: "pg-royal",
      buildingId: "b-a",
      buildingName: "Block A",
      tenantId,
      tenantName: "Resident",
      roomNumber: "101",
      bedLabel: "Bed A",
      expectedAmount: amount,
      paidAmount: amount,
      status: "paid",
      paymentMode,
      transactionRef,
      collectedByName: collectorName,
      collectedBy: collectorId,
      collectedAt: nowStr,
      deductionAmount: 0,
      refundedAmount: 0,
      createdAt: new Date().toISOString(),
    };
    memorySecurityDeposits.unshift(dep);
  }

  // Update in bed tenant
  memoryBuildings.forEach((b) => {
    b.floors.forEach((f) => {
      f.rooms.forEach((r) => {
        r.beds.forEach((bed) => {
          if (bed.tenant && bed.tenant.id === tenantId) {
            bed.tenant.deposit = amount;
            bed.tenant.depositStatus = "paid";
            bed.tenant.depositPaymentMode = paymentMode;
            bed.tenant.depositCollectedByName = collectorName;
            bed.tenant.depositCollectedAt = nowStr;
            dep!.tenantName = bed.tenant.name;
            dep!.roomNumber = r.number;
            dep!.bedLabel = bed.label;
            dep!.buildingName = b.name;
            dep!.buildingId = b.id;
          }
        });
      });
    });
  });

  memoryAuditLogs.unshift({
    id: `a-${Date.now()}`,
    text: `${collectorName} collected ₹${amount.toLocaleString("en-IN")} Security Deposit for ${dep.tenantName} (${paymentMode})`,
    time: "Just now",
  });

  // Live Supabase Sync (falls back gracefully)
  try {
    const supabase = await createClient();
    await (supabase.from("security_deposits" as any) as any).upsert(
      {
        pg_id: dep.pgId || "00000000-0000-0000-0000-000000000001",
        building_id: dep.buildingId || "00000000-0000-0000-0000-000000000002",
        tenant_id: tenantId,
        expected_amount: dep.expectedAmount || amount,
        paid_amount: amount,
        status: "paid",
        payment_mode: paymentMode,
        transaction_ref: transactionRef || null,
        collected_by: collectorId || null,
        collected_by_name: collectorName,
        collected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "tenant_id" }
    );
  } catch (err) {
    // In-memory fallback
  }

  return { success: true, deposit: dep };
}

export async function refundSecurityDeposit(params: {
  tenantId: string;
  deductionAmount: number;
  deductionReason: string;
  refundedByName: string;
  refundedById?: string;
}) {
  const { tenantId, deductionAmount, deductionReason, refundedByName, refundedById } = params;
  const nowStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const dep = memorySecurityDeposits.find((d) => d.tenantId === tenantId);
  if (!dep) return { error: "Deposit record not found" };

  const refundAmt = Math.max(0, dep.paidAmount - deductionAmount);
  dep.deductionAmount = deductionAmount;
  dep.deductionReason = deductionReason;
  dep.refundedAmount = refundAmt;
  dep.refundedAt = nowStr;
  dep.refundedByName = refundedByName;
  dep.status = deductionAmount > 0 ? "partially_refunded" : "refunded";

  // Update in bed tenant
  memoryBuildings.forEach((b) => {
    b.floors.forEach((f) => {
      f.rooms.forEach((r) => {
        r.beds.forEach((bed) => {
          if (bed.tenant && bed.tenant.id === tenantId) {
            bed.tenant.depositStatus = dep.status;
            bed.tenant.depositDeduction = deductionAmount;
            bed.tenant.depositDeductionReason = deductionReason;
            bed.tenant.depositRefundedAmount = refundAmt;
            bed.tenant.depositRefundedAt = nowStr;
          }
        });
      });
    });
  });

  memoryAuditLogs.unshift({
    id: `a-${Date.now()}`,
    text: `Owner ${refundedByName} settled Security Deposit for ${dep.tenantName}: Refunded ₹${refundAmt.toLocaleString("en-IN")}, Deducted ₹${deductionAmount.toLocaleString("en-IN")} (${deductionReason || "No deductions"})`,
    time: "Just now",
  });

  // Live Supabase Sync (falls back gracefully)
  try {
    const supabase = await createClient();
    await (supabase.from("security_deposits" as any) as any)
      .update({
        status: dep.status,
        deduction_amount: deductionAmount,
        deduction_reason: deductionReason || null,
        refunded_amount: refundAmt,
        refunded_at: new Date().toISOString(),
        refunded_by: refundedById || null,
        refunded_by_name: refundedByName,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("tenant_id", tenantId);
  } catch (err) {
    // In-memory fallback
  }

  return { success: true, deposit: dep };
}

// --- RENT PAYMENTS & 2-STEP HANDOVER FUNCTIONS ---

export async function getAllRentPayments(pgId?: string, buildingId?: string): Promise<RentPaymentRecord[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("rent_payments")
      .select("*, tenants ( full_name )")
      .order("created_at", { ascending: false });

    if (buildingId && buildingId !== "all") {
      query = query.eq("building_id", buildingId);
    }
    const { data } = await query;
    if (data && data.length > 0) {
      return data.map((r: any) => ({
        id: r.invoice_number || r.id,
        pgId: r.pg_id,
        buildingId: r.building_id,
        tenantId: r.tenant_id,
        tenantName: r.tenants?.full_name || "Resident",
        room: "Room 101",
        billingMonth: r.billing_month || "2026-11-01",
        amount: Number(r.amount) || 0,
        status: r.status,
        paymentMode: r.payment_mode,
        transactionRef: r.utr_number || r.transaction_ref,
        collectedBy: r.collected_by,
        collectedByName: r.collected_by_name || "Anoctic",
        collectedByRole: r.collected_by_role || "owner",
        collectedAt: r.collected_at || r.created_at,
        settledAt: r.settled_at,
        settledBy: r.settled_by,
      }));
    }
  } catch (err) {
    console.error("Error fetching rent payments:", err);
  }
  return [];
}

export async function getRentPaymentsForTenant(tenantId: string): Promise<RentPaymentRecord[]> {
  if (!tenantId) return [];
  try {
    const supabase = await createClient();
    const { data: tenantData } = await (supabase.from("tenants" as any) as any)
      .select("id, full_name, rooms(room_number)")
      .or(`id.eq.${tenantId},user_id.eq.${tenantId}`)
      .limit(1)
      .single();

    const actualTenantId = tenantData?.id || tenantId;

    const { data } = await (supabase.from("rent_payments" as any) as any)
      .select("*")
      .eq("tenant_id", actualTenantId)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      return data.map((r: any) => ({
        id: r.invoice_number || r.id,
        pgId: r.pg_id,
        buildingId: r.building_id,
        tenantId: r.tenant_id,
        tenantName: tenantData?.full_name || "Resident",
        room: tenantData?.rooms?.room_number ? `Room ${tenantData.rooms.room_number}` : "Room 101",
        billingMonth: r.billing_month || "2026-11-01",
        amount: Number(r.amount) || 0,
        status: r.status,
        paymentMode: r.payment_mode,
        transactionRef: r.utr_number || r.transaction_ref,
        collectedBy: r.collected_by,
        collectedByName: r.collected_by_name || "Anoctic",
        collectedByRole: r.collected_by_role || "owner",
        collectedAt: r.collected_at || r.created_at,
        settledAt: r.settled_at,
        settledBy: r.settled_by,
      }));
    }
  } catch (err) {
    console.error("Error fetching tenant rent payments:", err);
  }
  return [];
}

export async function getAdminCollections(adminName?: string): Promise<RentPaymentRecord[]> {
  if (!adminName) return deepClone(memoryRentPayments.filter((r) => r.collectedByRole === "admin"));
  return deepClone(memoryRentPayments.filter(
    (r) => r.collectedByName?.toLowerCase().includes(adminName.toLowerCase()) || r.collectedByRole === "admin"
  ));
}

export async function collectRentPayment(params: {
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  buildingId: string;
  amount: number;
  paymentMode: "cash" | "admin_upi" | "pg_bank_upi";
  billingMonth?: string;
  transactionRef?: string;
  collectedBy?: string;
  collectedByName: string;
  collectedByRole: "owner" | "admin";
}) {
  const {
    tenantId,
    tenantName,
    roomNumber,
    buildingId,
    amount,
    paymentMode,
    billingMonth = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    transactionRef,
    collectedBy,
    collectedByName,
    collectedByRole,
  } = params;

  let status: "collected_by_admin" | "settled_with_owner";
  if (collectedByRole === "admin") {
    if (paymentMode === "pg_bank_upi") {
      status = "settled_with_owner";
    } else {
      status = "collected_by_admin";
    }
  } else {
    status = "settled_with_owner";
  }

  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const newRecord: RentPaymentRecord = {
    id: invoiceNumber,
    pgId: "pg-royal",
    buildingId,
    tenantId,
    tenantName,
    room: roomNumber,
    billingMonth,
    amount,
    status,
    paymentMode,
    transactionRef,
    collectedBy,
    collectedByName,
    collectedByRole,
    collectedAt: nowStr,
    settledAt: status === "settled_with_owner" ? nowStr : undefined,
    settledByName: status === "settled_with_owner" ? collectedByName : undefined,
  };

  memoryRentPayments.unshift(newRecord);

  // Mark tenant's bed rent as paid
  await markBedRentPaid(tenantId);

  // Log in Audit Logs
  memoryAuditLogs.unshift({
    id: `a-${Date.now()}`,
    text: `${collectedByName} collected ₹${amount.toLocaleString("en-IN")} via ${paymentMode.toUpperCase()} for ${tenantName} (${invoiceNumber}) - ${
      status === "collected_by_admin" ? "⚠️ Pending Handover to Owner" : "✅ Settled with Owner"
    }`,
    time: "Just now",
  });

  // Live Supabase Sync (falls back gracefully)
  try {
    const supabase = await createClient();
    await (supabase.from("rent_payments" as any) as any).insert({
      pg_id: newRecord.pgId || "00000000-0000-0000-0000-000000000001",
      building_id: buildingId || "00000000-0000-0000-0000-000000000002",
      tenant_id: tenantId,
      tenant_name: tenantName,
      room_number: roomNumber,
      billing_month: billingMonth,
      amount: amount,
      status: status,
      payment_mode: paymentMode,
      invoice_number: invoiceNumber,
      transaction_ref: transactionRef || null,
      collected_by: collectedBy || null,
      collected_by_name: collectedByName,
      collected_by_role: collectedByRole,
      collected_at: new Date().toISOString(),
      settled_at: status === "settled_with_owner" ? new Date().toISOString() : null,
      settled_by: status === "settled_with_owner" ? collectedBy || null : null,
    } as any);
  } catch (err) {
    // In-memory fallback
  }

  return { success: true, invoice: newRecord };
}

export async function settleRentPaymentWithOwner(params: {
  invoiceId: string;
  settledByName: string;
  settledById?: string;
}) {
  const { invoiceId, settledByName, settledById } = params;
  const record = memoryRentPayments.find((r) => r.id === invoiceId);
  if (!record) return { error: "Invoice payment record not found" };

  const nowStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  record.status = "settled_with_owner";
  record.settledAt = nowStr;
  record.settledBy = settledById;
  record.settledByName = settledByName;

  memoryAuditLogs.unshift({
    id: `a-${Date.now()}`,
    text: `Owner ${settledByName} confirmed cash receipt of ₹${record.amount.toLocaleString("en-IN")} from ${record.collectedByName} for ${record.tenantName} (${record.id}) - Settled ✅`,
    time: "Just now",
  });

  // Live Supabase Sync (falls back gracefully)
  try {
    const supabase = await createClient();
    await (supabase.from("rent_payments" as any) as any)
      .update({
        status: "settled_with_owner",
        handover_at: new Date().toISOString(),
        settled_at: new Date().toISOString(),
        settled_by: settledById || null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("invoice_number", invoiceId);
  } catch (err) {
    // In-memory fallback
  }

  return { success: true, invoice: record };
}

// --- LEDGER & EXPENSES ---

export async function getExpenses() {
  return deepClone(memoryExpenses);
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
  return { success: true, expense: deepClone(newExp) };
}

export async function getUpiApprovals() {
  return deepClone(memoryUpiApprovals);
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

export async function getStaffList(): Promise<StaffItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .in("role", ["admin", "owner"]);
    if (data && data.length > 0) {
      return data.map((s: any) => ({
        id: s.id,
        name: s.full_name,
        phone: s.phone || "9876543210",
        assignedBuildingIds: ["a0000000-0000-0000-0000-000000000001", "a0000000-0000-0000-0000-000000000002"],
        permissions: {
          manage_tenants: true,
          collect_cash: true,
          resolve_complaints: true,
          manage_mess: true,
          issue_passes: true,
        },
      }));
    }
  } catch (err) {
    console.error("Error fetching staff list:", err);
  }
  return [];
}

export async function toggleStaffPermission(staffId: string, permKey: string) {
  const staff = memoryStaffList.find((s) => s.id === staffId);
  if (staff && permKey in staff.permissions) {
    const k = permKey as keyof typeof staff.permissions;
    staff.permissions[k] = !staff.permissions[k];
  }
  return { success: true, staff: staff ? deepClone(staff) : null };
}

export async function getComplaints(): Promise<ComplaintItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await (supabase.from("complaints" as any) as any)
      .select("*, tenants ( full_name ), rooms ( room_number )")
      .order("created_at", { ascending: false });
    if (data && data.length > 0) {
      return data.map((c: any) => ({
        id: c.id,
        tenantId: c.tenant_id,
        tenantName: c.tenants?.full_name || "Resident",
        buildingId: c.building_id || "",
        room: c.rooms?.room_number || "Room 101",
        cat: c.category || "Maintenance",
        category: c.category || "Maintenance",
        desc: c.description || c.title || "Complaint",
        issue: c.title || c.description || "Complaint",
        status: c.status === "resolved" ? ("Resolved" as const) : c.status === "in_progress" ? ("In Progress" as const) : ("Open" as const),
        time: c.created_at,
        note: c.resolution_notes,
      }));
    }
  } catch (err) {
    console.error("Error fetching complaints:", err);
  }
  return [];
}

export async function resolveComplaint(id: string, note?: string) {
  try {
    const supabase = await createClient();
    await (supabase.from("complaints" as any) as any).update({
      status: "resolved",
      resolution_notes: note || "Resolved by Staff & Verified",
      resolved_at: new Date().toISOString(),
    }).eq("id", id);
  } catch (err) {
    console.error("Error resolving complaint in Supabase:", err);
  }
  return { success: true };
}

export async function getMessMenu(): Promise<MessMenu> {
  try {
    const supabase = await createClient();
    const { data } = await (supabase.from("mess_menu" as any) as any).select("*");
    if (data && data.length > 0) {
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const currentDay = days[new Date().getDay()];
      const todayMeals = data.filter((m: any) => m.day_of_week === currentDay);
      const getMeal = (type: string) => todayMeals.find((m: any) => m.meal_type === type)?.menu_items;

      return {
        breakfast: getMeal("breakfast") || "Aloo Paratha, Curd, Pickle & Masala Chai",
        lunch: getMeal("lunch") || "Paneer Butter Masala, Dal Tadka, Jeera Rice, Phulka & Fresh Salad",
        snacks: getMeal("snacks") || "Samosa / Poha with Evening Filter Coffee & Tea",
        dinner: getMeal("dinner") || "Mix Veg Korma, Dal Makhani, Steamed Basmati Rice & Roti",
        baseYes: 42,
        updatedAt: "Today",
      };
    }
  } catch (err) {
    console.error("Error fetching mess menu:", err);
  }
  return {
    breakfast: "Aloo Paratha, Curd & Chai",
    lunch: "Dal Makhani, Rice, Roti & Salad",
    snacks: "Tea & Samosa",
    dinner: "Paneer, Dal, Roti & Rice",
    baseYes: 42,
    updatedAt: "Today",
  };
}

export async function updateMessMenu(data: Partial<MessMenu>) {
  try {
    const supabase = await createClient();
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentDay = days[new Date().getDay()];

    const updates = [
      { type: "breakfast", val: data.breakfast },
      { type: "lunch", val: data.lunch },
      { type: "snacks", val: data.snacks },
      { type: "dinner", val: data.dinner },
    ].filter((u) => !!u.val);

    for (const u of updates) {
      await (supabase.from("mess_menu" as any) as any)
        .update({ menu_items: u.val, updated_at: new Date().toISOString() })
        .eq("day_of_week", currentDay)
        .eq("meal_type", u.type);
    }
  } catch (err) {
    console.error("Error updating mess menu in Supabase:", err);
  }
  return { success: true };
}

export async function getAuditLogs() {
  return deepClone(memoryAuditLogs);
}

// --- RECEIPTS & DINNER POLLS ---

let memoryReceipts: ReceiptItem[] = [
  {
    id: "REC-202611-01",
    tenantId: "t-rahul",
    tenantName: "Rahul Sharma",
    pgId: "pg-royal",
    room: "Block A • G-01",
    month: "October 2026",
    amount: 8500,
    utr: "UTR33091811",
    date: "04 Oct 2026",
  },
  {
    id: "REC-202611-02",
    tenantId: "t-rahul",
    tenantName: "Rahul Sharma",
    pgId: "pg-royal",
    room: "Block A • G-01",
    month: "September 2026",
    amount: 8500,
    utr: "UTR22987102",
    date: "05 Sep 2026",
  },
  {
    id: "REC-202611-03",
    tenantId: "90000000-0000-0000-0000-000000000004",
    tenantName: "Aarav Patel",
    pgId: "00000000-0000-0000-0000-000000000001",
    room: "Block A • Room 101",
    month: "October 2026",
    amount: 10650,
    utr: "UTR89123401",
    date: "05 Oct 2026",
  },
];

let memoryDinnerPolls: Record<string, "Yes" | "No"> = {
  "t-rahul": "Yes",
  "90000000-0000-0000-0000-000000000004": "Yes",
};

export async function getTenantReceipts(tenantId?: string): Promise<ReceiptItem[]> {
  if (!tenantId) return deepClone(memoryReceipts);
  const filtered = memoryReceipts.filter((r) => r.tenantId === tenantId);
  return deepClone(filtered.length > 0 ? filtered : memoryReceipts.slice(0, 2));
}

export async function addReceipt(data: Omit<ReceiptItem, "id">): Promise<ReceiptItem> {
  const newReceipt: ReceiptItem = {
    id: `REC-${Date.now().toString().slice(-6)}`,
    ...data,
  };
  memoryReceipts.unshift(newReceipt);
  return deepClone(newReceipt);
}

export async function getTenantDinnerPoll(tenantId: string): Promise<"Yes" | "No"> {
  return memoryDinnerPolls[tenantId] || "Yes";
}

export async function setTenantDinnerPoll(tenantId: string, choice: "Yes" | "No") {
  memoryDinnerPolls[tenantId] = choice;
  return { success: true, choice };
}

export async function submitTenantComplaint(data: {
  tenantId: string;
  tenantName: string;
  buildingId?: string;
  room?: string;
  cat: string;
  desc: string;
}): Promise<ComplaintItem> {
  const newComplaint: ComplaintItem = {
    id: `T-${Math.floor(220 + Math.random() * 700)}`,
    tenantId: data.tenantId,
    tenantName: data.tenantName,
    buildingId: data.buildingId || "b-a",
    room: data.room || "Room 101",
    cat: data.cat,
    desc: data.desc,
    status: "Open",
    note: "",
    time: "Just now",
  };
  memoryComplaints.unshift(newComplaint);
  return newComplaint;
}

export async function submitTenantUpiScreenshot(data: {
  tenantId: string;
  tenantName: string;
  room: string;
  amount: number;
  utr: string;
}): Promise<UpiApprovalItem> {
  const newUpi: UpiApprovalItem = {
    id: `u-${Date.now()}`,
    tenantId: data.tenantId,
    tenantName: data.tenantName,
    room: data.room,
    amount: data.amount,
    utr: data.utr,
    status: "Pending",
    time: "Just now",
  };
  memoryUpiApprovals.unshift(newUpi);
  return newUpi;
}

export async function submitVacateNotice(
  tenantId: string,
  tenantName: string,
  date: string,
  reason: string
) {
  memoryAuditLogs.unshift({
    id: `a-${Date.now()}`,
    text: `Resident ${tenantName} submitted Vacate Notice for ${date} (Reason: ${reason})`,
    time: "Just now",
  });
  return { success: true };
}
