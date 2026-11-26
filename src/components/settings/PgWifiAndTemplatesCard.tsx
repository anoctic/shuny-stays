"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wifi,
  MessageSquare,
  Building2,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { BuildingItem } from "@/lib/data/rooms";
import { updateOwnerWifiAndTemplatesAction } from "@/app/actions/branding";

export const DEFAULT_WELCOME_TEMPLATE =
  "Namaste {tenant_name}! Welcome to {pg_name} ({building_name}, {floor_name}, Room {room_number} - {bed_label}).\n📶 Floor Wi-Fi: {wifi_ssid}\n🔑 Password: {wifi_password}\nThank you!";

export const DEFAULT_CUSTOM_TEMPLATE =
  "Hi {tenant_name} (Room {room_number} • {floor_name}), ";

interface PgWifiAndTemplatesCardProps {
  pgId: string;
  pgName: string;
  buildings: BuildingItem[];
  initialWelcomeTemplate?: string | null;
  initialCustomTemplate?: string | null;
  canEdit: boolean;
}

export function PgWifiAndTemplatesCard({
  pgId,
  pgName,
  buildings,
  initialWelcomeTemplate,
  initialCustomTemplate,
  canEdit,
}: PgWifiAndTemplatesCardProps) {
  const router = useRouter();

  const [buildingWifi, setBuildingWifi] = useState<
    Record<string, { ssid: string; password: string }>
  >(() => {
    const map: Record<string, { ssid: string; password: string }> = {};
    buildings.forEach((b) => {
      map[b.id] = {
        ssid: b.wifiSsid || "",
        password: b.wifiPassword || "",
      };
    });
    return map;
  });

  const [floorWifi, setFloorWifi] = useState<
    Record<string, { ssid: string; password: string }>
  >(() => {
    const map: Record<string, { ssid: string; password: string }> = {};
    buildings.forEach((b) => {
      b.floors.forEach((f) => {
        map[f.id] = {
          ssid: f.wifiSsid || "",
          password: f.wifiPassword || "",
        };
      });
    });
    return map;
  });

  const [welcomeTemplate, setWelcomeTemplate] = useState(
    initialWelcomeTemplate?.trim() || DEFAULT_WELCOME_TEMPLATE
  );
  const [customTemplate, setCustomTemplate] = useState(
    initialCustomTemplate?.trim() || DEFAULT_CUSTOM_TEMPLATE
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const insertTokenIntoWelcome = (token: string) => {
    setWelcomeTemplate((prev) => `${prev}${prev.endsWith(" ") || prev.endsWith("\n") ? "" : " "}${token}`);
  };

  const insertTokenIntoCustom = (token: string) => {
    setCustomTemplate((prev) => `${prev}${prev.endsWith(" ") || prev.endsWith("\n") ? "" : " "}${token}`);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updateOwnerWifiAndTemplatesAction({
        pgId,
        welcomeMessageTemplate: welcomeTemplate,
        customMessageTemplate: customTemplate,
        buildings: buildings.map((b) => ({
          id: b.id,
          wifiSsid: buildingWifi[b.id]?.ssid || "",
          wifiPassword: buildingWifi[b.id]?.password || "",
        })),
        floors: buildings.flatMap((b) =>
          b.floors.map((f) => ({
            id: f.id,
            wifiSsid: floorWifi[f.id]?.ssid || "",
            wifiPassword: floorWifi[f.id]?.password || "",
          }))
        ),
      });

      if ("error" in res && res.error) {
        setError(res.error);
      } else {
        setSuccess("Per-floor Wi-Fi & WhatsApp message templates permanently saved and synced live!");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save Wi-Fi & message templates.");
    } finally {
      setSaving(false);
    }
  };

  const tokenChips = [
    "{tenant_name}",
    "{pg_name}",
    "{building_name}",
    "{floor_name}",
    "{room_number}",
    "{bed_label}",
    "{wifi_ssid}",
    "{wifi_password}",
    "{phone}",
    "{pending_total}",
  ];

  return (
    <form
      onSubmit={handleSaveAll}
      className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-indigo-600" />
            <span>Building &amp; Floor-Wise Wi-Fi + Welcome Templates</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Har building aur har floor ke liye alag Wi-Fi SSID/Password aur custom Welcome/Custom message templates set karein ({pgName}).
          </p>
        </div>
        {!canEdit && (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold shrink-0">
            View Only
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* SECTION 1: PER-BUILDING & PER-FLOOR WI-FI */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>1. Per-Building &amp; Per-Floor Wi-Fi Networks</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            Floor Wi-Fi overrides Building default
          </span>
        </div>

        {buildings.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 text-center font-semibold">
            Pehle Rooms &amp; Beds tab me building aur floors add karein — phir har floor ka alag Wi-Fi yahan configure karein.
          </div>
        ) : (
          <div className="space-y-3">
            {buildings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3"
              >
                {/* Building Header + Default Building Wi-Fi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                  <div>
                    <div className="text-xs font-black text-slate-900">{b.name}</div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      {b.type} • {b.floors.length} Floor{b.floors.length === 1 ? "" : "s"} (Building Default Wi-Fi)
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:w-[340px]">
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={buildingWifi[b.id]?.ssid || ""}
                      onChange={(e) =>
                        setBuildingWifi((prev) => ({
                          ...prev,
                          [b.id]: { ssid: e.target.value, password: prev[b.id]?.password || "" },
                        }))
                      }
                      placeholder="Building Default SSID (Opt.)"
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                    />
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={buildingWifi[b.id]?.password || ""}
                      onChange={(e) =>
                        setBuildingWifi((prev) => ({
                          ...prev,
                          [b.id]: { ssid: prev[b.id]?.ssid || "", password: e.target.value },
                        }))
                      }
                      placeholder="Building Password (Opt.)"
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Individual Floor Wi-Fi rows */}
                {b.floors.length > 0 && (
                  <div className="space-y-2">
                    {b.floors.map((f) => (
                      <div
                        key={f.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="text-xs font-extrabold text-slate-800 truncate">
                            {f.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:w-[340px]">
                          <input
                            type="text"
                            disabled={!canEdit}
                            value={floorWifi[f.id]?.ssid || ""}
                            onChange={(e) =>
                              setFloorWifi((prev) => ({
                                ...prev,
                                [f.id]: { ssid: e.target.value, password: prev[f.id]?.password || "" },
                              }))
                            }
                            placeholder={`${f.name} Wi-Fi SSID`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                          />
                          <input
                            type="text"
                            disabled={!canEdit}
                            value={floorWifi[f.id]?.password || ""}
                            onChange={(e) =>
                              setFloorWifi((prev) => ({
                                ...prev,
                                [f.id]: { ssid: prev[f.id]?.ssid || "", password: e.target.value },
                              }))
                            }
                            placeholder={`${f.name} Wi-Fi Password`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:bg-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: WELCOME & WI-FI MESSAGE TEMPLATE */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>2. Welcome &amp; Wi-Fi WhatsApp Template</span>
          </span>
          {canEdit && (
            <button
              type="button"
              onClick={() => setWelcomeTemplate(DEFAULT_WELCOME_TEMPLATE)}
              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Reset Default
            </button>
          )}
        </div>

        <textarea
          rows={4}
          disabled={!canEdit}
          value={welcomeTemplate}
          onChange={(e) => setWelcomeTemplate(e.target.value)}
          placeholder="Write your PG Welcome & Floor Wi-Fi template..."
          className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
        />

        {canEdit && (
          <div className="flex flex-wrap gap-1">
            {tokenChips.map((tok) => (
              <button
                key={`w-${tok}`}
                type="button"
                onClick={() => insertTokenIntoWelcome(tok)}
                className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-200/80 transition cursor-pointer"
              >
                + {tok}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: DEFAULT CUSTOM MESSAGE TEMPLATE (EDITABLE PER STUDENT TOO) */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>3. Custom Message Template (Default for Quick Send)</span>
          </span>
          {canEdit && (
            <button
              type="button"
              onClick={() => setCustomTemplate(DEFAULT_CUSTOM_TEMPLATE)}
              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Reset Default
            </button>
          )}
        </div>
        <p className="text-[10.5px] text-slate-500">
          Kisi bhi resident ki Bed Details kholne par aap is template ko directly use ya har bacche ke hisaab se edit karke WhatsApp kar sakte hain.
        </p>

        <textarea
          rows={3}
          disabled={!canEdit}
          value={customTemplate}
          onChange={(e) => setCustomTemplate(e.target.value)}
          placeholder="Write reusable custom notice/message template..."
          className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
        />

        {canEdit && (
          <div className="flex flex-wrap gap-1">
            {tokenChips.slice(0, 7).concat(["{pending_total}"]).map((tok) => (
              <button
                key={`c-${tok}`}
                type="button"
                onClick={() => insertTokenIntoCustom(tok)}
                className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-mono font-bold border border-amber-200/80 transition cursor-pointer"
              >
                + {tok}
              </button>
            ))}
          </div>
        )}
      </div>

      {canEdit && (
        <div className="pt-1">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-[#4F46E5] hover:bg-indigo-600 active:scale-[0.99] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Floor Wi-Fi &amp; Templates...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Floor-Wise Wi-Fi &amp; Templates</span>
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
