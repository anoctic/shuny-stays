export interface BulkImportRowInput {
  id: string;
  buildingName: string;
  floorName: string;
  roomNumber: string;
  sharing: number;
  rent: number;
  tenantName: string;
  phone: string;
  depositAmount: number;
  depositPaid: boolean;
  rentPaidThisMonth: boolean;
  joinDate: string;
  parentsName?: string;
  parentsPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelation?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  age?: number | string;
}

export interface ParsedBulkRow extends BulkImportRowInput {
  rowIndex: number;
  cleanPhone: string;
  isValid: boolean;
  errors: string[];
}

export function normalizeIndianPhone(raw: string): string {
  let digits = (raw || "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits.slice(-10);
}

/**
 * Splits a single CSV line respecting double-quoted fields, or splits by tab if TSV.
 */
function splitDelimitedLine(line: string, delimiter: "\t" | ","): string[] {
  if (delimiter === "\t") {
    return line.split("\t").map((cell) => cell.trim());
  }

  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseBoolFlag(val: string | undefined, defaultVal: boolean): boolean {
  if (!val || val.trim() === "") return defaultVal;
  const v = val.trim().toLowerCase();
  if (["yes", "y", "true", "1", "paid", "done", "haa", "ha"].includes(v)) return true;
  if (["no", "n", "false", "0", "pending", "unpaid", "due", "nahi"].includes(v)) return false;
  return defaultVal;
}

function normalizeHeaderKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

const HEADER_ALIASES: Record<string, keyof BulkImportRowInput> = {
  building: "buildingName",
  building_name: "buildingName",
  block: "buildingName",
  block_name: "buildingName",
  property: "buildingName",
  floor: "floorName",
  floor_name: "floorName",
  room: "roomNumber",
  room_no: "roomNumber",
  room_number: "roomNumber",
  sharing: "sharing",
  sharing_type: "sharing",
  beds: "sharing",
  seater: "sharing",
  rent: "rent",
  monthly_rent: "rent",
  rent_amount: "rent",
  tenant_name: "tenantName",
  resident_name: "tenantName",
  student_name: "tenantName",
  full_name: "tenantName",
  name: "tenantName",
  tenant: "tenantName",
  phone: "phone",
  mobile: "phone",
  mobile_no: "phone",
  phone_number: "phone",
  contact: "phone",
  whatsapp: "phone",
  deposit: "depositAmount",
  deposit_amount: "depositAmount",
  deposit_amt: "depositAmount",
  security_deposit: "depositAmount",
  deposit_paid: "depositPaid",
  deposit_status: "depositPaid",
  rent_paid: "rentPaidThisMonth",
  rent_paid_this_month: "rentPaidThisMonth",
  rent_status: "rentPaidThisMonth",
  paid: "rentPaidThisMonth",
  join_date: "joinDate",
  check_in_date: "joinDate",
  checkin_date: "joinDate",
  parents_name: "parentsName",
  parent_name: "parentsName",
  father_name: "parentsName",
  mother_name: "parentsName",
  parents_phone: "parentsPhone",
  parent_phone: "parentsPhone",
  parents_number: "parentsPhone",
  parent_mobile: "parentsPhone",
  emergency_name: "emergencyContactName",
  emergency_contact_name: "emergencyContactName",
  emergency_phone: "emergencyContactPhone",
  emergency_number: "emergencyContactPhone",
  emergency_contact: "emergencyContactPhone",
  emergency_contact_phone: "emergencyContactPhone",
  relation: "emergencyRelation",
  emergency_relation: "emergencyRelation",
  relationship: "emergencyRelation",
  aadhaar: "aadhaarNumber",
  aadhar: "aadhaarNumber",
  aadhaar_number: "aadhaarNumber",
  aadhar_number: "aadhaarNumber",
  aadhaar_card: "aadhaarNumber",
  pan: "panNumber",
  pan_number: "panNumber",
  pan_card: "panNumber",
  age: "age",
};

/**
 * Parses CSV or Tab-Separated (Excel / Google Sheets Copy-Paste) text into validated rows.
 */
export function parseBulkSpreadsheetText(
  rawText: string,
  defaults?: {
    buildingName?: string;
    rent?: number;
    sharing?: number;
  }
): ParsedBulkRow[] {
  const cleaned = (rawText || "").replace(/^\uFEFF/, "").trim();
  if (!cleaned) return [];

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  // Auto-detect Tab vs Comma using first line
  const delimiter: "\t" | "," = lines[0].includes("\t") ? "\t" : ",";
  const firstCells = splitDelimitedLine(lines[0], delimiter);
  const normalizedHeaders = firstCells.map(normalizeHeaderKey);

  // Detect whether line 0 is a header row (contains recognizable header names like room/name/phone)
  const mappedFields = normalizedHeaders.map((h) => HEADER_ALIASES[h] || null);
  const hasHeaderRow = mappedFields.filter(Boolean).length >= 2;

  const dataLines = hasHeaderRow ? lines.slice(1) : lines;
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultBuilding = defaults?.buildingName?.trim() || "Main Block";
  const defaultRent = defaults?.rent || 8500;
  const defaultSharing = defaults?.sharing || 2;

  const seenPhones = new Set<string>();
  const parsed: ParsedBulkRow[] = [];

  dataLines.forEach((line, idx) => {
    const cells = splitDelimitedLine(line, delimiter);
    // Ignore completely empty lines
    if (cells.every((c) => !c)) return;

    const record: BulkImportRowInput = {
      id: `row-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      buildingName: defaultBuilding,
      floorName: "",
      roomNumber: "",
      sharing: defaultSharing,
      rent: defaultRent,
      tenantName: "",
      phone: "",
      depositAmount: defaultRent,
      depositPaid: true,
      rentPaidThisMonth: true,
      joinDate: todayStr,
    };

    let depositExplicit = false;

    if (hasHeaderRow) {
      mappedFields.forEach((fieldKey, colIdx) => {
        if (!fieldKey) return;
        const val = cells[colIdx] || "";
        if (!val) return;

        switch (fieldKey) {
          case "buildingName":
            record.buildingName = val;
            break;
          case "floorName":
            record.floorName = val;
            break;
          case "roomNumber":
            record.roomNumber = val;
            break;
          case "sharing": {
            const num = parseInt(val.replace(/\D/g, ""), 10);
            if (num >= 1 && num <= 10) record.sharing = num;
            break;
          }
          case "rent": {
            const num = parseInt(val.replace(/[^\d]/g, ""), 10);
            if (!isNaN(num) && num >= 0) record.rent = num;
            break;
          }
          case "tenantName":
            record.tenantName = val;
            break;
          case "phone":
            record.phone = val;
            break;
          case "depositAmount": {
            const num = parseInt(val.replace(/[^\d]/g, ""), 10);
            if (!isNaN(num) && num >= 0) {
              record.depositAmount = num;
              depositExplicit = true;
            }
            break;
          }
          case "depositPaid":
            record.depositPaid = parseBoolFlag(val, true);
            break;
          case "rentPaidThisMonth":
            record.rentPaidThisMonth = parseBoolFlag(val, true);
            break;
          case "joinDate":
            record.joinDate = val;
            break;
          case "parentsName":
            record.parentsName = val;
            break;
          case "parentsPhone":
            record.parentsPhone = normalizeIndianPhone(val) || val;
            break;
          case "emergencyContactName":
            record.emergencyContactName = val;
            break;
          case "emergencyContactPhone":
            record.emergencyContactPhone = normalizeIndianPhone(val) || val;
            break;
          case "emergencyRelation":
            record.emergencyRelation = val;
            break;
          case "aadhaarNumber":
            record.aadhaarNumber = val.replace(/\D/g, "").slice(0, 12);
            break;
          case "panNumber":
            record.panNumber = val.trim().toUpperCase();
            break;
          case "age": {
            const parsedAge = parseInt(val.replace(/\D/g, ""), 10);
            if (!isNaN(parsedAge) && parsedAge >= 10 && parsedAge <= 120) {
              record.age = parsedAge;
            }
            break;
          }
        }
      });
    } else {
      // Headerless quick paste mode!
      // Smart positional mapping:
      // 3 cols: Room, Name, Phone
      // 4 cols: Room, Name, Phone, Rent
      // 5 cols: Room, Name, Phone, Rent, Deposit
      // 6+ cols: Building, Room, Name, Phone, Rent, Deposit OR Room, Name, Phone, Rent, Deposit, RentPaid
      if (cells.length >= 3 && cells.length <= 5) {
        record.roomNumber = cells[0] || "";
        record.tenantName = cells[1] || "";
        record.phone = cells[2] || "";
        if (cells[3]) {
          const r = parseInt(cells[3].replace(/[^\d]/g, ""), 10);
          if (!isNaN(r) && r > 0) record.rent = r;
        }
        if (cells[4]) {
          const d = parseInt(cells[4].replace(/[^\d]/g, ""), 10);
          if (!isNaN(d) && d >= 0) {
            record.depositAmount = d;
            depositExplicit = true;
          }
        }
      } else if (cells.length >= 6) {
        // Check if col 2 looks like phone or col 3 looks like phone
        const col2Digits = normalizeIndianPhone(cells[2] || "");
        const col3Digits = normalizeIndianPhone(cells[3] || "");
        if (col3Digits.length === 10 && col2Digits.length !== 10) {
          // Building, Room, Name, Phone, Rent, Deposit
          record.buildingName = cells[0] || defaultBuilding;
          record.roomNumber = cells[1] || "";
          record.tenantName = cells[2] || "";
          record.phone = cells[3] || "";
          if (cells[4]) {
            const r = parseInt(cells[4].replace(/[^\d]/g, ""), 10);
            if (!isNaN(r) && r > 0) record.rent = r;
          }
          if (cells[5]) {
            const d = parseInt(cells[5].replace(/[^\d]/g, ""), 10);
            if (!isNaN(d) && d >= 0) {
              record.depositAmount = d;
              depositExplicit = true;
            }
          }
        } else {
          // Room, Name, Phone, Rent, Deposit, RentPaid
          record.roomNumber = cells[0] || "";
          record.tenantName = cells[1] || "";
          record.phone = cells[2] || "";
          if (cells[3]) {
            const r = parseInt(cells[3].replace(/[^\d]/g, ""), 10);
            if (!isNaN(r) && r > 0) record.rent = r;
          }
          if (cells[4]) {
            const d = parseInt(cells[4].replace(/[^\d]/g, ""), 10);
            if (!isNaN(d) && d >= 0) {
              record.depositAmount = d;
              depositExplicit = true;
            }
          }
          if (cells[5]) {
            record.rentPaidThisMonth = parseBoolFlag(cells[5], true);
          }
        }
      }
    }

    if (!depositExplicit) {
      record.depositAmount = record.rent;
    }

    parsed.push(validateBulkRow(record, idx + 1, seenPhones));
  });

  return parsed;
}

export function validateBulkRow(
  row: BulkImportRowInput,
  rowIndex: number,
  seenPhones?: Set<string>
): ParsedBulkRow {
  const errors: string[] = [];
  const cleanPhone = normalizeIndianPhone(row.phone);

  if (!row.roomNumber || row.roomNumber.trim().length === 0) {
    errors.push("Room No. missing");
  }
  if (!row.tenantName || row.tenantName.trim().length < 2) {
    errors.push("Resident Name required");
  }
  if (cleanPhone.length !== 10) {
    errors.push("Valid 10-digit Mobile required");
  } else if (seenPhones) {
    if (seenPhones.has(cleanPhone)) {
      errors.push("Duplicate Mobile in list");
    } else {
      seenPhones.add(cleanPhone);
    }
  }
  if (isNaN(Number(row.rent)) || Number(row.rent) < 0) {
    errors.push("Invalid Rent amount");
  }

  return {
    ...row,
    roomNumber: row.roomNumber.trim(),
    tenantName: row.tenantName.trim(),
    buildingName: (row.buildingName || "Main Block").trim(),
    floorName: (row.floorName || "").trim(),
    cleanPhone,
    rowIndex,
    isValid: errors.length === 0,
    errors,
  };
}

export function generateSampleCsvTemplate(): string {
  const headers = [
    "building",
    "floor",
    "room_number",
    "sharing",
    "rent",
    "tenant_name",
    "phone",
    "deposit_amount",
    "deposit_paid",
    "rent_paid_this_month",
    "join_date",
    "parents_name",
    "parents_phone",
    "emergency_contact_name",
    "emergency_contact_phone",
    "emergency_relation",
    "aadhaar_number",
    "pan_number",
    "age",
  ];
  const sampleRows = [
    ["Main Block", "1st Floor", "101", "2", "8500", "Rahul Sharma", "9876543210", "8500", "yes", "yes", new Date().toISOString().split("T")[0], "Rajesh Sharma", "9876500001", "Rajesh Sharma", "9876500001", "Father", "", "", "21"],
    ["Main Block", "1st Floor", "101", "2", "8500", "Amit Verma", "9876543211", "8500", "yes", "no", new Date().toISOString().split("T")[0], "Sunita Verma", "9876500002", "Vikram Verma", "9876500003", "Brother", "", "", "22"],
    ["Main Block", "1st Floor", "102", "1", "11000", "Priya Nair", "9876543212", "11000", "yes", "yes", new Date().toISOString().split("T")[0], "", "", "", "", "", "", "", ""],
  ];

  return [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\r\n");
}
