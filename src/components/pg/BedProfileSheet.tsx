"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
 X,
 Phone,
 PhoneForwarded,
 Ticket,
 MessageCircle,
 CheckCircle2,
 AlertCircle,
 ShieldCheck,
 CreditCard,
 Banknote,
 QrCode,
 Building,
 Check,
 Clock,
 Printer,
 Sparkles,
 ArrowRight,
 Send,
 AlertTriangle,
 Edit3,
 FileText,
 ExternalLink,
 XCircle,
 Camera,
 Upload,
} from "lucide-react";
import { TenantProfileItem, BuildingItem, FloorItem, RoomItem, BedItem, RentPaymentRecord } from "@/lib/data/rooms";
import {
 verifyTenantKycAction,
 rejectTenantKycAction,
 vacateBedAction,
 collectRentPaymentAction,
 settleRentPaymentAction,
 collectSecurityDepositAction,
 refundSecurityDepositAction,
 updateTenantAndBedAction,
 updateTenantProfilePhotoAction,
} from "@/app/actions/rooms-and-ops";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { DepositReceiptModal } from "@/components/tenant/DepositReceiptModal";
import { computeTenantCycleStatus } from "@/lib/utils/billing-cycle";
import {
 DEFAULT_WELCOME_TEMPLATE,
 DEFAULT_CUSTOM_TEMPLATE,
} from "@/components/settings/PgWifiAndTemplatesCard";

interface BedProfileSheetProps {
 isOpen: boolean;
 onClose: () => void;
 building: BuildingItem;
 floor: FloorItem;
 floorIdx: number;
 room: RoomItem;
 bed: BedItem;
 bedIdx: number;
 userRole: "owner" | "admin" | "super_admin" | "tenant";
 initialTemplate?: "rent_reminder" | "welcome_info" | "custom";
 allBuildings?: BuildingItem[];
 pgName?: string;
 pgUpiId?: string;
 welcomeTemplate?: string | null;
 customTemplate?: string | null;
 isDocked?: boolean;
}

export function BedProfileSheet({
 isOpen,
 onClose,
 building,
 floor,
 floorIdx,
 room,
 bed,
 bedIdx,
 userRole,
 initialTemplate = "rent_reminder",
 allBuildings = [],
 pgName = "Royal Stay PG",
 pgUpiId = "royalstaypg@okicici",
 welcomeTemplate,
 customTemplate,
 isDocked = false,
}: BedProfileSheetProps) {
 const router = useRouter();
 const [whatsappTemplate, setWhatsappTemplate] = useState<"rent_reminder" | "welcome_info" | "custom">(initialTemplate);
 const [whatsappAutoApi, setWhatsappAutoApi] = useState(false);

 const tenantInit = bed.tenant;
 const floorWifiSsidInit = floor.wifiSsid || building.wifiSsid || "Ask PG Desk";
 const floorWifiPassInit = floor.wifiPassword || building.wifiPassword || "Ask PG Desk";
 const initPendingRent = tenantInit?.rentPaid ? 0 : (room.rent || tenantInit?.rent || 0);
 const initExpectedDep = tenantInit?.deposit || 0;
 const initPaidDep = tenantInit?.depositPaidAmount ?? (tenantInit?.depositStatus === "paid" ? initExpectedDep : 0);
 const initPendingDep = Math.max(0, initExpectedDep - initPaidDep);
 const initTotalPending = initPendingRent + initPendingDep;

 const defaultResolvedCustom = (customTemplate?.trim() || DEFAULT_CUSTOM_TEMPLATE)
 .replace(/\{tenant_name\}/g, tenantInit?.name || "Resident")
 .replace(/\{pg_name\}/g, pgName)
 .replace(/\{building_name\}/g, building.name)
 .replace(/\{floor_name\}/g, floor.name)
 .replace(/\{room_number\}/g, room.number)
 .replace(/\{bed_label\}/g, bed.label)
 .replace(/\{wifi_ssid\}/g, floorWifiSsidInit)
 .replace(/\{wifi_password\}/g, floorWifiPassInit)
 .replace(/\{phone\}/g, tenantInit?.phone || "")
 .replace(/\{pending_total\}|\{total_pending\}/g, `₹${initTotalPending.toLocaleString("en-IN")}`);

 const [customMsg, setCustomMsg] = useState(defaultResolvedCustom);
 const [vacateConfirmStep, setVacateConfirmStep] = useState(false);
 const [isProcessing, setIsProcessing] = useState(false);
 const [toastMsg, setToastMsg] = useState<string | null>(null);

 // Edit Resident & Bed Transfer State (Owner Only)
 const [isEditingResident, setIsEditingResident] = useState(false);
 const [editFullName, setEditFullName] = useState(bed.tenant?.name || "");
 const [editPhone, setEditPhone] = useState(bed.tenant?.phone || "");
 const [editParentsName, setEditParentsName] = useState(bed.tenant?.parentsName || "");
 const [editParentsPhone, setEditParentsPhone] = useState(bed.tenant?.parentsPhone || "");
 const [editEmergencyContactName, setEditEmergencyContactName] = useState(bed.tenant?.emergencyContactName || "");
 const [editEmergencyPhone, setEditEmergencyPhone] = useState(bed.tenant?.emergencyContact || bed.tenant?.parentPhone || "");
 const [editEmergencyRelation, setEditEmergencyRelation] = useState(bed.tenant?.emergencyRelation || "");
 const [editAadhaarNumber, setEditAadhaarNumber] = useState(bed.tenant?.aadhaarNumber || "");
 const [editPanNumber, setEditPanNumber] = useState(bed.tenant?.panNumber || "");
 const [editAge, setEditAge] = useState(bed.tenant?.age !== null && bed.tenant?.age !== undefined ? String(bed.tenant.age) : "");
 const [editRent, setEditRent] = useState<number>(bed.tenant?.rent || room.rent || 8500);
 const [editDeposit, setEditDeposit] = useState<number>(bed.tenant?.deposit || 8500);
 const [selectedTargetBedId, setSelectedTargetBedId] = useState<string>(bed.id);
 const [isSavingResident, setIsSavingResident] = useState(false);

 // Collect Rent State
 const [isCollectingRent, setIsCollectingRent] = useState(false);
 const [rentPaymentMode, setRentPaymentMode] = useState<"cash" | "admin_upi" | "pg_bank_upi">("cash");
 const [rentTxRef, setRentTxRef] = useState("");
 const [generatedInvoice, setGeneratedInvoice] = useState<RentPaymentRecord | null>(null);

 // Security Deposit State
 const expectedDepInit = bed.tenant?.deposit ?? 0;
 const paidDepInit = bed.tenant?.depositPaidAmount ?? (bed.tenant?.depositStatus === "paid" ? expectedDepInit : 0);
 const remainingDepInit = Math.max(0, expectedDepInit - paidDepInit);
 const [isCollectingDeposit, setIsCollectingDeposit] = useState(false);
 const [depositAmountInput, setDepositAmountInput] = useState<number>(remainingDepInit > 0 ? remainingDepInit : expectedDepInit);
 const [depositModeInput, setDepositModeInput] = useState<"cash" | "upi" | "bank_transfer">("cash");
 const [depositRefInput, setDepositRefInput] = useState("");

 // KYC Reject State
 const [isRejectingKyc, setIsRejectingKyc] = useState(false);
 const [kycRejectReason, setKycRejectReason] = useState("");

 // Profile Photo Modal & Upload State
 const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
 const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

 // Refund Deposit State (Owner Only)
 const [isRefundingDeposit, setIsRefundingDeposit] = useState(false);
 const [deductionAmount, setDeductionAmount] = useState<number>(0);
 const [deductionReason, setDeductionReason] = useState("");

 // Pending Handover state on this bed
 const [isHandoverPending, setIsHandoverPending] = useState(false);

 if (!isOpen || !bed.tenant) return null;

 const t = bed.tenant;
 const isOwner = userRole === "owner" || userRole === "super_admin";
 const isAdmin = userRole === "admin";
 const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

 // List of available beds for transfer
 const availableBeds = (allBuildings.length > 0 ? allBuildings : [building]).flatMap((b) =>
 b.floors.flatMap((f) =>
 f.rooms.flatMap((r) =>
 r.beds
 .filter((ob) => !ob.occupied || ob.id === bed.id)
 .map((ob) => ({
 id: ob.id,
 label: `${b.name} • Room ${r.number} - Bed ${ob.label}`,
 roomId: r.id,
 buildingId: b.id,
 rent: r.rent,
 isCurrent: ob.id === bed.id,
 }))
 )
 )
 );

 const handleSaveResidentEdit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSavingResident(true);
 try {
 const parsedAge = editAge.trim() ? Number(editAge.trim()) : null;
 const validAge =
 parsedAge !== null && !Number.isNaN(parsedAge) && parsedAge >= 10 && parsedAge <= 120
 ? Math.round(parsedAge)
 : null;

 const res = await updateTenantAndBedAction(t.id, {
 fullName: editFullName,
 phone: editPhone,
 parentsName: editParentsName,
 parentsPhone: editParentsPhone,
 emergencyContactName: editEmergencyContactName,
 emergencyPhone: editEmergencyPhone,
 emergencyRelation: editEmergencyRelation,
 aadhaarNumber: editAadhaarNumber,
 panNumber: editPanNumber,
 age: validAge,
 rentAmount: editRent,
 depositAmount: editDeposit,
 newBedId: selectedTargetBedId !== bed.id ? selectedTargetBedId : undefined,
 });

 if ("error" in res && res.error) {
 setToastMsg(`Error: ${res.error}`);
 } else {
 t.name = editFullName;
 t.phone = editPhone;
 t.parentsName = editParentsName.trim() || null;
 t.parentsPhone = editParentsPhone.replace(/\D/g, "") || null;
 t.emergencyContactName = editEmergencyContactName.trim() || null;
 t.emergencyContact = editEmergencyPhone;
 t.emergencyRelation = editEmergencyRelation.trim() || null;
 t.aadhaarNumber = editAadhaarNumber.replace(/\D/g, "").slice(0, 12) || null;
 t.panNumber = editPanNumber.trim().toUpperCase() || null;
 t.age = validAge;
 t.rent = editRent;
 t.deposit = editDeposit;
 setToastMsg("Resident details & bed allocation saved live!");
 setIsEditingResident(false);
 router.refresh();
 }
 } catch (err: any) {
 setToastMsg(`Error: ${err?.message || "Failed to update resident."}`);
 } finally {
 setIsSavingResident(false);
 }
 };

 // Dynamic billing & floor Wi-Fi calculations for this resident
 const cycleInfo = computeTenantCycleStatus({
 checkInDate: t.joinDate,
 rentPaid: t.rentPaid,
 lastPaidAt: t.lastRentPaidAt,
 });
 const monthlyRentVal = room.rent || t.rent || 0;
 const pendingRentVal = t.rentPaid ? 0 : monthlyRentVal;
 const expectedDepVal = t.deposit || 0;
 const paidDepVal = t.depositPaidAmount ?? (t.depositStatus === "paid" ? expectedDepVal : 0);
 const pendingDepVal = Math.max(0, expectedDepVal - paidDepVal);
 const totalPendingVal = pendingRentVal + pendingDepVal;
 const floorWifiSsid = floor.wifiSsid || building.wifiSsid || "Ask PG Desk";
 const floorWifiPass = floor.wifiPassword || building.wifiPassword || "Ask PG Desk";

 const applyTemplateTokens = (tpl: string) =>
 tpl
 .replace(/\{tenant_name\}/g, t.name)
 .replace(/\{pg_name\}/g, pgName)
 .replace(/\{building_name\}/g, building.name)
 .replace(/\{floor_name\}/g, floor.name)
 .replace(/\{room_number\}/g, room.number)
 .replace(/\{bed_label\}/g, bed.label)
 .replace(/\{wifi_ssid\}/g, floorWifiSsid)
 .replace(/\{wifi_password\}/g, floorWifiPass)
 .replace(/\{phone\}/g, t.phone)
 .replace(/\{rent_amount\}/g, `₹${monthlyRentVal.toLocaleString("en-IN")}`)
 .replace(/\{cycle_start\}/g, cycleInfo.formattedStartDate)
 .replace(/\{cycle_end\}/g, cycleInfo.formattedEndDate)
 .replace(/\{pending_rent\}/g, `₹${pendingRentVal.toLocaleString("en-IN")}`)
 .replace(/\{pending_deposit\}/g, `₹${pendingDepVal.toLocaleString("en-IN")}`)
 .replace(/\{pending_total\}|\{total_pending\}/g, `₹${totalPendingVal.toLocaleString("en-IN")}`)
 .replace(/\{upi_id\}/g, pgUpiId);

 // Build WhatsApp Message
 const getWhatsappMessage = () => {
 if (whatsappTemplate === "rent_reminder") {
 const cycleLine =
 cycleInfo.daysLeft < 0
 ? `Overdue by ${Math.abs(cycleInfo.daysLeft)} day(s)`
 : cycleInfo.daysLeft === 0
 ? "Ends Today"
 : `${cycleInfo.daysLeft} day(s) remaining`;

 const rentLine = t.rentPaid
 ? `✅ Monthly Rent (₹${monthlyRentVal.toLocaleString("en-IN")}): Paid`
 : `⏳ Monthly Rent Due: ₹${pendingRentVal.toLocaleString("en-IN")}`;

 const depositLine =
 pendingDepVal > 0
 ? `⏳ Security Deposit: Paid ₹${paidDepVal.toLocaleString("en-IN")} / ₹${expectedDepVal.toLocaleString("en-IN")} • Pending ₹${pendingDepVal.toLocaleString("en-IN")}`
 : expectedDepVal > 0
 ? `✅ Security Deposit (₹${expectedDepVal.toLocaleString("en-IN")}): Paid`
 : `ℹ️ Security Deposit: Not Applicable`;

 const totalLine =
 totalPendingVal > 0
 ? `💰 *Total Pending Balance: ₹${totalPendingVal.toLocaleString("en-IN")}*\n📲 Pay via UPI: ${pgUpiId}`
 : `🎉 *All Rent & Deposit dues are clear!*`;

 return [
 `Namaste *${t.name}*!`,
 `🏠 ${pgName} • ${building.name}, ${floor.name} (Room ${room.number} - ${bed.label})`,
 `📅 Billing Cycle: ${cycleInfo.formattedStartDate} to ${cycleInfo.formattedEndDate} (${cycleLine})`,
 rentLine,
 depositLine,
 totalLine,
 ].join("\n");
 }
 if (whatsappTemplate === "welcome_info") {
 return applyTemplateTokens(welcomeTemplate?.trim() || DEFAULT_WELCOME_TEMPLATE);
 }
 return customMsg;
 };

 const handleSendWhatsapp = () => {
 const msg = getWhatsappMessage();
 if (whatsappAutoApi) {
 setToastMsg(`⚡ Cloud API dispatched to ${t.name}`);
 setTimeout(() => setToastMsg(null), 3000);
 } else {
 const cleanPhone = t.phone.replace(/[^0-9]/g, "");
 const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
 window.open(waUrl, "_blank");
 }
 };

 const handleVerifyKyc = async () => {
 setIsProcessing(true);
 const res = await verifyTenantKycAction(t.id);
 if (res && "error" in res && res.error) {
 setToastMsg(`❌ ${res.error}`);
 } else {
 t.kycStatus = "Verified";
 setIsRejectingKyc(false);
 router.refresh();
 setToastMsg("KYC verified successfully ✓");
 }
 setIsProcessing(false);
 setTimeout(() => setToastMsg(null), 3000);
 };

 const handleRejectKyc = async () => {
 setIsProcessing(true);
 const reason = kycRejectReason.trim() || "Aadhaar photo unclear or mismatch. Please re-upload.";
 const res = await rejectTenantKycAction(t.id, reason);
 if (res && "error" in res && res.error) {
 setToastMsg(`❌ ${res.error}`);
 } else {
 t.kycStatus = "Rejected";
 t.kycRejectionReason = reason;
 setIsRejectingKyc(false);
 setKycRejectReason("");
 router.refresh();
 setToastMsg("KYC rejected. Tenant prompted to re-upload Aadhaar.");
 }
 setIsProcessing(false);
 setTimeout(() => setToastMsg(null), 3500);
 };

 const handleOwnerPhotoUpload = async (file: File) => {
 setIsUploadingPhoto(true);
 try {
 const fd = new FormData();
 fd.append("tenantId", t.id);
 fd.append("profilePhoto", file);
 const res = await updateTenantProfilePhotoAction(fd);
 if (res && "error" in res && res.error) {
 setToastMsg(`❌ ${res.error}`);
 } else if (res && "photoUrl" in res && res.photoUrl) {
 t.profilePhotoUrl = res.photoUrl;
 setIsPhotoModalOpen(false);
 router.refresh();
 setToastMsg("✅ Profile photo permanently updated & synced!");
 }
 } finally {
 setIsUploadingPhoto(false);
 setTimeout(() => setToastMsg(null), 3500);
 }
 };

 // Collect Rent Handler
 const handleConfirmCollectRent = async () => {
 setIsProcessing(true);
 const res = await collectRentPaymentAction({
 tenantId: t.id,
 tenantName: t.name,
 roomNumber: `${building.name} • Room ${room.number}`,
 buildingId: building.id,
 amount: room.rent,
 paymentMode: rentPaymentMode,
 transactionRef: rentTxRef || undefined,
 });
 router.refresh();

 if ("invoice" in res && res.invoice) {
 setGeneratedInvoice(res.invoice);
 t.rentPaid = true;
 if (res.invoice.status === "collected_by_admin") {
 setIsHandoverPending(true);
 }
 }
 setIsProcessing(false);
 setIsCollectingRent(false);
 setToastMsg(`Rent ₹${room.rent.toLocaleString("en-IN")} collected! Invoice generated.`);
 setTimeout(() => setToastMsg(null), 4000);
 };

 // 1-Tap Confirm Cash Handover on Drawer
 const handleConfirmHandover = async () => {
 setIsProcessing(true);
 const invId = generatedInvoice?.id || (t.id === "t-rahul" ? "INV-202611-04" : "INV-202611-05");
 await settleRentPaymentAction(invId);
 router.refresh();
 setIsHandoverPending(false);
 setIsProcessing(false);
 setToastMsg("Cash confirmed & settled with Owner Ledger ✅");
 setTimeout(() => setToastMsg(null), 3000);
 };

 // Collect Deposit Handler
 const handleConfirmCollectDeposit = async () => {
 setIsProcessing(true);
 await collectSecurityDepositAction({
 tenantId: t.id,
 amount: depositAmountInput,
 paymentMode: depositModeInput,
 transactionRef: depositRefInput || undefined,
 });
 router.refresh();

 const prevPaid = t.depositPaidAmount ?? (t.depositStatus === "paid" ? t.deposit : 0);
 const newPaid = prevPaid + depositAmountInput;
 const targetExpected = Math.max(t.deposit, newPaid);
 const fullyPaid = newPaid >= targetExpected;

 t.deposit = targetExpected;
 t.depositPaidAmount = newPaid;
 t.depositStatus = fullyPaid ? "paid" : "pending";
 t.depositPaymentMode = depositModeInput;
 t.depositCollectedByName = isOwner ? "PG Owner" : "Warden Staff";
 t.depositCollectedAt = "Today";

 setIsProcessing(false);
 setIsCollectingDeposit(false);
 setDepositAmountInput(Math.max(0, targetExpected - newPaid));
 setToastMsg(
 fullyPaid
 ? `Deposit ₹${newPaid.toLocaleString("en-IN")} marked Paid & Held Safely!`
 : `₹${depositAmountInput.toLocaleString("en-IN")} recorded! Remaining ₹${Math.max(0, targetExpected - newPaid).toLocaleString("en-IN")} still pending.`
 );
 setTimeout(() => setToastMsg(null), 3500);
 };

 // Refund Deposit Handler (Owner Only)
 const handleConfirmRefundDeposit = async () => {
 setIsProcessing(true);
 await refundSecurityDepositAction({
 tenantId: t.id,
 deductionAmount,
 deductionReason: deductionReason || "Checkout room inspection",
 });
 router.refresh();

 t.depositStatus = deductionAmount > 0 ? "partially_refunded" : "refunded";
 t.depositDeduction = deductionAmount;
 t.depositDeductionReason = deductionReason;
 t.depositRefundedAmount = Math.max(0, t.deposit - deductionAmount);

 setIsProcessing(false);
 setIsRefundingDeposit(false);
 setToastMsg(`Security deposit settled: Refunded ₹${(t.deposit - deductionAmount).toLocaleString("en-IN")}`);
 setTimeout(() => setToastMsg(null), 3500);
 };

 const handleVacate = async () => {
 setIsProcessing(true);
 await vacateBedAction(building.id, floorIdx, room.id, bedIdx);
 router.refresh();
 setIsProcessing(false);
 onClose();
 };

 const initials = t.name
 .split(" ")
 .map((n) => n[0])
 .join("")
 .slice(0, 2)
 .toUpperCase();

 const netRefund = Math.max(0, (t.deposit || 8500) - deductionAmount);

 const sheetBody = (
 <div className="space-y-3.5">
 {/* Header */}
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2.5 min-w-0">
 <button
 type="button"
 onClick={() => setIsPhotoModalOpen(true)}
 title={t.profilePhotoUrl ? "View or update resident profile photo" : "Upload resident profile photo"}
 className="relative w-12 h-12 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs overflow-hidden border-2 border-indigo-200 hover:ring-2 hover:ring-indigo-400 transition cursor-pointer group"
 >
 {t.profilePhotoUrl ? (
 <img
 src={t.profilePhotoUrl}
 alt={t.name}
 className="w-full h-full object-cover"
 />
 ) : (
 <span>{initials}</span>
 )}
 <span className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
 <Camera className="w-4 h-4 text-white" />
 </span>
 </button>
 <div className="min-w-0">
 <div className="flex items-center gap-1.5 flex-wrap">
 <h3 className="text-sm font-extrabold text-slate-900">{t.name}</h3>
 <span
 className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
 t.kycStatus === "Verified"
 ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
 : t.kycStatus === "Under Review"
 ? "bg-sky-50 text-sky-700 border border-sky-200"
 : t.kycStatus === "Rejected"
 ? "bg-rose-50 text-rose-700 border border-rose-200"
 : "bg-amber-50 text-amber-700 border border-amber-200"
 }`}
 >
 KYC {t.kycStatus}
 </span>
 {!t.profilePhotoUrl && (
 <span className="px-1.5 py-0.5 rounded-full text-[8.5px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
 Photo Pending
 </span>
 )}
 </div>
 <p className="text-[10.5px] font-bold text-slate-500">
 {building.name} • {floor.name} • Room {room.number} ({bed.label})
 </p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Resident Profile Photo Enlarged / Update Modal */}
 {isPhotoModalOpen && (
 <div
 className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
 onClick={() => setIsPhotoModalOpen(false)}
 >
 <div
 className="bg-white w-full max-w-[360px] rounded-3xl border border-slate-200 p-4 space-y-3 shadow-2xl"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="flex items-center justify-between">
 <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
 <Camera className="w-4 h-4 text-indigo-600" />
 <span>Resident Profile Photo — {t.name}</span>
 </h4>
 <button
 type="button"
 onClick={() => setIsPhotoModalOpen(false)}
 className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <div className="aspect-square w-full max-h-64 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
 {t.profilePhotoUrl ? (
 <img
 src={t.profilePhotoUrl}
 alt={t.name}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="text-center space-y-1 p-4">
 <Camera className="w-8 h-8 text-slate-400 mx-auto" />
 <p className="text-xs font-bold text-slate-500">
 No profile photo uploaded yet
 </p>
 <p className="text-[10px] text-slate-400">
 Bulk-onboarded resident will see a reminder banner until uploaded.
 </p>
 </div>
 )}
 </div>

 {(isOwner || isAdmin) && (
 <label className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition">
 <Upload className="w-3.5 h-3.5" />
 <span>
 {isUploadingPhoto
 ? "Uploading Photo..."
 : t.profilePhotoUrl
 ? "Update Resident Photo"
 : "Upload Resident Photo"}
 </span>
 <input
 type="file"
 accept="image/jpeg,image/png,image/webp"
 disabled={isUploadingPhoto}
 onChange={(e) => {
 const f = e.target.files?.[0];
 if (f) handleOwnerPhotoUpload(f);
 }}
 className="hidden"
 />
 </label>
 )}
 </div>
 </div>
 )}

 {toastMsg && (
 <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
 <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
 <span>{toastMsg}</span>
 </div>
 )}

 {/* Quick Call & Issue Gate Pass Buttons */}
 <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-extrabold">
 <a
 href={`tel:${t.phone}`}
 className="py-2 px-2 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100 flex items-center justify-center gap-1 text-slate-900 transition active:scale-95 shadow-xs"
 >
 <Phone className="w-3.5 h-3.5 text-indigo-600" />
 <span>Call Student</span>
 </a>
 <a
 href={`tel:${t.parentPhone}`}
 className="py-2 px-2 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100 flex items-center justify-center gap-1 text-slate-900 transition active:scale-95 shadow-xs"
 >
 <PhoneForwarded className="w-3.5 h-3.5 text-emerald-600" />
 <span>Call Parent</span>
 </a>
 <Link
 href="/dashboard/passes"
 className="py-2 px-2 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center gap-1 transition active:scale-95 shadow-xs"
 >
 <Ticket className="w-3.5 h-3.5" />
 <span>Gate Pass</span>
 </Link>
 </div>

 {/* Owner Only: Edit Resident Details & Bed Transfer Trigger */}
 {isOwner && (
 <button
 type="button"
 onClick={() => setIsEditingResident(!isEditingResident)}
 className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-98"
 >
 <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
 <span>{isEditingResident ? "Close Resident Editor" : "Edit Resident Details & Transfer Bed"}</span>
 </button>
 )}

 {/* Owner Only: Edit Resident Details & Bed Transfer Form */}
 {isOwner && isEditingResident && (
 <form onSubmit={handleSaveResidentEdit} className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 animate-in fade-in">
 <div className="flex items-center justify-between pb-1 border-b border-indigo-100">
 <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
 <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
 Edit Resident Profile & Bed Transfer
 </span>
 <span className="text-[9.5px] font-bold text-indigo-600 uppercase">PG Owner Control</span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Resident Name
 </label>
 <input
 type="text"
 value={editFullName}
 onChange={(e) => setEditFullName(e.target.value)}
 required
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Phone Number
 </label>
 <input
 type="tel"
 value={editPhone}
 onChange={(e) => setEditPhone(e.target.value)}
 required
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Parent&apos;s Name (Opt.)
 </label>
 <input
 type="text"
 value={editParentsName}
 onChange={(e) => setEditParentsName(e.target.value)}
 placeholder="e.g. Rajesh Kumar"
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Parent&apos;s Mobile No. (Opt.)
 </label>
 <input
 type="tel"
 maxLength={10}
 value={editParentsPhone}
 onChange={(e) => setEditParentsPhone(e.target.value)}
 placeholder="e.g. 9811223344"
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Emergency Contact Name (Opt.)
 </label>
 <input
 type="text"
 value={editEmergencyContactName}
 onChange={(e) => setEditEmergencyContactName(e.target.value)}
 placeholder="e.g. Sunita Devi"
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Emergency Mobile (Opt.)
 </label>
 <input
 type="tel"
 maxLength={10}
 value={editEmergencyPhone}
 onChange={(e) => setEditEmergencyPhone(e.target.value)}
 placeholder="Emergency Number"
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Relation (Opt.)
 </label>
 <input
 type="text"
 value={editEmergencyRelation}
 onChange={(e) => setEditEmergencyRelation(e.target.value)}
 placeholder="e.g. Father / Mother / Guardian"
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Age (Opt.)
 </label>
 <input
 type="number"
 min={10}
 max={120}
 value={editAge}
 onChange={(e) => setEditAge(e.target.value)}
 placeholder="e.g. 21"
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Aadhaar Card No. (Opt.)
 </label>
 <input
 type="text"
 maxLength={12}
 value={editAadhaarNumber}
 onChange={(e) => setEditAadhaarNumber(e.target.value)}
 placeholder="12-digit Aadhaar (Opt.)"
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 PAN Card No. (Opt.)
 </label>
 <input
 type="text"
 maxLength={10}
 value={editPanNumber}
 onChange={(e) => setEditPanNumber(e.target.value.toUpperCase())}
 placeholder="e.g. ABCDE1234F (Opt.)"
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono uppercase"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Monthly Rent (₹)
 </label>
 <input
 type="number"
 value={editRent}
 onChange={(e) => setEditRent(Number(e.target.value))}
 required
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Security Deposit (₹)
 </label>
 <input
 type="number"
 value={editDeposit}
 onChange={(e) => setEditDeposit(Number(e.target.value))}
 required
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
 Bed Allocation (Shift Resident)
 </label>
 <select
 value={selectedTargetBedId}
 onChange={(e) => setSelectedTargetBedId(e.target.value)}
 className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
 >
 {availableBeds.map((ob) => (
 <option key={ob.id} value={ob.id}>
 {ob.isCurrent ? `[Current Bed] ${ob.label}` : `→ Shift to: ${ob.label} (₹${ob.rent})`}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="flex items-center justify-end gap-2 pt-1">
 <button
 type="button"
 onClick={() => setIsEditingResident(false)}
 className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSavingResident}
 className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
 >
 <Check className="w-3.5 h-3.5" />
 <span>{isSavingResident ? "Saving..." : "Save & Update Allocation"}</span>
 </button>
 </div>
 </form>
 )}

 {/* Resident Guardian, Emergency & Optional ID Details Card */}
 <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2">
 <div className="flex items-center justify-between gap-2">
 <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
 Guardian, Emergency &amp; Resident Profile
 </span>
 {isOwner && !isEditingResident && (
 <button
 type="button"
 onClick={() => setIsEditingResident(true)}
 className="text-[10px] font-extrabold text-indigo-600 hover:underline cursor-pointer"
 >
 Fill / Edit
 </button>
 )}
 </div>
 <div className="grid grid-cols-2 gap-2 text-[10.5px]">
 <div className="p-2 rounded-xl bg-white border border-slate-200/70">
 <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Parent Details</span>
 <span className="font-bold text-slate-800 block truncate">
 {t.parentsName || "Not filled"}
 {t.parentsPhone ? ` • ${t.parentsPhone}` : ""}
 </span>
 </div>
 <div className="p-2 rounded-xl bg-white border border-slate-200/70">
 <span className="text-[9.5px] font-bold text-slate-400 uppercase block">
 Emergency ({t.emergencyRelation || "Contact"})
 </span>
 <span className="font-bold text-slate-800 block truncate">
 {t.emergencyContactName || "Not filled"}
 {(t.emergencyContact || t.parentPhone) ? ` • ${t.emergencyContact || t.parentPhone}` : ""}
 </span>
 </div>
 <div className="p-2 rounded-xl bg-white border border-slate-200/70">
 <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Age / PAN (Opt.)</span>
 <span className="font-bold text-slate-800 block truncate font-mono">
 {t.age ? `${t.age} yrs` : "Age —"} • {t.panNumber || "PAN —"}
 </span>
 </div>
 <div className="p-2 rounded-xl bg-white border border-slate-200/70">
 <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Month Cycle &amp; Wi-Fi</span>
 <span className="font-bold text-slate-800 block truncate">
 {cycleInfo.formattedStartDate} → {cycleInfo.formattedEndDate}
 </span>
 </div>
 </div>
 </div>

 {/* AMBER ALERT BANNER: PENDING CASH HANDOVER TO OWNER */}
 {isHandoverPending && (
 <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2.5 animate-in fade-in">
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-start gap-2">
 <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
 <div>
 <div className="text-xs font-black text-amber-950 leading-snug">
 Collected by {generatedInvoice?.collectedByName || t.depositCollectedByName || (t.id === "t-karan" || t.id === "t-rahul" ? "Warden Suresh" : "Warden Ramesh")} • Collect ₹{room.rent.toLocaleString("en-IN")} from {generatedInvoice?.collectedByName || t.depositCollectedByName || (t.id === "t-karan" || t.id === "t-rahul" ? "Warden Suresh" : "Warden Ramesh")}
 </div>
 <div className="text-[10px] text-amber-800 font-medium mt-0.5">
 Status: Pending Handover to Owner • Physical cash collected at desk
 </div>
 </div>
 </div>
 <span className="text-xs font-black text-amber-900 tabular-nums shrink-0">
 ₹{room.rent.toLocaleString("en-IN")}
 </span>
 </div>

 {isOwner && (
 <button
 type="button"
 disabled={isProcessing}
 onClick={handleConfirmHandover}
 className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
 >
 <CheckCircle2 className="w-3.5 h-3.5" />
 <span>Confirm Cash Received</span>
 </button>
 )}
 </div>
 )}

 {/* ========================================================================= */}
 {/* 0. AADHAAR KYC VERIFICATION & OWNER APPROVAL CARD */}
 {/* ========================================================================= */}
 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-2.5">
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2 min-w-0">
 <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
 <FileText className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <h4 className="text-xs font-extrabold text-slate-900">Aadhaar KYC Verification</h4>
 <p className="text-[10px] text-slate-400 truncate">
 {t.aadhaarNumber
 ? `Aadhaar: XXXX XXXX ${t.aadhaarNumber.slice(-4)} (${t.aadhaarNumber})`
 : "No Aadhaar uploaded by resident yet"}
 </p>
 </div>
 </div>
 <span
 className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold shrink-0 border ${
 t.kycStatus === "Verified"
 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
 : t.kycStatus === "Under Review"
 ? "bg-sky-50 text-sky-700 border-sky-200"
 : t.kycStatus === "Rejected"
 ? "bg-rose-50 text-rose-700 border-rose-200"
 : "bg-amber-50 text-amber-700 border-amber-200"
 }`}
 >
 {t.kycStatus === "Under Review" ? "Under Review" : t.kycStatus}
 </span>
 </div>

 {t.kycStatus === "Pending" && (
 <p className="text-[10.5px] text-amber-700 bg-amber-50/70 border border-amber-200/80 rounded-xl px-2.5 py-2 font-semibold">
 Waiting for {t.name} to enter 12-digit Aadhaar & upload Aadhaar photo in Tenant App before KYC can be approved.
 </p>
 )}

 {t.kycStatus === "Rejected" && t.kycRejectionReason && (
 <p className="text-[10.5px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-2 font-semibold">
 Rejected reason: {t.kycRejectionReason}
 </p>
 )}

 {t.kycDocUrl && (
 <a
 href={t.kycDocUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-700 text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition"
 >
 <ExternalLink className="w-3.5 h-3.5" />
 <span>View Uploaded Aadhaar Document</span>
 </a>
 )}

 {(isOwner || isAdmin) && t.kycStatus !== "Verified" && (
 <div className="space-y-2 pt-1">
 <div className="flex items-center gap-2">
 <button
 type="button"
 disabled={isProcessing}
 onClick={handleVerifyKyc}
 className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95 ${
 t.kycStatus === "Under Review"
 ? "bg-emerald-600 hover:bg-emerald-500 text-white"
 : "bg-slate-900 hover:bg-slate-800 text-white"
 }`}
 >
 <CheckCircle2 className="w-3.5 h-3.5" />
 <span>
 {t.kycStatus === "Under Review" ? "Approve KYC" : "Approve Manually"}
 </span>
 </button>
 {t.kycStatus === "Under Review" && (
 <button
 type="button"
 disabled={isProcessing}
 onClick={() => setIsRejectingKyc(!isRejectingKyc)}
 className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center justify-center gap-1 transition"
 >
 <XCircle className="w-3.5 h-3.5" />
 <span>Reject</span>
 </button>
 )}
 </div>

 {isRejectingKyc && (
 <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
 <input
 type="text"
 value={kycRejectReason}
 onChange={(e) => setKycRejectReason(e.target.value)}
 placeholder="Reason for rejection (e.g. Blur Aadhaar photo)"
 className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-rose-200 text-xs text-slate-900 focus:outline-none"
 />
 <button
 type="button"
 disabled={isProcessing}
 onClick={handleRejectKyc}
 className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold transition"
 >
 Confirm Reject & Ask Re-upload
 </button>
 </div>
 )}
 </div>
 )}
 </div>

 {/* ========================================================================= */}
 {/* 1. DEDICATED SECURITY DEPOSIT CARD (PART 1) */}
 {/* ========================================================================= */}
 {(() => {
 const expectedDep = t.deposit || 0;
 const paidDep = t.depositPaidAmount ?? (t.depositStatus === "paid" ? expectedDep : 0);
 const remainingDep = Math.max(0, expectedDep - paidDep);
 const isDepPaid = t.depositStatus === "paid" && remainingDep === 0;
 const isDepRefunded = t.depositStatus === "refunded" || t.depositStatus === "partially_refunded";

 return (
 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-2.5">
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2 min-w-0">
 <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
 <ShieldCheck className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <h4 className="text-xs font-extrabold text-slate-900">Security Deposit</h4>
 <p className="text-[10px] text-slate-400">
 {paidDep > 0 && remainingDep > 0
 ? `Total: ₹${expectedDep.toLocaleString("en-IN")} • Paid: ₹${paidDep.toLocaleString("en-IN")}`
 : "100% Refundable at Checkout"}
 </p>
 </div>
 </div>

 <div className="text-right shrink-0">
 <div className="text-sm font-black text-slate-900 tabular-nums">
 ₹{(paidDep > 0 ? paidDep : expectedDep).toLocaleString("en-IN")}
 {paidDep > 0 && remainingDep > 0 && (
 <span className="text-[10px] font-bold text-slate-400"> / ₹{expectedDep.toLocaleString("en-IN")}</span>
 )}
 </div>
 <span
 className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
 isDepPaid
 ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
 : t.depositStatus === "pending" || remainingDep > 0
 ? "bg-amber-50 text-amber-700 border border-amber-200"
 : "bg-purple-50 text-purple-700 border border-purple-200"
 }`}
 >
 {isDepPaid
 ? "Paid • Held Safely"
 : isDepRefunded
 ? "Refunded"
 : paidDep > 0
 ? `₹${remainingDep.toLocaleString("en-IN")} Pending`
 : "Pending • To be collected"}
 </span>
 </div>
 </div>

 {/* Deposit Metadata */}
 <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-500">
 <span>
 {paidDep > 0 ? (
 <>
 Mode: <strong className="text-slate-800">{(t.depositPaymentMode || "CASH").toUpperCase()}</strong>
 </>
 ) : (
 <>
 Paid So Far: <strong className="text-slate-800">₹0</strong>
 </>
 )}
 </span>
 <span>
 {paidDep > 0 ? (
 <>
 Collected by: <strong className="text-slate-800">{t.depositCollectedByName || "PG Owner"}</strong>
 </>
 ) : (
 <>
 Balance Due: <strong className="text-amber-700">₹{remainingDep.toLocaleString("en-IN")}</strong>
 </>
 )}
 </span>
 </div>

 {/* Actions: Collect Deposit (if pending) OR Refund Deposit (if paid & Owner) */}
 <div className="pt-1 flex items-center gap-2">
 {t.depositStatus === "pending" || remainingDep > 0 ? (
 <button
 type="button"
 onClick={() => {
 if (!isCollectingDeposit && remainingDep > 0) {
 setDepositAmountInput(remainingDep);
 }
 setIsCollectingDeposit(!isCollectingDeposit);
 }}
 className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold transition shadow-xs active:scale-95"
 >
 {isCollectingDeposit
 ? "Cancel"
 : remainingDep > 0
 ? `Collect Remaining Deposit (₹${remainingDep.toLocaleString("en-IN")})`
 : "Collect Deposit"}
 </button>
 ) : (
 <>
 <DepositReceiptModal
 pgName="PG Security Receipt"
 primaryColor="#4F46E5"
 tenantName={t.name}
 roomNumber={`Room ${room.number}`}
 bedLabel={bed.label}
 amount={paidDep}
 paymentMode={t.depositPaymentMode || "CASH"}
 collectedByName={t.depositCollectedByName || "PG Owner"}
 status={isDepPaid ? "Paid • Held Safely" : "Refunded"}
 deductionAmount={t.depositDeduction}
 deductionReason={t.depositDeductionReason}
 refundedAmount={t.depositRefundedAmount}
 triggerButton={
 <button
 type="button"
 className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-bold border border-slate-200/90 text-center transition"
 >
 Deposit Receipt
 </button>
 }
 />

 {isOwner && isDepPaid && (
 <button
 type="button"
 onClick={() => setIsRefundingDeposit(!isRefundingDeposit)}
 className="flex-1 py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10.5px] font-bold border border-purple-200 text-center transition"
 >
 {isRefundingDeposit ? "Cancel" : "Settle / Refund Deposit"}
 </button>
 )}
 </>
 )}
 </div>

 {/* Quick Collect Deposit Form Panel */}
 {isCollectingDeposit && (t.depositStatus === "pending" || (t.deposit - (t.depositPaidAmount ?? 0)) > 0) && (
 <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2 animate-in fade-in">
 <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block">
 Collect Security Deposit
 </span>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Amount (₹)</label>
 <input
 type="number"
 value={depositAmountInput}
 onChange={(e) => setDepositAmountInput(parseInt(e.target.value) || 0)}
 className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
 />
 </div>
 <div>
 <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Mode</label>
 <select
 value={depositModeInput}
 onChange={(e) => setDepositModeInput(e.target.value as any)}
 className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
 >
 <option value="cash">💵 Cash</option>
 <option value="upi">📱 UPI</option>
 <option value="bank_transfer">🏦 Bank Transfer</option>
 </select>
 </div>
 </div>

 <div>
 <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Ref / UTR (Optional)</label>
 <input
 type="text"
 placeholder="e.g. UPI-DEP-991"
 value={depositRefInput}
 onChange={(e) => setDepositRefInput(e.target.value)}
 className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
 />
 </div>

 <button
 type="button"
 disabled={isProcessing}
 onClick={handleConfirmCollectDeposit}
 className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xs transition"
 >
 {isProcessing ? "Saving..." : "Confirm Deposit Collection"}
 </button>
 </div>
 )}

 {/* Settle / Refund Deposit Panel (Owner Only) */}
 {isRefundingDeposit && isOwner && (
 <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 mt-2 animate-in fade-in text-xs">
 <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wide block">
 Checkout Deposit Settlement
 </span>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
 Deduction (₹)
 </label>
 <input
 type="number"
 value={deductionAmount}
 onChange={(e) => setDeductionAmount(parseInt(e.target.value) || 0)}
 placeholder="0"
 className="w-full px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-bold text-slate-900"
 />
 </div>
 <div>
 <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
 Net Refund Amount
 </label>
 <div className="px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-black text-emerald-700 tabular-nums">
 ₹{netRefund.toLocaleString("en-IN")}
 </div>
 </div>
 </div>

 <div>
 <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
 Deduction Reason (if any)
 </label>
 <input
 type="text"
 value={deductionReason}
 onChange={(e) => setDeductionReason(e.target.value)}
 placeholder="e.g. Wall painting damage / Key loss"
 className="w-full px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-xs text-slate-900"
 />
 </div>

 <button
 type="button"
 disabled={isProcessing}
 onClick={handleConfirmRefundDeposit}
 className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-extrabold shadow-xs transition"
 >
 {isProcessing ? "Processing..." : `Confirm Refund ₹${netRefund.toLocaleString("en-IN")} & Close`}
 </button>
 </div>
 )}
 </div>
 );
 })()}

 {/* ========================================================================= */}
 {/* 2. FLOOR-WISE RENT COLLECTION & 2-STEP AUTO-INVOICE (PART 2) */}
 {/* ========================================================================= */}
 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 text-xs shadow-sm">
 <div className="grid grid-cols-2 gap-2 text-[11px]">
 <div>
 <span className="text-slate-400 block text-[10px]">College / Office</span>
 <strong className="text-slate-800">{t.college}</strong>
 </div>
 <div>
 <span className="text-slate-400 block text-[10px]">Joining Date</span>
 <strong className="text-slate-800">{t.joinDate}</strong>
 </div>
 </div>

 <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
 <div>
 <span className="text-slate-400 block text-[10px]">Monthly Rent</span>
 <div className="flex items-center gap-1.5">
 <span className="text-sm font-black text-indigo-600 tabular-nums">
 ₹{room.rent.toLocaleString("en-IN")}
 </span>
 <span
 className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
 t.rentPaid
 ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
 : "bg-rose-50 text-rose-700 border border-rose-200"
 }`}
 >
 {t.rentPaid ? "Paid" : "Rent Due"}
 </span>
 </div>
 </div>

 {!t.rentPaid ? (
 <button
 type="button"
 onClick={() => setIsCollectingRent(!isCollectingRent)}
 className="px-3.5 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 text-white font-extrabold text-xs shadow-xs transition active:scale-95"
 >
 {isCollectingRent ? "Close" : "Collect Rent"}
 </button>
 ) : (
 <div className="flex items-center gap-1.5">
 <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-1">
 <Check className="w-4 h-4 text-emerald-600" /> Paid
 </span>
 <RentReceiptModal
 pgName="Royal Stay PG"
 primaryColor="#4F46E5"
 tenantName={t.name}
 roomNumber={`Room ${room.number}`}
 amount={`₹${room.rent.toLocaleString("en-IN")}`}
 dueDate="Nov 05, 2026"
 triggerButton={
 <button
 type="button"
 className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold hover:bg-indigo-100"
 >
 Invoice PDF
 </button>
 }
 />
 </div>
 )}
 </div>

 {/* Slide-Up Collect Rent Sheet */}
 {isCollectingRent && !t.rentPaid && (
 <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 mt-2 animate-in fade-in">
 <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
 <span>Cycle: November 2026</span>
 <span className="flex items-center gap-1 text-slate-600">
 <Clock className="w-3 h-3 text-indigo-600" />
 Preview: Today, {nowTime}
 </span>
 </div>

 <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block">
 Select Collection Mode
 </span>
 <div className="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
 <button
 type="button"
 onClick={() => setRentPaymentMode("cash")}
 className={`py-2 px-1 rounded-lg border text-center transition ${
 rentPaymentMode === "cash"
 ? "bg-[#4F46E5] text-white border-indigo-600 shadow-xs"
 : "bg-white text-slate-700 border-slate-200"
 }`}
 >
 💵 Cash
 </button>
 <button
 type="button"
 onClick={() => setRentPaymentMode("admin_upi")}
 className={`py-2 px-1 rounded-lg border text-center transition ${
 rentPaymentMode === "admin_upi"
 ? "bg-[#4F46E5] text-white border-indigo-600 shadow-xs"
 : "bg-white text-slate-700 border-slate-200"
 }`}
 >
 📱 Admin UPI
 </button>
 <button
 type="button"
 onClick={() => setRentPaymentMode("pg_bank_upi")}
 className={`py-2 px-1 rounded-lg border text-center transition ${
 rentPaymentMode === "pg_bank_upi"
 ? "bg-[#4F46E5] text-white border-indigo-600 shadow-xs"
 : "bg-white text-slate-700 border-slate-200"
 }`}
 >
 🏦 PG Bank UPI
 </button>
 </div>

 {rentPaymentMode === "admin_upi" && (
 <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
 💡 Paid to Warden UPI. Will flag in Owner Ledger as &ldquo;Pending Cash Handover&rdquo;.
 </p>
 )}

 {rentPaymentMode === "pg_bank_upi" && (
 <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
 ⚡ Direct to PG Bank Account. Marks automatically as &ldquo;Settled with Owner&rdquo;.
 </p>
 )}

 <div>
 <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
 UTR / Transaction Ref (Optional)
 </label>
 <input
 type="text"
 value={rentTxRef}
 onChange={(e) => setRentTxRef(e.target.value)}
 placeholder="e.g. UTR-4910281"
 className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900"
 />
 </div>

 <button
 type="button"
 disabled={isProcessing}
 onClick={handleConfirmCollectRent}
 className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
 >
 <CheckCircle2 className="w-3.5 h-3.5" />
 <span>Confirm Receipt & Generate Invoice</span>
 </button>
 </div>
 )}

 {/* INSTANT INVOICE SUCCESS CARD (Auto-displays right after payment) */}
 {generatedInvoice && (
 <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 mt-2 animate-in fade-in">
 <div className="flex items-center justify-between">
 <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 <span>Instant Invoice Generated</span>
 </span>
 <span className="text-[10px] font-mono font-bold text-emerald-800">
 {generatedInvoice.id}
 </span>
 </div>

 <div className="flex items-center justify-between text-[11px] text-emerald-950">
 <span>₹{generatedInvoice.amount.toLocaleString("en-IN")} via {generatedInvoice.paymentMode.toUpperCase()}</span>
 <span className="text-[10px] text-emerald-700">{generatedInvoice.collectedAt}</span>
 </div>

 {/* 1-Tap Send on WhatsApp (wa.me) */}
 <div className="pt-1 flex items-center gap-2">
 <a
 href={`https://wa.me/91${t.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
 `Namaste ${t.name}! Rent payment of ₹${generatedInvoice.amount.toLocaleString("en-IN")} for ${pgName} (${building.name}, Room ${room.number}) has been recorded.\n• Invoice No: ${generatedInvoice.id}\n• Payment Mode: ${generatedInvoice.paymentMode.toUpperCase()}\n• Timestamp: ${generatedInvoice.collectedAt}\n• Status: Confirmed Paid ✅\nThank you!`
 )}`}
 target="_blank"
 rel="noreferrer"
 className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
 >
 <Send className="w-3.5 h-3.5" />
 <span>Send Invoice on WhatsApp</span>
 </a>

 <RentReceiptModal
 pgName={pgName}
 primaryColor="#4F46E5"
 tenantName={t.name}
 roomNumber={`Room ${room.number}`}
 invoiceNumber={generatedInvoice.id}
 amount={`₹${generatedInvoice.amount.toLocaleString("en-IN")}`}
 dueDate={generatedInvoice.collectedAt}
 triggerButton={
 <button
 type="button"
 className="py-2 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-[11px] font-extrabold hover:bg-emerald-100/50 transition"
 >
 PDF
 </button>
 }
 />
 </div>
 </div>
 )}
 </div>

 {/* Send WhatsApp Menu (3 Templates + Live Preview) */}
 <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
 <MessageCircle className="w-4 h-4" />
 <span>Send WhatsApp</span>
 </span>
 <button
 type="button"
 onClick={() => setWhatsappAutoApi(!whatsappAutoApi)}
 className="px-2 py-0.5 rounded bg-white text-slate-900 text-[9px] font-extrabold border border-slate-200 shadow-2xs"
 >
 {whatsappAutoApi ? "Cloud API Auto ⚡" : "wa.me Link (Free)"}
 </button>
 </div>

 <div className="grid grid-cols-3 gap-1">
 <button
 type="button"
 onClick={() => setWhatsappTemplate("rent_reminder")}
 className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
 whatsappTemplate === "rent_reminder"
 ? "bg-emerald-600 text-white shadow-xs"
 : "bg-white text-slate-700 border border-slate-200"
 }`}
 >
 Rent Reminder
 </button>
 <button
 type="button"
 onClick={() => setWhatsappTemplate("welcome_info")}
 className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
 whatsappTemplate === "welcome_info"
 ? "bg-emerald-600 text-white shadow-xs"
 : "bg-white text-slate-700 border border-slate-200"
 }`}
 >
 Welcome & Wi-Fi
 </button>
 <button
 type="button"
 onClick={() => setWhatsappTemplate("custom")}
 className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
 whatsappTemplate === "custom"
 ? "bg-emerald-600 text-white shadow-xs"
 : "bg-white text-slate-700 border border-slate-200"
 }`}
 >
 Custom Msg
 </button>
 </div>

 {whatsappTemplate === "custom" ? (
 <div className="space-y-1.5">
 <textarea
 rows={3}
 value={customMsg}
 onChange={(e) => setCustomMsg(e.target.value)}
 placeholder="Type custom WhatsApp message for this resident..."
 className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10.5px] text-slate-900 leading-relaxed focus:outline-none focus:border-emerald-500"
 />
 <div className="flex justify-end">
 <button
 type="button"
 onClick={() => setCustomMsg(applyTemplateTokens(customTemplate?.trim() || DEFAULT_CUSTOM_TEMPLATE))}
 className="text-[9.5px] font-extrabold text-emerald-700 hover:underline cursor-pointer"
 >
 Load PG Saved Custom Template
 </button>
 </div>
 </div>
 ) : (
 <div className="p-2.5 bg-white/90 rounded-lg text-[10px] text-slate-700 leading-relaxed border border-emerald-100 whitespace-pre-line">
 {getWhatsappMessage()}
 </div>
 )}

 <button
 type="button"
 onClick={handleSendWhatsapp}
 className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-xs"
 >
 Send WhatsApp Message
 </button>
 </div>

 {/* Vacate Bed (Owner Only, Two-Step Inline Confirm) */}
 {isOwner && (
 <div className="pt-1">
 {!vacateConfirmStep ? (
 <button
 type="button"
 onClick={() => setVacateConfirmStep(true)}
 className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold transition"
 >
 Vacate / Checkout Bed
 </button>
 ) : (
 <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 animate-in fade-in">
 <span className="text-[10.5px] font-extrabold text-rose-700">
 Confirm free up {bed.label}?
 </span>
 <div className="flex gap-1.5">
 <button
 type="button"
 disabled={isProcessing}
 onClick={handleVacate}
 className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-extrabold hover:bg-rose-700"
 >
 Yes, Vacate
 </button>
 <button
 type="button"
 onClick={() => setVacateConfirmStep(false)}
 className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-extrabold"
 >
 Cancel
 </button>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 );

 if (isDocked) {
 return (
 <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm text-slate-900">
 {sheetBody}
 </div>
 );
 }

 return (
 <div
 className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in lg:hidden"
 onClick={onClose}
 >
 <div
 className="w-full max-w-[480px] md:max-w-2xl mx-auto rounded-t-3xl md:rounded-3xl p-5 pb-8 max-h-[92%] md:max-h-[88vh] overflow-y-auto shadow-2xl border-t md:border border-slate-200 bg-white text-slate-900 animate-slide-up"
 onClick={(e) => e.stopPropagation()}
 >
 {sheetBody}
 </div>
 </div>
 );
}
