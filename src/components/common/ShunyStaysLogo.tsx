import React from "react";

export function RoofAndZeroIcon({
  className = "w-5 h-5",
  color = "#4F46E5",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Geometric Indigo Roof Line */}
      <path
        d="M4 12L14 3.5L24 12"
        stroke={color}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chimney / Roof accent */}
      <path
        d="M19 8V5H21.5V10.2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Geometric Zero (Shunya) Loop */}
      <rect
        x="8.5"
        y="10.5"
        width="11"
        height="13"
        rx="5.5"
        stroke={color}
        strokeWidth="2.75"
      />
      {/* Internal Center Dot */}
      <circle cx="14" cy="17" r="1.5" fill={color} />
    </svg>
  );
}

export function ShunyStaysLogo({
  className = "",
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const iconContainerSize =
    size === "sm" ? "w-7 h-7" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const iconSize =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-4.5 h-4.5";
  const textSize =
    size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${iconContainerSize} rounded-xl bg-indigo-50/80 border border-indigo-200/70 flex items-center justify-center shrink-0 shadow-xs`}
      >
        <RoofAndZeroIcon className={iconSize} color="#4F46E5" />
      </div>
      {showText && (
        <span className={`${textSize} font-black tracking-tight leading-none`}>
          <span className="text-[#0F172A]">Shuny</span>
          <span className="text-[#4F46E5] ml-0.5">Stays</span>
        </span>
      )}
    </div>
  );
}
