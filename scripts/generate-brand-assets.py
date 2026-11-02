#!/usr/bin/env python3
"""
Generate complete production-grade brand assets and favicons for HelpGate.
Source: HelpGateApp/app/src/main/ic_launcher-playstore.png
Outputs:
  - public/logo.png (512x512 transparent)
  - public/logo-192.png
  - public/favicon-16x16.png
  - public/favicon-32x32.png
  - public/favicon-48x48.png
  - public/favicon.ico (multi-res 16, 32, 48)
  - src/app/favicon.ico
  - src/app/icon.png
  - public/apple-touch-icon.png (180x180 with sleek dark background)
  - src/app/apple-icon.png
  - public/android-chrome-192x192.png
  - public/android-chrome-512x512.png
  - public/og-image.png (1200x630 social card)
  - src/app/opengraph-image.png
  - public/site.webmanifest
"""

import os
import shutil
from collections import deque
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SOURCE_IMG = "/home/suraj/Desktop/OGO/HelpGateApp/app/src/main/ic_launcher-playstore.png"
OUTPUT_DIR = "/home/suraj/Desktop/OGO/Helpgate/public"
APP_DIR = "/home/suraj/Desktop/OGO/Helpgate/src/app"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(APP_DIR, exist_ok=True)

def extract_transparent_logo(source_path):
    print(f"Loading source image from {source_path}...")
    im = Image.open(source_path).convert("RGBA")
    w, h = im.size
    src_pixels = im.load()

    # Flood-fill BFS to isolate outer background
    is_bg = [[False]*h for _ in range(w)]
    q = deque()
    # Seed all border pixels
    for x in range(w):
        for y in [0, h-1]:
            r, g, b, _ = src_pixels[x, y]
            if min(r, g, b) >= 230:
                is_bg[x][y] = True
                q.append((x, y))
    for y in range(h):
        for x in [0, w-1]:
            if not is_bg[x][y]:
                r, g, b, _ = src_pixels[x, y]
                if min(r, g, b) >= 230:
                    is_bg[x][y] = True
                    q.append((x, y))

    visited = set(q)
    while q:
        cx, cy = q.popleft()
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                r, g, b, _ = src_pixels[nx, ny]
                # Light/white background condition
                if min(r, g, b) >= 230 and (max(r, g, b) - min(r, g, b)) < 30:
                    visited.add((nx, ny))
                    is_bg[nx][ny] = True
                    q.append((nx, ny))

    # Construct clean alpha image with antialiased borders
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out_pixels = out.load()

    for y in range(h):
        for x in range(w):
            if is_bg[x][y]:
                continue
            r, g, b, _ = src_pixels[x, y]

            # Check if bordering background
            has_bg_neighbor = False
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (1,-1), (-1,1), (1,1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and is_bg[nx][ny]:
                    has_bg_neighbor = True
                    break

            if has_bg_neighbor and min(r, g, b) > 175:
                # Antialias edge against former white background
                brightness = (r * 0.299 + g * 0.587 + b * 0.114)
                alpha_val = int(max(0, min(255, (255 - brightness) * 3.0)))
                if alpha_val > 0:
                    inv_a = 255.0 / max(1, alpha_val)
                    nr = max(0, min(255, int(255 - (255 - r) * inv_a)))
                    ng = max(0, min(255, int(255 - (255 - g) * inv_a)))
                    nb = max(0, min(255, int(255 - (255 - b) * inv_a)))
                    out_pixels[x, y] = (nr, ng, nb, alpha_val)
            else:
                out_pixels[x, y] = (r, g, b, 255)

    return out

def create_centered_square(image, target_size, padding_ratio=0.06):
    """Crops the image to its non-empty bounding box and centers it in a target_size square with padding."""
    bbox = image.getbbox()
    if not bbox:
        return image.resize((target_size, target_size), Image.Resampling.LANCZOS)
    cropped = image.crop(bbox)
    cw, ch = cropped.size

    avail_size = int(target_size * (1 - padding_ratio * 2))
    scale = min(avail_size / cw, avail_size / ch)
    nw, nh = int(cw * scale), int(ch * scale)
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
    ox = (target_size - nw) // 2
    oy = (target_size - nh) // 2
    canvas.paste(scaled, (ox, oy), scaled)
    return canvas

def generate_social_card(logo_img, output_path):
    """Creates a high-impact 1200x630 OpenGraph / Twitter social card."""
    width, height = 1200, 630
    card = Image.new("RGBA", (width, height), (9, 9, 11, 255)) # Dark zinc bg
    draw = ImageDraw.Draw(card)

    # Ambient radial gradient glow in background
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    # Deep blue cyan glow near center-left
    glow_draw.ellipse([80, 50, 650, 580], fill=(37, 99, 235, 45))
    glow_draw.ellipse([180, 120, 520, 480], fill=(14, 165, 233, 35))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    card = Image.alpha_composite(card, glow)
    draw = ImageDraw.Draw(card)

    # Subtle modern border
    draw.rounded_rectangle([16, 16, width-16, height-16], radius=24, outline=(39, 39, 42, 255), width=2)

    # Place Logo (left side, 400x400)
    logo_card = create_centered_square(logo_img, 380, padding_ratio=0.04)
    card.paste(logo_card, (70, (height - 380) // 2), logo_card)

    # Load system fonts
    font_bold = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
    font_regular = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

    title_font = ImageFont.truetype(font_bold, 76)
    badge_font = ImageFont.truetype(font_bold, 22)
    subtitle_font = ImageFont.truetype(font_regular, 32)
    tagline_font = ImageFont.truetype(font_regular, 24)
    footer_font = ImageFont.truetype(font_bold, 18)

    text_x = 490

    # Pill badge: "100% FREE & PRIVATE CLIENT-SIDE"
    badge_text = "100% PRIVATE • ZERO CLOUD UPLOADS"
    badge_bbox = badge_font.getbbox(badge_text)
    bw, bh = badge_bbox[2] - badge_bbox[0], badge_bbox[3] - badge_bbox[1]
    bx, by = text_x, 115
    draw.rounded_rectangle([bx, by, bx + bw + 28, by + bh + 16], radius=14, fill=(37, 99, 235, 40), outline=(59, 130, 246, 120), width=1)
    draw.text((bx + 14, by + 7), badge_text, font=badge_font, fill=(96, 165, 250, 255))

    # Main Brand Name
    draw.text((text_x, 175), "HelpGate", font=title_font, fill=(255, 255, 255, 255))
    # Green Free indicator
    free_badge = "FREE FOREVER"
    fb_bbox = badge_font.getbbox(free_badge)
    fbw = fb_bbox[2] - fb_bbox[0]
    draw.rounded_rectangle([text_x + 355, 195, text_x + 355 + fbw + 20, 225], radius=8, fill=(16, 185, 129, 30), outline=(16, 185, 129, 100), width=1)
    draw.text((text_x + 365, 200), free_badge, font=badge_font, fill=(52, 211, 153, 255))

    # Subtitle
    draw.text((text_x, 275), "Free Technology. For Everyone.", font=subtitle_font, fill=(228, 228, 231, 255))

    # Description
    desc_line1 = "50+ high-performance PDF converters, formatters, and utilities."
    desc_line2 = "Processes files 100% in your browser. No paywalls, no logins."
    draw.text((text_x, 340), desc_line1, font=tagline_font, fill=(161, 161, 170, 255))
    draw.text((text_x, 375), desc_line2, font=tagline_font, fill=(161, 161, 170, 255))

    # Feature tags
    tags = ["PDF Tools", "Code Formatter", "GST Calculator", "Privacy First"]
    tag_x = text_x
    tag_y = 445
    for tag in tags:
        t_bbox = badge_font.getbbox(tag)
        tw = t_bbox[2] - t_bbox[0]
        draw.rounded_rectangle([tag_x, tag_y, tag_x + tw + 18, tag_y + 34], radius=8, fill=(24, 24, 27, 255), outline=(63, 63, 70, 255), width=1)
        draw.text((tag_x + 9, tag_y + 6), tag, font=badge_font, fill=(212, 212, 216, 255))
        tag_x += tw + 28

    # Footer attribution
    draw.text((text_x, 525), "A Public Initiative by One Gateway Online Pvt Ltd • https://helpgate.in", font=footer_font, fill=(113, 113, 122, 255))

    card.convert("RGB").save(output_path, "PNG", quality=95, optimize=True)
    print(f"Generated social card at {output_path}")

def main():
    print("--- Starting HelpGate Brand Asset Generation ---")
    transparent_logo = extract_transparent_logo(SOURCE_IMG)

    # 1. Primary High-Res Logo (512x512)
    logo_512 = create_centered_square(transparent_logo, 512, padding_ratio=0.05)
    logo_512_path = os.path.join(OUTPUT_DIR, "logo.png")
    logo_512.save(logo_512_path, "PNG", optimize=True)
    print(f"Generated {logo_512_path}")

    # 2. Medium Logo (192x192)
    logo_192 = create_centered_square(transparent_logo, 192, padding_ratio=0.05)
    logo_192_path = os.path.join(OUTPUT_DIR, "logo-192.png")
    logo_192.save(logo_192_path, "PNG", optimize=True)

    # 3. Android Chrome Icons
    android_192_path = os.path.join(OUTPUT_DIR, "android-chrome-192x192.png")
    logo_192.save(android_192_path, "PNG", optimize=True)
    android_512_path = os.path.join(OUTPUT_DIR, "android-chrome-512x512.png")
    logo_512.save(android_512_path, "PNG", optimize=True)

    # 4. Standard Favicon PNGs
    for size in [16, 32, 48]:
        fav = create_centered_square(transparent_logo, size, padding_ratio=0.02)
        fav_path = os.path.join(OUTPUT_DIR, f"favicon-{size}x{size}.png")
        fav.save(fav_path, "PNG", optimize=True)
        print(f"Generated {fav_path}")

    # App icon in src/app/icon.png (Next.js automatically serves this)
    app_icon_path = os.path.join(APP_DIR, "icon.png")
    logo_512.save(app_icon_path, "PNG", optimize=True)

    # 5. Multi-resolution favicon.ico (16, 32, 48)
    ico_img = create_centered_square(transparent_logo, 48, padding_ratio=0.02)
    ico_path = os.path.join(OUTPUT_DIR, "favicon.ico")
    ico_img.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    shutil.copyfile(ico_path, os.path.join(APP_DIR, "favicon.ico"))
    print(f"Generated {ico_path} and copied to {APP_DIR}/favicon.ico")

    # 6. Apple Touch Icon (180x180) with a sleek dark rounded backdrop
    apple_canvas = Image.new("RGBA", (180, 180), (9, 9, 11, 255))
    apple_draw = ImageDraw.Draw(apple_canvas)
    # Subtle gradient aura
    apple_glow = Image.new("RGBA", (180, 180), (0, 0, 0, 0))
    ag_draw = ImageDraw.Draw(apple_glow)
    ag_draw.ellipse([30, 30, 150, 150], fill=(37, 99, 235, 60))
    apple_glow = apple_glow.filter(ImageFilter.GaussianBlur(15))
    apple_canvas = Image.alpha_composite(apple_canvas, apple_glow)

    apple_logo = create_centered_square(transparent_logo, 144, padding_ratio=0.03)
    apple_canvas.paste(apple_logo, (18, 18), apple_logo)
    apple_path = os.path.join(OUTPUT_DIR, "apple-touch-icon.png")
    apple_canvas.save(apple_path, "PNG", optimize=True)
    shutil.copyfile(apple_path, os.path.join(APP_DIR, "apple-icon.png"))
    print(f"Generated {apple_path} and copied to {APP_DIR}/apple-icon.png")

    # 7. OpenGraph / Twitter Social Card (1200x630)
    og_path = os.path.join(OUTPUT_DIR, "og-image.png")
    generate_social_card(transparent_logo, og_path)
    shutil.copyfile(og_path, os.path.join(APP_DIR, "opengraph-image.png"))

    # 8. Web App Manifest
    manifest_content = '''{
  "name": "HelpGate — Free Technology. For Everyone.",
  "short_name": "HelpGate",
  "description": "Free, privacy-first digital tools, PDF utilities, and developer formatters. Runs 100% locally in your browser.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
'''
    with open(os.path.join(OUTPUT_DIR, "site.webmanifest"), "w") as f:
        f.write(manifest_content)
    print("Generated site.webmanifest")

    print("\n--- All brand assets successfully generated! ---")

if __name__ == "__main__":
    main()
