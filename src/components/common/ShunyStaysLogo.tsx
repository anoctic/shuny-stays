import React from "react";

/**
 * Exact Shuny Stays Brand Vector Mark
 * Rounded-square indigo canvas, roof, chimney, ring (shunya), and support pillars.
 */
export function ShunyStaysEmblem({
 className = "w-8 h-8",
 rounded = true,
}: {
 className?: string;
 rounded?: boolean;
}) {
 return (
 <svg
 xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 64 64"
 fill="none"
 className={`shrink-0 ${className}`}
 >
 <rect width="64" height="64" rx={rounded ? "15" : "0"} fill="#4338CA" />
 {/* Pitched Roof */}
 <path d="M13 27.5L32 12L51 27.5H44.5L32 17.2L19.5 27.5H13Z" fill="#FFFFFF" />
 {/* Chimney */}
 <rect x="40.5" y="14.5" width="4.5" height="8" fill="#FFFFFF" />
 {/* Geometric Ring / Shunya Zero */}
 <circle cx="32" cy="34.5" r="10.2" stroke="#FFFFFF" strokeWidth="4.4" />
 {/* Left Pillar */}
 <path
 d="M20.5 41.5C22.2 44.3 25 46.3 28.5 47.1V52H25.5V49.8H23.2V52H20.5V41.5Z"
 fill="#FFFFFF"
 />
 {/* Right Pillar */}
 <path
 d="M43.5 41.5C41.8 44.3 39 46.3 35.5 47.1V52H38.5V49.8H40.8V52H43.5V41.5Z"
 fill="#FFFFFF"
 />
 </svg>
 );
}

/**
 * Pure SVG Vector Paths (without the background rect)
 * Adapts to currentColor or specified fill/stroke
 */
export function RoofAndZeroIcon({
 className = "w-5 h-5",
 color = "#4338CA",
}: {
 className?: string;
 color?: string;
}) {
 return (
 <svg
 xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 64 64"
 fill="none"
 className={className}
 >
 <path d="M13 27.5L32 12L51 27.5H44.5L32 17.2L19.5 27.5H13Z" fill={color} />
 <rect x="40.5" y="14.5" width="4.5" height="8" fill={color} />
 <circle cx="32" cy="34.5" r="10.2" stroke={color} strokeWidth="4.4" />
 <path
 d="M20.5 41.5C22.2 44.3 25 46.3 28.5 47.1V52H25.5V49.8H23.2V52H20.5V41.5Z"
 fill={color}
 />
 <path
 d="M43.5 41.5C41.8 44.3 39 46.3 35.5 47.1V52H38.5V49.8H40.8V52H43.5V41.5Z"
 fill={color}
 />
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
 size?: "sm" | "md" | "lg" | "xl";
}) {
 const emblemSize =
 size === "sm"
 ? "w-7 h-7"
 : size === "lg"
 ? "w-10 h-10"
 : size === "xl"
 ? "w-14 h-14"
 : "w-8 h-8";

 const textSize =
 size === "sm"
 ? "text-xs"
 : size === "lg"
 ? "text-base"
 : size === "xl"
 ? "text-2xl"
 : "text-sm";

 return (
 <div className={`flex items-center gap-2.5 ${className}`}>
 <ShunyStaysEmblem className={emblemSize} />
 {showText && (
 <span className={`${textSize} font-black tracking-tight leading-none`}>
 <span className="text-[#0F172A]">Shuny</span>
 <span className="text-[#4F46E5] ml-0.5">Stays</span>
 </span>
 )}
 </div>
 );
}
