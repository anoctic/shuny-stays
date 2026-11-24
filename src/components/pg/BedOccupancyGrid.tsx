import { Room, BedStatus } from "@/types/pg-domain.types";
import { formatINR } from "@/lib/utils";
import { UserCheck, UserX, Wrench } from "lucide-react";

interface BedOccupancyGridProps {
 rooms: (Room & { property_name?: string })[];
}

export function BedOccupancyGrid({ rooms }: BedOccupancyGridProps) {
 const getStatusBadge = (status: BedStatus) => {
 switch (status) {
 case "occupied":
 return {
 bg: "bg-blue-100 text-blue-800 border-blue-200",
 icon: UserCheck,
 label: "Occupied",
 };
 case "vacant":
 return {
 bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
 icon: UserX,
 label: "Vacant",
 };
 case "maintenance":
 return {
 bg: "bg-amber-100 text-amber-800 border-amber-200",
 icon: Wrench,
 label: "Maintenance",
 };
 default:
 return {
 bg: "bg-zinc-100 text-zinc-800 border-zinc-200",
 icon: UserX,
 label: status,
 };
 }
 };

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {rooms.map((room) => (
 <div
 key={room.id}
 className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
 >
 {/* Room Header */}
 <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
 <div>
 <div className="flex items-center gap-2">
 <span className="font-bold text-base text-zinc-900">
 Room {room.room_number}
 </span>
 <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 capitalize">
 {room.room_type.replace("_", " ")}
 </span>
 </div>
 <p className="text-xs text-zinc-500 mt-0.5">
 Floor {room.floor_number} {room.is_ac ? "• AC" : "• Non-AC"}
 </p>
 </div>
 <div className="text-right">
 <span className="font-semibold text-sm text-zinc-900 block">
 {formatINR(room.base_rent_paise)}
 </span>
 <span className="text-[11px] text-zinc-400">/ month</span>
 </div>
 </div>

 {/* Beds Matrix */}
 <div className="mt-3 space-y-2">
 <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
 Beds Status
 </span>
 <div className="grid grid-cols-2 gap-2">
 {room.beds?.map((bed) => {
 const badge = getStatusBadge(bed.status);
 const Icon = badge.icon;
 return (
 <div
 key={bed.id}
 className={`flex items-center justify-between p-2 rounded-lg border text-xs ${badge.bg}`}
 >
 <div className="flex items-center gap-1.5 font-medium">
 <Icon className="h-3.5 w-3.5" />
 <span>Bed {bed.bed_code}</span>
 </div>
 <span className="text-[10px] font-semibold">{badge.label}</span>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 ))}
 </div>
 );
}
