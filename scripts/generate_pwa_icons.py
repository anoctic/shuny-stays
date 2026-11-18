import os
import resvg_py
from PIL import Image
import io

BASE_DIR = r"C:\Users\anoct\.gemini\antigravity\scratch\pg-management"
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
ICONS_DIR = os.path.join(PUBLIC_DIR, "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

# Common vector paths for the Roof-and-Zero mark
MARK_ELEMENTS = """
    <!-- Pitched Roof -->
    <path d="M13 27.5L32 12L51 27.5H44.5L32 17.2L19.5 27.5H13Z" fill="#FFFFFF" />
    <!-- Chimney -->
    <rect x="40.5" y="14.5" width="4.5" height="8" fill="#FFFFFF" />
    <!-- Geometric Ring / Shunya Zero -->
    <circle cx="32" cy="34.5" r="10.2" stroke="#FFFFFF" stroke-width="4.4" fill="none" />
    <!-- Left Pillar -->
    <path d="M20.5 41.5C22.2 44.3 25 46.3 28.5 47.1V52H25.5V49.8H23.2V52H20.5V41.5Z" fill="#FFFFFF" />
    <!-- Right Pillar -->
    <path d="M43.5 41.5C41.8 44.3 39 46.3 35.5 47.1V52H38.5V49.8H40.8V52H43.5V41.5Z" fill="#FFFFFF" />
"""

def create_svg(size, bg_radius=0, mark_ratio=0.72, bg_color="#4F46E5"):
    scale = (size * mark_ratio) / 64.0
    offset = (size - 64.0 * scale) / 2.0
    
    rx_attr = f'rx="{bg_radius}"' if bg_radius > 0 else ''
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">
    <rect width="{size}" height="{size}" {rx_attr} fill="{bg_color}" />
    <g transform="translate({offset:.2f}, {offset:.2f}) scale({scale:.4f})">
        {MARK_ELEMENTS}
    </g>
</svg>"""

# 1. icon-192.png (192x192, rounded corners 36px, mark 72%)
svg_192 = create_svg(192, bg_radius=36, mark_ratio=0.72)
png_192_data = resvg_py.svg_to_bytes(svg_string=svg_192, width=192, height=192)
with open(os.path.join(ICONS_DIR, "icon-192.png"), "wb") as f:
    f.write(png_192_data)
print("✅ Generated public/icons/icon-192.png (192x192)")

# 2. icon-512.png (512x512, rounded corners 96px, mark 72%)
svg_512 = create_svg(512, bg_radius=96, mark_ratio=0.72)
png_512_data = resvg_py.svg_to_bytes(svg_string=svg_512, width=512, height=512)
with open(os.path.join(ICONS_DIR, "icon-512.png"), "wb") as f:
    f.write(png_512_data)
print("✅ Generated public/icons/icon-512.png (512x512)")

# 3. icon-maskable-512.png (512x512, full-bleed solid square, safe zone mark 55%)
svg_maskable = create_svg(512, bg_radius=0, mark_ratio=0.55)
png_maskable_data = resvg_py.svg_to_bytes(svg_string=svg_maskable, width=512, height=512)
with open(os.path.join(ICONS_DIR, "icon-maskable-512.png"), "wb") as f:
    f.write(png_maskable_data)
print("✅ Generated public/icons/icon-maskable-512.png (512x512 maskable safe-zone)")

# 4. apple-touch-icon.png (180x180, solid square, no transparency, mark 72%)
svg_apple = create_svg(180, bg_radius=0, mark_ratio=0.72)
png_apple_data = resvg_py.svg_to_bytes(svg_string=svg_apple, width=180, height=180)
with open(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), "wb") as f:
    f.write(png_apple_data)
print("✅ Generated public/apple-touch-icon.png (180x180)")

# 5. favicon.ico (multi-res 16, 32, 48)
img_512 = Image.open(io.BytesIO(png_512_data))
favicon_path = os.path.join(PUBLIC_DIR, "favicon.ico")
img_512.save(favicon_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("✅ Generated public/favicon.ico (16x16, 32x32, 48x48)")

# Also write app/favicon.ico for Next.js App Router root favicon
app_favicon = os.path.join(BASE_DIR, "src", "app", "favicon.ico")
img_512.save(app_favicon, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("✅ Generated src/app/favicon.ico")

# 6. Keep app/icon.svg and public/icon.svg in sync
svg_standard_64 = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="15" fill="#4F46E5"/>
  {MARK_ELEMENTS}
</svg>"""

with open(os.path.join(BASE_DIR, "src", "app", "icon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_standard_64)

with open(os.path.join(PUBLIC_DIR, "icon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_standard_64)

with open(os.path.join(ICONS_DIR, "icon-192.svg"), "w", encoding="utf-8") as f:
    f.write(svg_192)

with open(os.path.join(ICONS_DIR, "icon-512.svg"), "w", encoding="utf-8") as f:
    f.write(svg_512)

print("✅ Synchronized icon.svg and SVG icons in public/icons")
