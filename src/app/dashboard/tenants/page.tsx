"use client";

import { Users, Plus, Phone, BedDouble } from "lucide-react";

export default function TenantsPage() {
  const tenants = [
    { name: "Aarav Patel", phone: "+91 91234 56789", bed: "Room 101 • Bed A", rent: "₹9,500", status: "Paid" },
    { name: "Rohan Gupta", phone: "+91 91234 56781", bed: "Room 102 • Bed A", rent: "₹7,500", status: "Paid" },
    { name: "Vikram Malhotra", phone: "+91 91234 56782", bed: "Room 102 • Bed B", rent: "₹7,500", status: "Pending" },
    { name: "Kabir Mehra", phone: "+91 91234 56783", bed: "Room 201 • Bed A", rent: "₹10,000", status: "Overdue" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">Resident Tenants</h1>
          <p className="text-xs text-slate-400">Total 29 active residents</p>
        </div>
        <button
          onClick={() => alert("Add Tenant flow will be built in Step 3.")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Check-in
        </button>
      </div>

      <div className="space-y-2.5">
        {tenants.map((tenant) => (
          <div
            key={tenant.name}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">{tenant.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{tenant.bed}</p>
              <p className="text-[10px] text-slate-500">{tenant.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-900 dark:text-white">{tenant.rent}</p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                  tenant.status === "Paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : tenant.status === "Pending"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {tenant.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
