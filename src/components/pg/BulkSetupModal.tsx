"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Building2,
  Table2,
  FileSpreadsheet,
  Upload,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Rocket,
  ClipboardPaste,
  KeyRound,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { BuildingItem } from "@/lib/data/rooms";
import { addAutoBuildingAction } from "@/app/actions/rooms-and-ops";
import { bulkImportChunkAction } from "@/app/actions/bulk-import";
import { BulkBatchRowResult } from "@/lib/data/bulk-import";
import {
  BulkImportRowInput,
  ParsedBulkRow,
  generateSampleCsvTemplate,
  normalizeIndianPhone,
  parseBulkSpreadsheetText,
  validateBulkRow,
} from "@/lib/utils/bulk-import-parser";

interface BulkSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings?: BuildingItem[];
  defaultTab?: "rooms" | "grid" | "csv";
}

function createEmptyGridRow(roomNo = "", rent = 8500, buildingName = "Main Block"): BulkImportRowInput {
  return {
    id: `grid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    buildingName,
    floorName: "",
    roomNumber: roomNo,
    sharing: 2,
    rent,
    tenantName: "",
    phone: "",
    depositAmount: rent,
    depositPaid: true,
    rentPaidThisMonth: true,
    joinDate: new Date().toISOString().split("T")[0],
    parentsName: "",
    parentsPhone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyRelation: "",
    aadhaarNumber: "",
    panNumber: "",
    age: "",
  };
}

export function BulkSetupModal({
  isOpen,
  onClose,
  buildings = [],
  defaultTab,
}: BulkSetupModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialTab = defaultTab || (buildings.length === 0 ? "rooms" : "grid");
  const [activeTab, setActiveTab] = useState<"rooms" | "grid" | "csv">(initialTab);

  // Tab 1: Auto Building & 80+ Rooms Builder
  const [bldgName, setBldgName] = useState(buildings.length === 0 ? "Main Block" : `Block ${String.fromCharCode(65 + buildings.length)}`);
  const [bldgType, setBldgType] = useState("Boys");
  const [floorsCount, setFloorsCount] = useState(4);
  const [roomsPerFloor, setRoomsPerFloor] = useState(20);
  const [defaultSharing, setDefaultSharing] = useState(2);
  const [defaultRent, setDefaultRent] = useState(8500);
  const [isGeneratingRooms, setIsGeneratingRooms] = useState(false);
  const [roomsGenResult, setRoomsGenResult] = useState<string | null>(null);
  const [roomsGenError, setRoomsGenError] = useState<string | null>(null);

  // Tab 2: Interactive Quick-Fill Grid & Excel Paste
  const [gridRows, setGridRows] = useState<BulkImportRowInput[]>(() => [
    createEmptyGridRow("101", 8500, buildings[0]?.name || "Main Block"),
    createEmptyGridRow("102", 8500, buildings[0]?.name || "Main Block"),
    createEmptyGridRow("103", 8500, buildings[0]?.name || "Main Block"),
  ]);
  const [excelPasteBuffer, setExcelPasteBuffer] = useState("");
  const [showPasteBox, setShowPasteBox] = useState(false);

  // Tab 3: CSV File / Text Upload
  const [csvRawText, setCsvRawText] = useState("");
  const [csvParsedRows, setCsvParsedRows] = useState<ParsedBulkRow[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showOptionalColumns, setShowOptionalColumns] = useState(true);

  // Shared Import Execution State
  const [createLogins, setCreateLogins] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [finalSummary, setFinalSummary] = useState<{
    importedCount: number;
    skippedCount: number;
    errorCount: number;
    roomsCreated: number;
    results: BulkBatchRowResult[];
  } | null>(null);

  if (!isOpen) return null;

  const resetAllAndClose = () => {
    setRoomsGenError(null);
    setImportError(null);
    setFinalSummary(null);
    setProgressPct(0);
    setProgressText("");
    onClose();
  };

  // --- TAB 1 HANDLER: Generate X Floors * Y Rooms ---
  const handleGenerateRooms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingRooms(true);
    setRoomsGenError(null);
    setRoomsGenResult(null);

    try {
      const fd = new FormData();
      fd.set("name", bldgName.trim() || "Main Block");
      fd.set("type", bldgType);
      fd.set("floorsCount", String(floorsCount));
      fd.set("roomsPerFloor", String(roomsPerFloor));
      fd.set("sharing", String(defaultSharing));
      fd.set("rent", String(defaultRent));

      const res = await addAutoBuildingAction(fd);
      if (res && "error" in res && res.error) {
        setRoomsGenError(typeof res.error === "string" ? res.error : "Failed to generate building");
      } else {
        const totalRooms = floorsCount * roomsPerFloor;
        const totalBeds = totalRooms * defaultSharing;
        setRoomsGenResult(
          `✅ Success! "${bldgName}" created with ${totalRooms} Rooms & ${totalBeds} Beds!`
        );
        router.refresh();
      }
    } catch (err: any) {
      setRoomsGenError(err?.message || "Failed to generate rooms");
    } finally {
      setIsGeneratingRooms(false);
    }
  };

  // --- TAB 2 HELPERS: Load Vacant Beds / Excel Copy-Paste ---
  const handleLoadVacantBedsToGrid = () => {
    const vacantRows: BulkImportRowInput[] = [];
    buildings.forEach((b) => {
      b.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          r.beds.forEach((bed) => {
            if (!bed.occupied) {
              vacantRows.push({
                ...createEmptyGridRow(r.number, r.rent || 8500, b.name),
                floorName: f.name,
                sharing: r.sharing || 2,
              });
            }
          });
        });
      });
    });

    if (vacantRows.length === 0) {
      setImportError("No vacant beds found yet. Create rooms in Tab 1 first, or simply type room numbers below (missing rooms are auto-created!).");
      return;
    }

    setImportError(null);
    setGridRows(vacantRows);
  };

  const handleApplyExcelPaste = (textToParse: string) => {
    const parsed = parseBulkSpreadsheetText(textToParse, {
      buildingName: buildings[0]?.name || bldgName || "Main Block",
      rent: defaultRent,
      sharing: defaultSharing,
    });
    if (parsed.length > 0) {
      setGridRows(parsed);
      setExcelPasteBuffer("");
      setShowPasteBox(false);
      setImportError(null);
    } else {
      setImportError("Could not detect rows from pasted text. Format: Room No, Name, Phone (10-digit), Rent");
    }
  };

  const updateGridRow = (id: string, field: keyof BulkImportRowInput, value: any) => {
    setGridRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };
        if (field === "rent" && row.depositAmount === row.rent) {
          updated.depositAmount = Number(value) || 0;
        }
        return updated;
      })
    );
  };

  const addGridRows = (count: number) => {
    const baseNum = gridRows.length + 101;
    const defaultBldg = buildings[0]?.name || bldgName || "Main Block";
    const newOnes = Array.from({ length: count }, (_, i) =>
      createEmptyGridRow(String(baseNum + i), defaultRent, defaultBldg)
    );
    setGridRows((prev) => [...prev, ...newOnes]);
  };

  const removeGridRow = (id: string) => {
    setGridRows((prev) => prev.filter((r) => r.id !== id));
  };

  // --- TAB 3 HELPERS: CSV Template Download & Upload ---
  const handleDownloadSampleCsv = () => {
    const csvContent = generateSampleCsvTemplate();
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ShunyStays_PG_Bulk_Import_Template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCsvTextChange = (text: string) => {
    setCsvRawText(text);
    const parsed = parseBulkSpreadsheetText(text, {
      buildingName: buildings[0]?.name || bldgName || "Main Block",
      rent: defaultRent,
      sharing: defaultSharing,
    });
    setCsvParsedRows(parsed);
    setImportError(null);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || "");
      handleCsvTextChange(content);
    };
    reader.readAsText(file);
  };

  // --- COMPUTE READY ROWS FOR ACTIVE TAB ---
  // In Grid tab, ignore rows where BOTH tenantName and phone are completely blank (makes 80-room partial occupancy super easy!)
  const activeValidatedRows: ParsedBulkRow[] = (() => {
    if (activeTab === "grid") {
      const seen = new Set<string>();
      return gridRows
        .filter((r) => r.tenantName.trim() !== "" || r.phone.trim() !== "")
        .map((r, i) => validateBulkRow(r, i + 1, seen));
    }
    if (activeTab === "csv") {
      return csvParsedRows;
    }
    return [];
  })();

  const validRowsOnly = activeValidatedRows.filter((r) => r.isValid);
  const invalidRowsOnly = activeValidatedRows.filter((r) => !r.isValid);

  // --- RUN CHUNKED BULK IMPORT ---
  const handleRunBulkImport = async () => {
    if (validRowsOnly.length === 0) {
      setImportError("Please fill at least 1 valid row (Room No, Name, and 10-digit Mobile) to import.");
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setFinalSummary(null);

    const CHUNK_SIZE = 8; // Cloudflare Worker Edge-safe chunk size
    const totalChunks = Math.ceil(validRowsOnly.length / CHUNK_SIZE);

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalRoomsCreated = 0;
    const allResults: BulkBatchRowResult[] = [];

    try {
      for (let c = 0; c < totalChunks; c++) {
        const chunk = validRowsOnly.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
        setProgressText(
          `Importing Batch ${c + 1} of ${totalChunks} (${Math.min((c + 1) * CHUNK_SIZE, validRowsOnly.length)} / ${validRowsOnly.length} residents)...`
        );
        setProgressPct(Math.round(((c + 0.5) / totalChunks) * 100));

        const res = await bulkImportChunkAction({
          rows: chunk,
          createLogins,
          isLastChunk: c === totalChunks - 1,
        });

        if (res?.error) {
          throw new Error(res.error);
        }

        if (res?.summary) {
          totalImported += res.summary.importedCount;
          totalSkipped += res.summary.skippedCount;
          totalErrors += res.summary.errorCount;
          totalRoomsCreated += res.summary.roomsCreated;
          allResults.push(...res.summary.results);
        }
      }

      setProgressPct(100);
      setProgressText("Completed!");
      setFinalSummary({
        importedCount: totalImported,
        skippedCount: totalSkipped,
        errorCount: totalErrors,
        roomsCreated: totalRoomsCreated,
        results: allResults,
      });
      router.refresh();
    } catch (err: any) {
      setImportError(err?.message || "Bulk import interrupted. Already imported rows are safely saved.");
    } finally {
      setIsImporting(false);
    }
  };

  // --- EXPORT DOWNLOADABLE CREDENTIALS CSV ---
  const handleDownloadCredentialsSheet = () => {
    if (!finalSummary) return;
    const headers = ["Room_No", "Resident_Name", "Phone_Login_ID", "Password", "Monthly_Rent", "Status", "App_Login_URL"];
    const originUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "https://shunystays.com/login";
    const csvRows = finalSummary.results.map((r) => [
      r.roomNumber,
      `"${(r.tenantName || "").replace(/"/g, '""')}"`,
      r.phone,
      r.password || "(No Login Created)",
      r.rent,
      r.status,
      originUrl,
    ]);
    const csvText = "\uFEFF" + [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ShunyStays_Resident_Logins_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-sm flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 animate-fade-in"
      onClick={!isImporting ? resetAllAndClose : undefined}
    >
      <div
        className="w-full max-w-4xl mx-auto rounded-t-[28px] md:rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP MODAL HEADER */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/25 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-black tracking-tight flex items-center gap-2 truncate">
                PG Bulk Setup & Migration Studio
              </h2>
              <p className="text-[11px] text-indigo-200 truncate">
                80+ Rooms & Residents ko 1 click me setup karein — Build Rooms, Fill Grid, ya Upload Excel/CSV
              </p>
            </div>
          </div>
          {!isImporting && (
            <button
              type="button"
              onClick={resetAllAndClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3-TAB NAVIGATION BAR (Hidden while viewing Final Summary) */}
        {!finalSummary && (
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("rooms")}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                activeTab === "rooms"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Step 1: Build 80+ Rooms (Fast)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                activeTab === "grid"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Step 2: Quick-Fill Grid / Excel Paste</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("csv")}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                activeTab === "csv"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Step 3: Upload Excel / CSV Sheet</span>
            </button>
          </div>
        )}

        {/* SCROLLABLE BODY CONTENT */}
        <div className="p-4 md:p-5 overflow-y-auto flex-1 space-y-4">
          {importError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{importError}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* FINAL COMPLETION CELEBRATION + CREDENTIALS DOWNLOAD               */}
          {/* ================================================================= */}
          {finalSummary ? (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Bulk Setup & Migration Complete! 🎉
                </h3>
                <p className="text-xs text-slate-600">
                  Saare rooms, beds, deposits aur active students live database me save ho gaye hain.
                </p>

                <div className="grid grid-cols-3 gap-2 max-w-md mx-auto pt-2">
                  <div className="p-2.5 rounded-2xl bg-white border border-emerald-200">
                    <div className="text-lg font-black text-emerald-600">{finalSummary.importedCount}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Residents Added</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200">
                    <div className="text-lg font-black text-indigo-600">{finalSummary.roomsCreated}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">New Rooms Auto-Built</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200">
                    <div className="text-lg font-black text-amber-600">{finalSummary.skippedCount}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Skipped Dupes</div>
                  </div>
                </div>
              </div>

              {/* Download Credentials CTA */}
              {finalSummary.results.some((r) => r.password) && (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <KeyRound className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-indigo-950">
                        Student Login IDs & Passwords Generated!
                      </h4>
                      <p className="text-[11px] text-indigo-700 mt-0.5">
                        Excel/CSV file download karke PG Owner ya Students ke saath WhatsApp par share karein.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadCredentialsSheet}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Login Passwords (.csv)</span>
                  </button>
                </div>
              )}

              {/* Results Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9.5px] sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Room</th>
                      <th className="px-3 py-2">Resident Name</th>
                      <th className="px-3 py-2">Mobile (Login ID)</th>
                      <th className="px-3 py-2">Password</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {finalSummary.results.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-black text-slate-800">{r.roomNumber}</td>
                        <td className="px-3 py-2 font-bold text-slate-900">{r.tenantName}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{r.phone}</td>
                        <td className="px-3 py-2 font-mono font-bold text-indigo-600">{r.password || "—"}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              r.status === "imported"
                                ? "bg-emerald-50 text-emerald-700"
                                : r.status === "skipped_duplicate"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {r.status === "imported" ? "✓ Imported" : r.message || r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={resetAllAndClose}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer"
              >
                Done & View Live Rooms Grid
              </button>
            </div>
          ) : activeTab === "rooms" ? (
            /* ================================================================= */
            /* TAB 1: INSTANT 80+ ROOMS & BUILDING GENERATOR                     */
            /* ================================================================= */
            <form onSubmit={handleGenerateRooms} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 space-y-0.5">
                  <p className="font-black">80 ya 100 Rooms 2 Second Me Banayein!</p>
                  <p className="text-[11px] text-indigo-700">
                    Agar PG me 4 floors aur har floor par 20 rooms hain (total 80 rooms), bas niche numbers daalkar button dabayein — saare floors, rooms (101-420), aur beds ek saath ready ho jayenge.
                  </p>
                </div>
              </div>

              {roomsGenError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {roomsGenError}
                </div>
              )}

              {roomsGenResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-black text-emerald-800">{roomsGenResult}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("grid");
                      handleLoadVacantBedsToGrid();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Ab Students Bharein (Step 2)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-extrabold text-slate-600 block mb-1">Building / Block Name</label>
                  <input
                    type="text"
                    required
                    value={bldgName}
                    onChange={(e) => setBldgName(e.target.value)}
                    placeholder="e.g. Main Block / Block A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-600 block mb-1">PG Type</label>
                  <select
                    value={bldgType}
                    onChange={(e) => setBldgType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Boys">Boys Hostel</option>
                    <option value="Girls">Girls Hostel</option>
                    <option value="Co-ed">Co-living PG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-extrabold text-slate-600 block mb-1">Total Floors</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={floorsCount}
                    onChange={(e) => setFloorsCount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-600 block mb-1">Rooms / Floor</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={roomsPerFloor}
                    onChange={(e) => setRoomsPerFloor(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-600 block mb-1">Sharing / Room</label>
                  <select
                    value={defaultSharing}
                    onChange={(e) => setDefaultSharing(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                  >
                    <option value={1}>1-Seater (Single)</option>
                    <option value={2}>2-Seater (Double)</option>
                    <option value={3}>3-Seater (Triple)</option>
                    <option value={4}>4-Seater</option>
                  </select>
                </div>
                <div>
                  <label className="font-extrabold text-slate-600 block mb-1">Default Rent (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={defaultRent}
                    onChange={(e) => setDefaultRent(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-slate-900"
                  />
                </div>
              </div>

              {/* Live Calculation Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-300 font-semibold">Auto-Generation Preview:</span>
                <div className="flex items-center gap-2 font-black">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/30 border border-indigo-400/30 text-indigo-200">
                    {floorsCount} Floors
                  </span>
                  <span>×</span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/30 border border-indigo-400/30 text-indigo-200">
                    {roomsPerFloor} Rooms
                  </span>
                  <span>=</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950">
                    {floorsCount * roomsPerFloor} Rooms ({floorsCount * roomsPerFloor * defaultSharing} Beds)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingRooms}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingRooms ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating {floorsCount * roomsPerFloor} Rooms & Beds...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Generate {floorsCount * roomsPerFloor} Rooms Instantly</span>
                  </>
                )}
              </button>
            </form>
          ) : activeTab === "grid" ? (
            /* ================================================================= */
            /* TAB 2: QUICK-FILL SPREADSHEET GRID + EXCEL COPY-PASTE             */
            /* ================================================================= */
            <div className="space-y-3">
              {/* Helper Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleLoadVacantBedsToGrid}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Load All Vacant Beds ({buildings.reduce((a, b) => a + b.floors.reduce((fa, fl) => fa + fl.rooms.reduce((ra, rm) => ra + rm.beds.filter((bd) => !bd.occupied).length, 0), 0), 0)})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPasteBox((v) => !v)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
                    <span>Paste from Excel / Sheets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOptionalColumns((v) => !v)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                      showOptionalColumns
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>
                      {showOptionalColumns
                        ? "✓ Optional Parent / Emergency / KYC / Age Shown"
                        : "+ Optional Parent / Emergency / KYC / Age"}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => addGridRows(1)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 1 Row
                  </button>
                  <button
                    type="button"
                    onClick={() => addGridRows(10)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 10 Rows
                  </button>
                </div>
              </div>

              {/* Direct Copy-Paste Area (When opened) */}
              {showPasteBox && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <p className="text-[11px] font-bold text-amber-900">
                    Excel ya Google Sheets se columns copy karein (<code className="bg-white px-1 rounded">Room No | Student Name | Mobile | Rent | Deposit</code>) aur niche paste karein:
                  </p>
                  <textarea
                    rows={4}
                    value={excelPasteBuffer}
                    onChange={(e) => setExcelPasteBuffer(e.target.value)}
                    placeholder={`101\tRahul Sharma\t9876543210\t8500\t8500\n102\tAmit Verma\t9876543211\t8500\t8500`}
                    className="w-full p-2.5 rounded-xl bg-white border border-amber-300 font-mono text-[11px] text-slate-800 focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasteBox(false)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyExcelPaste(excelPasteBuffer)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black cursor-pointer"
                    >
                      Load Rows Into Table ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Editable Spreadsheet Table */}
              <div className="rounded-2xl border border-slate-200 overflow-x-auto max-h-[330px] overflow-y-auto">
                <table className={`w-full text-left text-[11px] ${showOptionalColumns ? "min-w-[1460px]" : "min-w-[660px]"}`}>
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9.5px] sticky top-0 z-10">
                    <tr>
                      <th className="px-2.5 py-2 w-8">#</th>
                      <th className="px-2 py-2 w-24">Room No *</th>
                      <th className="px-2 py-2 w-40">Student Full Name *</th>
                      <th className="px-2 py-2 w-32">Mobile (10-digit) *</th>
                      <th className="px-2 py-2 w-24">Rent (₹)</th>
                      <th className="px-2 py-2 w-24">Deposit (₹)</th>
                      <th className="px-2 py-2 w-20 text-center">Rent Paid?</th>
                      {showOptionalColumns && (
                        <>
                          <th className="px-2 py-2 w-36">Parent&apos;s Name (Opt.)</th>
                          <th className="px-2 py-2 w-32">Parent&apos;s No. (Opt.)</th>
                          <th className="px-2 py-2 w-36">Emergency Name (Opt.)</th>
                          <th className="px-2 py-2 w-32">Emergency No. (Opt.)</th>
                          <th className="px-2 py-2 w-28">Relation (Opt.)</th>
                          <th className="px-2 py-2 w-20">Age (Opt.)</th>
                          <th className="px-2 py-2 w-36">Aadhaar No. (Opt.)</th>
                          <th className="px-2 py-2 w-32">PAN Card (Opt.)</th>
                        </>
                      )}
                      <th className="px-2 py-2 w-9"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gridRows.map((row, idx) => {
                      const hasInput = row.tenantName.trim() !== "" || row.phone.trim() !== "";
                      const phoneLen = normalizeIndianPhone(row.phone).length;
                      const phoneBad = hasInput && phoneLen !== 10;

                      return (
                        <tr key={row.id} className="hover:bg-slate-50/70">
                          <td className="px-2.5 py-1.5 text-slate-400 font-bold">{idx + 1}</td>
                          <td className="px-1.5 py-1.5">
                            <input
                              type="text"
                              value={row.roomNumber}
                              onChange={(e) => updateGridRow(row.id, "roomNumber", e.target.value)}
                              placeholder="101"
                              className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-black text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-1.5 py-1.5">
                            <input
                              type="text"
                              value={row.tenantName}
                              onChange={(e) => updateGridRow(row.id, "tenantName", e.target.value)}
                              placeholder="e.g. Harshit"
                              className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-1.5 py-1.5">
                            <input
                              type="tel"
                              value={row.phone}
                              onChange={(e) => updateGridRow(row.id, "phone", e.target.value)}
                              placeholder="e.g. 9867456788"
                              className={`w-full px-2 py-1.5 rounded-lg font-mono font-bold placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none border ${
                                phoneBad
                                  ? "bg-rose-50 border-rose-400 text-rose-800"
                                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                              }`}
                            />
                          </td>
                          <td className="px-1.5 py-1.5">
                            <input
                              type="number"
                              value={row.rent}
                              onChange={(e) => updateGridRow(row.id, "rent", Number(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-1.5 py-1.5">
                            <input
                              type="number"
                              value={row.depositAmount}
                              onChange={(e) => updateGridRow(row.id, "depositAmount", Number(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <input
                              type="checkbox"
                              checked={row.rentPaidThisMonth}
                              onChange={(e) => updateGridRow(row.id, "rentPaidThisMonth", e.target.checked)}
                              className="w-4 h-4 accent-emerald-600 cursor-pointer"
                            />
                          </td>
                          {showOptionalColumns && (
                            <>
                              <td className="px-1.5 py-1.5">
                                <input
                                  type="text"
                                  value={row.parentsName || ""}
                                  onChange={(e) => updateGridRow(row.id, "parentsName", e.target.value)}
                                  placeholder="Optional"
                                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="px-1.5 py-1.5">
                                <input
                                  type="tel"
                                  maxLength={10}
                                  value={row.parentsPhone || ""}
                                  onChange={(e) => updateGridRow(row.id, "parentsPhone", e.target.value)}
                                  placeholder="Optional"
                                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="px-1.5 py-1.5">
                                <input
                                  type="text"
                                  value={row.emergencyContactName || ""}
                                  onChange={(e) => updateGridRow(row.id, "emergencyContactName", e.target.value)}
                                  placeholder="Optional"
                                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="px-1.5 py-1.5">
                                <input
                                  type="tel"
                                  maxLength={10}
                                  value={row.emergencyContactPhone || ""}
                                  onChange={(e) => updateGridRow(row.id, "emergencyContactPhone", e.target.value)}
                                  placeholder="Optional"
                                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="px-1.5 py-1.5">
                                <input
                                  type="text"
                                  value={row.emergencyRelation || ""}
                                  onChange={(e) => updateGridRow(row.id, "emergencyRelation", e.target.value)}
                                  placeholder="Father / Mother"
                                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="px-1.5 py-1.5">
                                <input
                                  type="number"
                                  min={10}
                                  max={120}
                                  value={row.age ?? ""}
                                  onChange={(e) => updateGridRow(row.id, "age", e.target.value)}
                                  placeholder="Age"
                                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="px-1.5 py-1.5">
                                <input
                                  type="text"
                                  maxLength={12}
                                  value={row.aadhaarNumber || ""}
                                  onChange={(e) => updateGridRow(row.id, "aadhaarNumber", e.target.value)}
                                  placeholder="Aadhaar (Opt.)"
                                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="px-1.5 py-1.5">
                                <input
                                  type="text"
                                  maxLength={10}
                                  value={row.panNumber || ""}
                                  onChange={(e) => updateGridRow(row.id, "panNumber", e.target.value.toUpperCase())}
                                  placeholder="PAN (Opt.)"
                                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono font-medium uppercase text-slate-900 placeholder:text-slate-400 placeholder:normal-case placeholder:font-sans focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                            </>
                          )}
                          <td className="px-1.5 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeGridRow(row.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-[10.5px] text-slate-500">
                💡 <strong>Pro Tip:</strong> Jinka Room empty hai unki Name/Phone line blank chhod dein — system sirf bhari hui lines hi import karega. Agar koi Room abhi tak bana nahi hai, toh wo bhi automatically create ho jayega!
              </p>
            </div>
          ) : (
            /* ================================================================= */
            /* TAB 3: EXCEL / CSV FILE UPLOAD & PREVIEW VALIDATOR                */
            /* ================================================================= */
            <div className="space-y-3.5">
              {/* Step 1: Download Sample Template */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="text-xs font-black text-slate-900">1. Excel / CSV Template Download Karein</h4>
                  <p className="text-[11px] text-slate-500">
                    Is file ko Excel ya Google Sheets me kholein, saare 80+ students bharein, aur CSV me Save karke upload karein.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template (.csv)</span>
                </button>
              </div>

              {/* Step 2: File Dropzone / Picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 hover:bg-indigo-50/80 transition text-center cursor-pointer space-y-1.5"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-indigo-600 mx-auto" />
                <div className="text-xs font-black text-indigo-950">
                  {uploadedFileName
                    ? `📄 Loaded: ${uploadedFileName}`
                    : "Click here to select your .CSV file from Computer / Phone"}
                </div>
                <p className="text-[10.5px] text-indigo-600">
                  Missing buildings, floors, and rooms inside your CSV are automatically created!
                </p>
              </div>

              {/* Optional Textarea for raw paste */}
              <details className="text-xs">
                <summary className="font-bold text-slate-500 cursor-pointer hover:text-slate-800 select-none">
                  Or paste CSV / Excel text manually here...
                </summary>
                <textarea
                  rows={4}
                  value={csvRawText}
                  onChange={(e) => handleCsvTextChange(e.target.value)}
                  placeholder="building,floor,room_number,sharing,rent,tenant_name,phone,deposit_amount,deposit_paid,rent_paid_this_month"
                  className="w-full mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[10.5px] text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </details>

              {/* Step 3: Live Validation Preview Table */}
              {csvParsedRows.length > 0 && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9.5px] sticky top-0">
                      <tr>
                        <th className="px-2.5 py-2">#</th>
                        <th className="px-2.5 py-2">Room</th>
                        <th className="px-2.5 py-2">Name</th>
                        <th className="px-2.5 py-2">Mobile</th>
                        <th className="px-2.5 py-2">Rent</th>
                        <th className="px-2.5 py-2">Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {csvParsedRows.map((r) => (
                        <tr key={r.id} className={r.isValid ? "" : "bg-rose-50/70"}>
                          <td className="px-2.5 py-1.5 text-slate-400 font-bold">{r.rowIndex}</td>
                          <td className="px-2.5 py-1.5 font-black text-slate-900">{r.roomNumber || "—"}</td>
                          <td className="px-2.5 py-1.5 font-bold text-slate-800">{r.tenantName || "—"}</td>
                          <td className="px-2.5 py-1.5 font-mono text-slate-600">{r.cleanPhone || r.phone || "—"}</td>
                          <td className="px-2.5 py-1.5 font-bold text-slate-700">₹{r.rent}</td>
                          <td className="px-2.5 py-1.5">
                            {r.isValid ? (
                              <span className="text-emerald-700 font-bold text-[10px]">✓ Ready</span>
                            ) : (
                              <span className="text-rose-700 font-bold text-[10px]">{r.errors.join(", ")}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* LIVE CHUNK PROGRESS BAR DURING IMPORT */}
          {isImporting && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-indigo-950">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  {progressText || "Importing residents..."}
                </span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-indigo-200/70 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.max(8, progressPct)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FOOTER ACTION BAR (When on Grid or CSV Tab) */}
        {!finalSummary && (activeTab === "grid" || activeTab === "csv") && (
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={createLogins}
                  onChange={(e) => setCreateLogins(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <span>Auto-Create App Login Passwords (e.g. Harshit@6788)</span>
              </label>
              <div className="text-[10.5px] font-bold flex items-center gap-2">
                <span className="text-emerald-700">✓ {validRowsOnly.length} Ready to Import</span>
                {invalidRowsOnly.length > 0 && (
                  <span className="text-rose-600">• ⚠ {invalidRowsOnly.length} Needs Attention</span>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={isImporting || validRowsOnly.length === 0}
              onClick={handleRunBulkImport}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white text-xs font-black shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>
                {isImporting
                  ? "Importing..."
                  : `Import ${validRowsOnly.length} Resident${validRowsOnly.length === 1 ? "" : "s"} Now`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
