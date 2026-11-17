import { Utensils, Clock } from "lucide-react";

export default function TenantMessPage() {
  const menu = [
    { meal: "Breakfast", time: "7:30 AM - 9:30 AM", items: "Aloo Paratha, Curd, Pickle, Tea / Coffee" },
    { meal: "Lunch", time: "12:30 PM - 2:30 PM", items: "Rajma Masala, Steamed Rice, Roti, Boondi Raita, Salad" },
    { meal: "Dinner", time: "8:00 PM - 10:00 PM", items: "Paneer Butter Masala, Dal Tadka, Butter Roti, Gulab Jamun", special: true },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">Mess Menu</h1>
        <p className="text-xs text-slate-400">Block A Dining Hall schedule</p>
      </div>

      <div className="space-y-2.5">
        {menu.map((m) => (
          <div key={m.meal} className={`p-3.5 rounded-2xl border shadow-xs ${
            m.special ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800" : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-blue-600" /> {m.meal}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {m.time}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">{m.items}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
