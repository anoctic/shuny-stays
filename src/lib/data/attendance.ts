import {
  AttendanceLog,
  AttendanceStatus,
  BedAttendanceItem,
  UserRole,
} from "@/types/schema.types";
import { createClient } from "@/lib/supabase/server";
import { getPassesForManagement } from "./gate-passes";

// In-memory store for today's attendance logs
let memoryAttendanceLogs: Record<string, { status: AttendanceStatus; updatedAt: string; markedBy: string }> = {
  // Pre-seeded: Aarav Patel is on day_pass today from pass DP-2026-104
  "90000000-0000-0000-0000-000000000004": {
    status: "day_pass",
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    markedBy: "Manoj Kumar (Warden)",
  },
};

// 30-day mock history for tenant (Aarav Patel)
export function getMockTenantHistory(tenantId: string) {
  const history: { date: string; status: AttendanceStatus; note?: string }[] = [];
  const today = new Date();

  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    let status: AttendanceStatus = "present";
    let note: string | undefined = undefined;

    // Sundays or weekends occasionally night pass or day pass
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) {
      status = "night_pass";
      note = "Hometown Weekend (NP-2026-081)";
    } else if (i === 5) {
      status = "day_pass";
      note = "Library Outing (DP-2026-092)";
    } else if (i === 12) {
      status = "absent";
      note = "Uninformed Leave";
    }

    history.push({ date: dateStr, status, note });
  }

  return history;
}

/**
 * Seed bed hierarchy structure with mock occupants for demonstration
 */
const MOCK_BUILDINGS_HIERARCHY = [
  {
    building_id: "20000000-0000-0000-0000-000000000001",
    building_name: "Block A - Krishna Bhawan (Boys)",
    gender_type: "boys",
    floors: [
      {
        floor_id: "flr-001",
        floor_name: "Ground Floor",
        floor_number: 0,
        beds: [
          {
            bed_id: "bed-g1-a",
            bed_name: "Bed A",
            room_id: "rm-g01",
            room_number: "G01",
            sharing_type: 2,
            tenant_id: "t-101",
            tenant_name: "Devendra Joshi",
            tenant_phone: "+91 98111 22331",
            default_status: "present" as AttendanceStatus,
          },
          {
            bed_id: "bed-g1-b",
            bed_name: "Bed B",
            room_id: "rm-g01",
            room_number: "G01",
            sharing_type: 2,
            tenant_id: "t-102",
            tenant_name: "Karan Singhal",
            tenant_phone: "+91 98111 22332",
            default_status: "present" as AttendanceStatus,
          },
          {
            bed_id: "bed-g2-a",
            bed_name: "Bed A",
            room_id: "rm-g02",
            room_number: "G02",
            sharing_type: 3,
            tenant_id: "t-103",
            tenant_name: "Nikhil Aggarwal",
            tenant_phone: "+91 98111 22333",
            default_status: "present" as AttendanceStatus,
          },
          {
            bed_id: "bed-g2-b",
            bed_name: "Bed B",
            room_id: "rm-g02",
            room_number: "G02",
            sharing_type: 3,
            tenant_id: "t-104",
            tenant_name: "Rohit Bansal",
            tenant_phone: "+91 98111 22334",
            default_status: "absent" as AttendanceStatus,
          },
        ],
      },
      {
        floor_id: "flr-002",
        floor_name: "1st Floor",
        floor_number: 1,
        beds: [
          {
            bed_id: "40000000-0000-0000-0000-000000000001",
            bed_name: "Bed A",
            room_id: "30000000-0000-0000-0000-000000000001",
            room_number: "101",
            sharing_type: 2,
            tenant_id: "90000000-0000-0000-0000-000000000004", // Aarav Patel (Tenant Persona)
            tenant_name: "Aarav Patel",
            tenant_phone: "+91 91234 56789",
            default_status: "present" as AttendanceStatus,
          },
          {
            bed_id: "bed-101-b",
            bed_name: "Bed B",
            room_id: "30000000-0000-0000-0000-000000000001",
            room_number: "101",
            sharing_type: 2,
            tenant_id: "t-106",
            tenant_name: "Rohan Gupta",
            tenant_phone: "+91 91234 56781",
            default_status: "present" as AttendanceStatus,
          },
          {
            bed_id: "bed-102-a",
            bed_name: "Bed A",
            room_id: "rm-102",
            room_number: "102",
            sharing_type: 3,
            tenant_id: "t-107",
            tenant_name: "Vikram Malhotra",
            tenant_phone: "+91 91234 56782",
            default_status: "present" as AttendanceStatus,
          },
          {
            bed_id: "bed-102-b",
            bed_name: "Bed B",
            room_id: "rm-102",
            room_number: "102",
            sharing_type: 3,
            tenant_id: "t-108",
            tenant_name: "Kabir Mehra",
            tenant_phone: "+91 91234 56783",
            default_status: "present" as AttendanceStatus,
          },
        ],
      },
    ],
  },
  {
    building_id: "20000000-0000-0000-0000-000000000002",
    building_name: "Block B - Saraswati Bhawan (Girls)",
    gender_type: "girls",
    floors: [
      {
        floor_id: "flr-b-001",
        floor_name: "Ground Floor",
        floor_number: 0,
        beds: [
          {
            bed_id: "bed-bg-a",
            bed_name: "Bed A",
            room_id: "rm-b01",
            room_number: "B-G01",
            sharing_type: 2,
            tenant_id: "t-201",
            tenant_name: "Ananya Roy",
            tenant_phone: "+91 98222 11001",
            default_status: "present" as AttendanceStatus,
          },
          {
            bed_id: "bed-bg-b",
            bed_name: "Bed B",
            room_id: "rm-b01",
            room_number: "B-G01",
            sharing_type: 2,
            tenant_id: "t-202",
            tenant_name: "Pooja Hegde",
            tenant_phone: "+91 98222 11002",
            default_status: "present" as AttendanceStatus,
          },
        ],
      },
      {
        floor_id: "flr-b-002",
        floor_name: "1st Floor",
        floor_number: 1,
        beds: [
          {
            bed_id: "bed-b1-a",
            bed_name: "Bed A",
            room_id: "rm-b101",
            room_number: "B-101",
            sharing_type: 2,
            tenant_id: "00000000-0000-0000-0000-000000000004", // Sneha Verma
            tenant_name: "Sneha Verma",
            tenant_phone: "+91 91234 56780",
            default_status: "night_pass" as AttendanceStatus, // Active Night Pass
          },
          {
            bed_id: "bed-b1-b",
            bed_name: "Bed B",
            room_id: "rm-b101",
            room_number: "B-101",
            sharing_type: 2,
            tenant_id: "t-204",
            tenant_name: "Meera Nair",
            tenant_phone: "+91 98222 11004",
            default_status: "present" as AttendanceStatus,
          },
        ],
      },
    ],
  },
];

/**
 * Fetch hierarchical attendance sheet for today, automatically checking active gate passes!
 */
export async function getTodayAttendanceSheet(options?: {
  pgId?: string;
  buildingId?: string | null;
  userRole?: UserRole;
  assignedBuildingIds?: string[];
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Fetch active passes for today to auto-link
  const passes = await getPassesForManagement();
  const activePassMap = new Map<string, { passType: "day_pass" | "night_pass"; passNumber: string; status: string }>();

  passes.forEach((p) => {
    // If pass is active today (outing_date <= today <= expected_return_date)
    // and not rejected
    if (p.approval_status !== "rejected") {
      const isDayMatch = p.outing_date === todayStr;
      const isNightMatch = todayStr >= p.outing_date && todayStr <= p.expected_return_date;

      if ((p.pass_type === "day_pass" && isDayMatch) || (p.pass_type === "night_pass" && isNightMatch)) {
        activePassMap.set(p.tenant_id, {
          passType: p.pass_type,
          passNumber: p.pass_number,
          status: p.approval_status,
        });
      }
    }
  });

  // Filter buildings by role scope
  let filteredBuildings = MOCK_BUILDINGS_HIERARCHY;

  if (options?.userRole === "admin" && options?.assignedBuildingIds && options.assignedBuildingIds.length > 0) {
    filteredBuildings = filteredBuildings.filter((b) => options.assignedBuildingIds!.includes(b.building_id));
  } else if (options?.buildingId && options.buildingId !== "all") {
    filteredBuildings = filteredBuildings.filter((b) => b.building_id === options.buildingId);
  }

  // Construct hierarchy with auto-detected pass statuses
  const result = filteredBuildings.map((building) => {
    const floors = building.floors.map((floor) => {
      const beds: BedAttendanceItem[] = floor.beds.map((bed) => {
        // Check if tenant has an active gate pass today
        const activePass = activePassMap.get(bed.tenant_id);

        // Determine current status:
        // Priority 1: explicitly saved in memory/db for today
        // Priority 2: auto-link with active gate pass (Day Pass -> day_pass, Night Pass -> night_pass)
        // Priority 3: default_status or present
        let currentStatus: AttendanceStatus = bed.default_status;

        if (memoryAttendanceLogs[bed.tenant_id]) {
          currentStatus = memoryAttendanceLogs[bed.tenant_id].status;
        } else if (activePass) {
          currentStatus = activePass.passType === "day_pass" ? "day_pass" : "night_pass";
        }

        return {
          bed_id: bed.bed_id,
          bed_name: bed.bed_name,
          room_id: bed.room_id,
          room_number: bed.room_number,
          sharing_type: bed.sharing_type,
          floor_id: floor.floor_id,
          floor_name: floor.floor_name,
          floor_number: floor.floor_number,
          building_id: building.building_id,
          building_name: building.building_name,
          tenant_id: bed.tenant_id,
          tenant_name: bed.tenant_name,
          tenant_phone: bed.tenant_phone,
          status: currentStatus,
          has_active_pass: !!activePass,
          pass_type: activePass?.passType || null,
          pass_number: activePass?.passNumber || null,
          pass_status: (activePass?.status as any) || null,
          updated_at: memoryAttendanceLogs[bed.tenant_id]?.updatedAt,
        };
      });

      const totalBeds = beds.length;
      const presentCount = beds.filter((b) => b.status === "present").length;
      const passCount = beds.filter((b) => b.status === "day_pass" || b.status === "night_pass").length;
      const absentCount = beds.filter((b) => b.status === "absent").length;

      return {
        floor_id: floor.floor_id,
        floor_name: floor.floor_name,
        floor_number: floor.floor_number,
        beds,
        stats: {
          total: totalBeds,
          present: presentCount,
          onPass: passCount,
          absent: absentCount,
        },
      };
    });

    const buildingTotalBeds = floors.reduce((acc, f) => acc + f.stats.total, 0);
    const buildingPresent = floors.reduce((acc, f) => acc + f.stats.present, 0);
    const buildingOnPass = floors.reduce((acc, f) => acc + f.stats.onPass, 0);
    const buildingAbsent = floors.reduce((acc, f) => acc + f.stats.absent, 0);

    return {
      building_id: building.building_id,
      building_name: building.building_name,
      gender_type: building.gender_type,
      floors,
      stats: {
        total: buildingTotalBeds,
        present: buildingPresent,
        onPass: buildingOnPass,
        absent: buildingAbsent,
      },
    };
  });

  return result;
}

/**
 * Save / Update attendance logs
 */
export async function saveAttendanceLogs(
  items: { tenant_id: string; status: AttendanceStatus; bed_id?: string }[],
  markedByRole: UserRole,
  markedByName: string
) {
  const now = new Date().toISOString();

  items.forEach((item) => {
    memoryAttendanceLogs[item.tenant_id] = {
      status: item.status,
      updatedAt: now,
      markedBy: markedByName,
    };
  });

  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const records = items.map((i) => ({
      tenant_id: i.tenant_id,
      bed_id: i.bed_id || "40000000-0000-0000-0000-000000000001",
      attendance_date: today,
      status: i.status,
      marked_by_role: markedByRole,
    }));

    await supabase.from("attendance_logs" as any).upsert(records as any, {
      onConflict: "tenant_id, attendance_date",
    });
  } catch {
    // Fallback in memory
  }

  return { success: true, count: items.length };
}

/**
 * Get tenant's live today attendance status & history
 */
export async function getTenantAttendanceStatus(tenantId: string) {
  const todayEntry = memoryAttendanceLogs[tenantId];
  const history = getMockTenantHistory(tenantId);

  // If no entry yet, check active passes
  let currentStatus: AttendanceStatus = todayEntry?.status || "present";
  let markedAt: string = todayEntry?.updatedAt || new Date().toISOString();
  let markedBy: string = todayEntry?.markedBy || "Warden Manoj Kumar";

  return {
    todayStatus: currentStatus,
    markedAt,
    markedBy,
    history,
  };
}
