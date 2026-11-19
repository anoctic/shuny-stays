"use client";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Sparkles,
  MapPin,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Users,
} from "lucide-react";
import { submitOnboardingAction } from "@/app/actions/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [pgName, setPgName] = useState("Royal Stay PG");
  const [city, setCity] = useState("Bengaluru");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [buildingName, setBuildingName] = useState("Block A - Main Wing");
  const [genderType, setGenderType] = useState<"boys" | "girls" | "coliving">("coliving");
  const [totalFloors, setTotalFloors] = useState("3");
  const [address, setAddress] = useState("12th Main, Koramangala 4th Block");

  const handleNext = () => {
    if (!pgName.trim() || !city.trim()) {
      setError("Please provide your PG brand name and city.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!buildingName.trim()) {
      setError("Please name your first building or block.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("pg_name", pgName);
    formData.append("city", city);
    formData.append("contact_phone", contactPhone);
    formData.append("building_name", buildingName);
    formData.append("gender_type", genderType);
    formData.append("total_floors", totalFloors);
    formData.append("address", address);

    const res = await submitOnboardingAction(formData);
    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-screen">
      {/* Top Progress & Header */}
      <div className="pt-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
              {step}/2
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Setup Wizard
              </p>
              <h2 className="text-sm font-bold text-white">
                {step === 1 ? "PG Brand Information" : "First Building / Block"}
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2.5 py-1 rounded-full">
            {step === 1 ? "50% Completed" : "100% Completed"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      {/* Main Form Content */}
      <div className="my-auto py-4">
        <form onSubmit={handleSubmit} className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
              <div className="text-left mb-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  What is your PG Brand called?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  This brand name will appear on all resident invoices, rent receipts, and portals.
                </p>
              </div>

              {/* PG Brand Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  PG Brand / Organization Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={pgName}
                    onChange={(e) => setPgName(e.target.value)}
                    placeholder="e.g. Royal Stay PG, Stanza Living"
                    className="w-full pl-10 pr-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Operating City */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Headquarter / Primary City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru, Greater Noida, Kota"
                    className="w-full pl-10 pr-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Support / Front Desk Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Step 1 Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] font-bold text-xs text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
              >
                Next: Add First Building
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
              <div className="text-left mb-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Add Your First Building / Block
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Under <span className="text-blue-400 font-semibold">{pgName}</span>. You can add more blocks later.
                </p>
              </div>

              {/* Building Custom Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Building / Block Name
                </label>
                <input
                  type="text"
                  required
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  placeholder="e.g. Block A, Krishna Bhawan, Tower 1"
                  className="w-full px-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                />
              </div>

              {/* Gender Type Radio Cards */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Hostel Accommodation Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["boys", "girls", "coliving"] as const).map((type) => {
                    const isSelected = genderType === type;
                    const label = type === "boys" ? "Boys PG" : type === "girls" ? "Girls PG" : "Co-living";
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setGenderType(type)}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-500/10"
                            : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        <p className="text-xs">{label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total Floors & Address */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Floors
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={totalFloors}
                    onChange={(e) => setTotalFloors(e.target.value)}
                    className="w-full px-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Area / Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Sector 62, Near Metro"
                    className="w-full px-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] font-bold text-xs text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Launching Dashboard..." : "Complete Setup & Launch"}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 pb-1">
        <p className="text-[11px] text-slate-500">
          Step {step} of 2 • 5-Level Architecture Setup
        </p>
      </div>
    </div>
  );
}
