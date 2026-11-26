import { createAdminClient } from "@/lib/supabase/admin";
import { generateReadablePassword, normalizePhone } from "@/lib/auth/credentials";
import { BulkImportRowInput } from "@/lib/utils/bulk-import-parser";

export interface BulkBatchRowResult {
  rowIndex: number;
  roomNumber: string;
  tenantName: string;
  phone: string;
  rent: number;
  status: "imported" | "skipped_duplicate" | "error";
  message?: string;
  loginId?: string;
  password?: string;
}

export interface BulkImportBatchSummary {
  pgId: string;
  pgName: string;
  buildingsCreated: number;
  roomsCreated: number;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  results: BulkBatchRowResult[];
}

function inferFloorInfo(roomNumber: string, explicitFloorName?: string): { floorNum: number; floorName: string } {
  if (explicitFloorName && explicitFloorName.trim()) {
    const clean = explicitFloorName.trim();
    const lower = clean.toLowerCase();
    if (lower.includes("ground") || lower === "g" || lower === "0") {
      return { floorNum: 0, floorName: clean };
    }
    const numMatch = clean.match(/\d+/);
    if (numMatch) {
      const n = parseInt(numMatch[0], 10);
      return { floorNum: n, floorName: clean };
    }
    return { floorNum: 1, floorName: clean };
  }

  const r = roomNumber.trim().toUpperCase();
  if (r.startsWith("G")) {
    return { floorNum: 0, floorName: "Ground Floor" };
  }
  const digits = r.replace(/\D/g, "");
  if (digits.length >= 3) {
    const firstDigit = parseInt(digits[0], 10);
    if (!isNaN(firstDigit)) {
      const floorName =
        firstDigit === 0
          ? "Ground Floor"
          : firstDigit === 1
          ? "1st Floor"
          : firstDigit === 2
          ? "2nd Floor"
          : firstDigit === 3
          ? "3rd Floor"
          : `${firstDigit}th Floor`;
      return { floorNum: firstDigit, floorName };
    }
  }
  return { floorNum: 0, floorName: "Ground Floor" };
}

/**
 * Processes a chunk (e.g. 8 rows) of rooms & residents for a specific PG.
 * Auto-creates missing buildings, floors, rooms, and beds; checks in residents;
 * records deposits & current-month rent; and provisions tenant Auth credentials.
 */
export async function processBulkImportChunk(params: {
  pgId: string;
  pgName: string;
  rows: BulkImportRowInput[];
  createLogins: boolean;
  collectorId?: string | null;
  collectorName: string;
}): Promise<BulkImportBatchSummary> {
  const admin = createAdminClient();
  const { pgId, pgName, rows, createLogins, collectorId, collectorName } = params;

  if (!rows || rows.length === 0) {
    return {
      pgId,
      pgName,
      buildingsCreated: 0,
      roomsCreated: 0,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      results: [],
    };
  }

  // 1. Load existing PG hierarchy + active tenants in parallel
  const [bldgRes, floorRes, roomRes, bedRes, activeTenantsRes] = await Promise.all([
    (admin.from("buildings" as any) as any).select("id, name").eq("pg_id", pgId),
    (admin.from("floors" as any) as any).select("id, building_id, floor_number, floor_name").eq("pg_id", pgId),
    (admin.from("rooms" as any) as any).select("id, building_id, floor_id, room_number, sharing_type, base_rent_monthly").eq("pg_id", pgId),
    (admin.from("beds" as any) as any).select("id, building_id, room_id, bed_name, status, monthly_rent").eq("pg_id", pgId).order("bed_name", { ascending: true }),
    (admin.from("tenants" as any) as any).select("id, phone").eq("pg_id", pgId).eq("is_active", true),
  ]);

  const buildings: any[] = bldgRes.data || [];
  const floors: any[] = floorRes.data || [];
  const rooms: any[] = roomRes.data || [];
  let beds: any[] = bedRes.data || [];
  const activePhones = new Set<string>(
    (activeTenantsRes.data || []).map((t: any) => normalizePhone(t.phone)).filter((p: string) => p.length === 10)
  );

  // Lookup helpers
  const findBuilding = (name: string) =>
    buildings.find((b) => b.name.trim().toLowerCase() === name.trim().toLowerCase()) ||
    (buildings.length === 1 && !name ? buildings[0] : null);

  let buildingsCreated = 0;
  let roomsCreated = 0;

  // 2. Ensure missing buildings exist
  const buildingsToInsert: any[] = [];
  for (const row of rows) {
    const bName = (row.buildingName || "Main Block").trim();
    if (!findBuilding(bName) && !buildingsToInsert.some((b) => b.name.toLowerCase() === bName.toLowerCase())) {
      const bId = crypto.randomUUID();
      const newBldg = {
        id: bId,
        pg_id: pgId,
        name: bName,
        gender_type: "coliving",
        address: pgName,
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        total_floors: 1,
        amenities: ["High-speed Wi-Fi", "Power Backup", "RO Water", "Daily Housekeeping"],
      };
      buildingsToInsert.push(newBldg);
      buildings.push(newBldg);
      buildingsCreated++;
    }
  }
  if (buildingsToInsert.length > 0) {
    const { error: bErr } = await (admin.from("buildings" as any) as any).insert(buildingsToInsert);
    if (bErr) throw new Error(`Building creation error: ${bErr.message}`);
  }

  // 3. Ensure missing floors exist
  const floorsToInsert: any[] = [];
  for (const row of rows) {
    const bName = (row.buildingName || "Main Block").trim();
    const bldg = findBuilding(bName) || buildings[0];
    if (!bldg) continue;

    const { floorNum, floorName } = inferFloorInfo(row.roomNumber, row.floorName);
    const existingFloor = floors.find(
      (f) =>
        f.building_id === bldg.id &&
        (f.floor_name.trim().toLowerCase() === floorName.toLowerCase() || f.floor_number === floorNum)
    );
    if (!existingFloor) {
      const floorId = crypto.randomUUID();
      const newFloor = {
        id: floorId,
        pg_id: pgId,
        building_id: bldg.id,
        floor_number: floorNum,
        floor_name: floorName,
      };
      floorsToInsert.push(newFloor);
      floors.push(newFloor);
    }
  }
  if (floorsToInsert.length > 0) {
    const { error: fErr } = await (admin.from("floors" as any) as any).insert(floorsToInsert);
    if (fErr) throw new Error(`Floor creation error: ${fErr.message}`);
  }

  // 4. Ensure missing rooms exist (PostgreSQL trigger trg_rooms_auto_create_beds creates beds automatically!)
  const roomsToInsert: any[] = [];
  const newlyCreatedRoomIds: string[] = [];

  for (const row of rows) {
    const bName = (row.buildingName || "Main Block").trim();
    const bldg = findBuilding(bName) || buildings[0];
    if (!bldg) continue;

    const cleanRoomNo = row.roomNumber.trim();
    const existingRoom = rooms.find(
      (r) => r.building_id === bldg.id && String(r.room_number).trim().toLowerCase() === cleanRoomNo.toLowerCase()
    );
    if (!existingRoom) {
      const { floorNum, floorName } = inferFloorInfo(cleanRoomNo, row.floorName);
      const targetFloor =
        floors.find(
          (f) =>
            f.building_id === bldg.id &&
            (f.floor_name.trim().toLowerCase() === floorName.toLowerCase() || f.floor_number === floorNum)
        ) || floors.find((f) => f.building_id === bldg.id);

      if (!targetFloor) continue;

      const roomId = crypto.randomUUID();
      const roomObj = {
        id: roomId,
        pg_id: pgId,
        building_id: bldg.id,
        floor_id: targetFloor.id,
        room_number: cleanRoomNo,
        sharing_type: Math.max(1, Math.min(10, Number(row.sharing) || 2)),
        room_type: "standard",
        base_rent_monthly: Number(row.rent) || 8500,
        default_deposit: Number(row.depositAmount) || Number(row.rent) || 8500,
      };
      roomsToInsert.push(roomObj);
      rooms.push(roomObj);
      newlyCreatedRoomIds.push(roomId);
      roomsCreated++;
    }
  }

  if (roomsToInsert.length > 0) {
    const { error: rErr } = await (admin.from("rooms" as any) as any).insert(roomsToInsert);
    if (rErr) throw new Error(`Room creation error: ${rErr.message}`);

    // Fetch beds created automatically by the DB trigger for these new rooms
    const { data: newBeds } = await (admin.from("beds" as any) as any)
      .select("id, building_id, room_id, bed_name, status, monthly_rent")
      .in("room_id", newlyCreatedRoomIds)
      .order("bed_name", { ascending: true });
    if (newBeds && newBeds.length > 0) {
      beds = [...beds, ...newBeds];
    }
  }

  // 5. Assign beds cleanly (and dynamically expand a room if needed!)
  const claimedBedIds = new Set<string>();
  const validAssignments: {
    rowIndex: number;
    row: BulkImportRowInput;
    cleanPhone: string;
    buildingId: string;
    floorId: string;
    roomId: string;
    bedId: string;
    rent: number;
    depositAmount: number;
  }[] = [];
  const results: BulkBatchRowResult[] = [];
  const extraBedsToInsert: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cleanPhone = normalizePhone(row.phone);

    if (!row.tenantName?.trim() || cleanPhone.length !== 10 || !row.roomNumber?.trim()) {
      results.push({
        rowIndex: i + 1,
        roomNumber: row.roomNumber || "-",
        tenantName: row.tenantName || "-",
        phone: cleanPhone || row.phone || "-",
        rent: Number(row.rent) || 0,
        status: "error",
        message: "Missing Room, Name, or valid 10-digit Mobile",
      });
      continue;
    }

    if (activePhones.has(cleanPhone)) {
      results.push({
        rowIndex: i + 1,
        roomNumber: row.roomNumber,
        tenantName: row.tenantName,
        phone: cleanPhone,
        rent: Number(row.rent) || 0,
        status: "skipped_duplicate",
        message: "Active resident with this phone already exists in this PG",
      });
      continue;
    }

    const bName = (row.buildingName || "Main Block").trim();
    const bldg = findBuilding(bName) || buildings[0];
    const room = bldg
      ? rooms.find(
          (r) =>
            r.building_id === bldg.id &&
            String(r.room_number).trim().toLowerCase() === row.roomNumber.trim().toLowerCase()
        )
      : rooms.find(
          (r) => String(r.room_number).trim().toLowerCase() === row.roomNumber.trim().toLowerCase()
        );

    if (!bldg || !room) {
      results.push({
        rowIndex: i + 1,
        roomNumber: row.roomNumber,
        tenantName: row.tenantName,
        phone: cleanPhone,
        rent: Number(row.rent) || 0,
        status: "error",
        message: "Could not locate or create target room",
      });
      continue;
    }

    // Find first unoccupied, unclaimed bed in that room
    let chosenBed = beds.find(
      (bd) => bd.room_id === room.id && bd.status === "vacant" && !claimedBedIds.has(bd.id)
    );

    if (!chosenBed) {
      // Room is currently full -> dynamically add an extra bed so import succeeds cleanly
      const existingCount = beds.filter((bd) => bd.room_id === room.id).length;
      const newBedId = crypto.randomUUID();
      chosenBed = {
        id: newBedId,
        pg_id: pgId,
        building_id: bldg.id,
        room_id: room.id,
        bed_name: `Bed ${existingCount + 1}`,
        status: "vacant",
        monthly_rent: Number(row.rent) || Number(room.base_rent_monthly) || 8500,
      };
      extraBedsToInsert.push(chosenBed);
      beds.push(chosenBed);
    }

    claimedBedIds.add(chosenBed.id);
    activePhones.add(cleanPhone);

    validAssignments.push({
      rowIndex: i + 1,
      row,
      cleanPhone,
      buildingId: bldg.id,
      floorId: room.floor_id,
      roomId: room.id,
      bedId: chosenBed.id,
      rent: Number(row.rent) > 0 ? Number(row.rent) : Number(room.base_rent_monthly) || 8500,
      depositAmount: Number(row.depositAmount) >= 0 ? Number(row.depositAmount) : Number(row.rent) || 8500,
    });
  }

  if (extraBedsToInsert.length > 0) {
    const { error: extraBedErr } = await (admin.from("beds" as any) as any).insert(extraBedsToInsert);
    if (extraBedErr) {
      console.warn("Extra beds insert notice:", extraBedErr.message);
    }
  }

  if (validAssignments.length === 0) {
    return {
      pgId,
      pgName,
      buildingsCreated,
      roomsCreated,
      importedCount: 0,
      skippedCount: results.filter((r) => r.status === "skipped_duplicate").length,
      errorCount: results.filter((r) => r.status === "error").length,
      results,
    };
  }

  // 6. Fast Parallel Auth Credential Provisioning (Edge-safe: check profiles in 1 query first!)
  const userIdByPhone = new Map<string, string>();
  const credsByPhone = new Map<string, { loginId: string; password: string }>();

  if (createLogins) {
    const phones = validAssignments.map((a) => a.cleanPhone);
    const { data: existingProfiles } = await (admin.from("profiles" as any) as any)
      .select("id, phone")
      .in("phone", phones);

    const existingProfMap = new Map<string, string>();
    (existingProfiles || []).forEach((p: any) => {
      if (p.phone) existingProfMap.set(normalizePhone(p.phone), p.id);
    });

    // Provision Auth users in parallel for this small batch
    const profilesToUpsert: any[] = [];
    await Promise.all(
      validAssignments.map(async (item) => {
        const loginEmail = `${item.cleanPhone}@login.shunystays.app`;
        const password = generateReadablePassword(item.row.tenantName, item.cleanPhone);
        const existingUserId = existingProfMap.get(item.cleanPhone);

        try {
          let uid: string | null = existingUserId || null;

          if (uid) {
            const { error: uErr } = await admin.auth.admin.updateUserById(uid, {
              password,
              email: loginEmail,
              email_confirm: true,
              user_metadata: {
                full_name: item.row.tenantName.trim(),
                role: "tenant",
                phone: item.cleanPhone,
                pg_id: pgId,
                email_verified: true,
              },
            });
            if (uErr) uid = null;
          }

          if (!uid) {
            const { data: created, error: cErr } = await admin.auth.admin.createUser({
              email: loginEmail,
              password,
              email_confirm: true,
              user_metadata: {
                full_name: item.row.tenantName.trim(),
                role: "tenant",
                phone: item.cleanPhone,
                pg_id: pgId,
                email_verified: true,
              },
            });

            if (created?.user?.id) {
              uid = created.user.id;
            } else if (
              cErr?.message?.toLowerCase().includes("already") ||
              cErr?.message?.toLowerCase().includes("duplicate")
            ) {
              // Fallback lookup if auth user existed without matching phone in profiles
              const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
              const found = list?.users?.find(
                (u) =>
                  u.email?.toLowerCase() === loginEmail.toLowerCase() ||
                  (u.phone && normalizePhone(u.phone) === item.cleanPhone) ||
                  (u.user_metadata?.phone && normalizePhone(u.user_metadata.phone) === item.cleanPhone)
              );
              if (found) {
                uid = found.id;
                await admin.auth.admin.updateUserById(uid, {
                  password,
                  email: loginEmail,
                  email_confirm: true,
                  user_metadata: {
                    ...found.user_metadata,
                    full_name: item.row.tenantName.trim(),
                    role: "tenant",
                    phone: item.cleanPhone,
                    pg_id: pgId,
                    email_verified: true,
                  },
                });
              }
            }
          }

          if (uid) {
            userIdByPhone.set(item.cleanPhone, uid);
            credsByPhone.set(item.cleanPhone, { loginId: item.cleanPhone, password });
            profilesToUpsert.push({
              id: uid,
              full_name: item.row.tenantName.trim(),
              role: "tenant",
              phone: item.cleanPhone,
              email: loginEmail,
              pg_id: pgId,
              updated_at: new Date().toISOString(),
            });
          }
        } catch (authErr) {
          console.warn(`Batch auth warning for ${item.cleanPhone}:`, authErr);
        }
      })
    );

    if (profilesToUpsert.length > 0) {
      await (admin.from("profiles" as any) as any).upsert(profilesToUpsert, { onConflict: "id" });
    }
  }

  // 7. Batch Insert Tenants, Mark Beds Occupied, Insert Deposits & Initial Rent Payments
  const nowIso = new Date().toISOString();
  const billingMonth = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const monthCode = new Date().toISOString().slice(0, 7).replace("-", "");

  const tenantsPayload: any[] = [];
  const depositsPayload: any[] = [];
  const rentPaymentsPayload: any[] = [];
  const bedIdsToOccupy: string[] = [];

  for (const item of validAssignments) {
    const tenantId = crypto.randomUUID();
    const userId = userIdByPhone.get(item.cleanPhone) || null;
    const creds = credsByPhone.get(item.cleanPhone);

    tenantsPayload.push({
      id: tenantId,
      user_id: userId,
      pg_id: pgId,
      building_id: item.buildingId,
      room_id: item.roomId,
      bed_id: item.bedId,
      full_name: item.row.tenantName.trim(),
      phone: item.cleanPhone,
      parents_name: item.row.parentsName?.trim() || null,
      parents_phone: item.row.parentsPhone ? item.row.parentsPhone.replace(/\D/g, "").slice(-10) || null : null,
      emergency_contact_name: item.row.emergencyContactName?.trim() || item.row.parentsName?.trim() || null,
      emergency_contact_phone:
        (item.row.emergencyContactPhone || item.row.parentsPhone || "").replace(/\D/g, "").slice(-10) ||
        null,
      emergency_relation: item.row.emergencyRelation?.trim() || null,
      id_proof_type: "pending",
      id_proof_number: item.row.aadhaarNumber ? item.row.aadhaarNumber.replace(/\D/g, "").slice(0, 12) || null : null,
      pan_number: item.row.panNumber ? item.row.panNumber.trim().toUpperCase() || null : null,
      age:
        item.row.age !== undefined &&
        item.row.age !== "" &&
        !Number.isNaN(Number(item.row.age)) &&
        Number(item.row.age) >= 10 &&
        Number(item.row.age) <= 120
          ? Math.round(Number(item.row.age))
          : null,
      rent_amount: item.rent,
      deposit_amount: item.depositAmount,
      check_in_date: item.row.joinDate || nowIso.split("T")[0],
      kyc_status: "pending",
      is_active: true,
    });

    bedIdsToOccupy.push(item.bedId);

    if (item.depositAmount > 0) {
      const isDepPaid = item.row.depositPaid !== false;
      depositsPayload.push({
        id: crypto.randomUUID(),
        pg_id: pgId,
        building_id: item.buildingId,
        tenant_id: tenantId,
        expected_amount: item.depositAmount,
        paid_amount: isDepPaid ? item.depositAmount : 0,
        status: isDepPaid ? "paid" : "pending",
        payment_mode: "cash",
        collected_by: isDepPaid ? (collectorId || null) : null,
        collected_by_name: isDepPaid ? collectorName : "Pending Collection",
        collected_at: isDepPaid ? nowIso : null,
        created_at: nowIso,
        updated_at: nowIso,
      });
    }

    if (item.row.rentPaidThisMonth) {
      rentPaymentsPayload.push({
        id: crypto.randomUUID(),
        pg_id: pgId,
        building_id: item.buildingId,
        floor_id: item.floorId,
        bed_id: item.bedId,
        tenant_id: tenantId,
        billing_month: billingMonth,
        amount: item.rent,
        payment_mode: "cash",
        invoice_number: `INV-${monthCode}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "settled_with_owner",
        collected_by: collectorId || null,
        collected_by_name: collectorName,
        collected_by_role: "owner",
        collected_at: nowIso,
        created_at: nowIso,
      });
    }

    results.push({
      rowIndex: item.rowIndex,
      roomNumber: item.row.roomNumber,
      tenantName: item.row.tenantName.trim(),
      phone: item.cleanPhone,
      rent: item.rent,
      status: "imported",
      loginId: creds?.loginId,
      password: creds?.password,
    });
  }

  // Execute batch DB writes
  const { error: tInsertErr } = await (admin.from("tenants" as any) as any).insert(tenantsPayload);
  if (tInsertErr) {
    throw new Error(`Batch tenant insert failed: ${tInsertErr.message}`);
  }

  await (admin.from("beds" as any) as any)
    .update({ status: "occupied" })
    .in("id", bedIdsToOccupy);

  if (depositsPayload.length > 0) {
    await (admin.from("security_deposits" as any) as any).insert(depositsPayload);
  }

  if (rentPaymentsPayload.length > 0) {
    await (admin.from("rent_payments" as any) as any).insert(rentPaymentsPayload);
  }

  try {
    await (admin.from("pg_audit_logs" as any) as any).insert({
      id: crypto.randomUUID(),
      pg_id: pgId,
      user_id: collectorId || null,
      action: `Bulk Setup imported ${validAssignments.length} resident(s) and created ${roomsCreated} room(s)`,
      entity_table: "tenants",
      created_at: nowIso,
    });
  } catch {}

  return {
    pgId,
    pgName,
    buildingsCreated,
    roomsCreated,
    importedCount: validAssignments.length,
    skippedCount: results.filter((r) => r.status === "skipped_duplicate").length,
    errorCount: results.filter((r) => r.status === "error").length,
    results,
  };
}
