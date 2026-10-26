#!/usr/bin/env python3
"""Illustrative AI-template style before mock-ups (Pillow)."""
from __future__ import annotations

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "../public/beyond/redesigns")
DESKTOP = (1600, 1000)
MOBILE = (780, 1688)

NICHES = [
    {"id": 1, "tag": "Plumbing", "emoji": "🔧"},
    {"id": 2, "tag": "Electrical & plumbing", "emoji": "⚡"},
    {"id": 3, "tag": "Plumbing services", "emoji": "🚿"},
    {"id": 4, "tag": "Dental practice", "emoji": "🦷"},
    {"id": 5, "tag": "Self-catering stay", "emoji": "🏡"},
]

CARD_TITLES = ["Fast response", "Trusted team", "Fair pricing"]


def fonts():
    reg = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    return (
        ImageFont.truetype(reg, 14),
        ImageFont.truetype(bold, 14),
        ImageFont.truetype(reg, 16),
        ImageFont.truetype(bold, 22),
        ImageFont.truetype(bold, 28),
        ImageFont.truetype(bold, 36),
    )


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        col = tuple(lerp(top[i], bottom[i], t) for i in range(3))
        for x in range(w):
            px[x, y] = col
    return img


def hero_gradient(size: tuple[int, int]) -> Image.Image:
    """Purple → violet → blue diagonal-ish gradient."""
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    c1 = (102, 126, 234)
    c2 = (118, 75, 162)
    c3 = (59, 130, 246)
    for y in range(h):
        for x in range(w):
            t = (x / w * 0.45 + y / h * 0.55)
            if t < 0.5:
                u = t / 0.5
                col = tuple(lerp(c1[i], c2[i], u) for i in range(3))
            else:
                u = (t - 0.5) / 0.5
                col = tuple(lerp(c2[i], c3[i], u) for i in range(3))
            px[x, y] = col
    return img


def rounded_rect(draw: ImageDraw.ImageDraw, xy, radius: int, fill, outline=None):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline)


def wrap_text(draw, text, font, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        test = f"{cur} {w}".strip()
        if draw.textlength(test, font=font) <= max_width:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_mock(size: tuple[int, int], niche: dict) -> Image.Image:
    w, h = size
    mobile = w < 900
    f_sm, f_sm_b, f_md, f_lg, f_xl, f_hero = fonts()

    base = Image.new("RGB", size, (248, 250, 252))
    draw = ImageDraw.Draw(base)

    # Blobs
    blob = Image.new("RGBA", size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(blob)
    bd.ellipse((w - 200, 90, w + 80, 370), fill=(167, 139, 250, 110))
    bd.ellipse((-60, h - 320, 200, h - 40), fill=(96, 165, 250, 100))
    blob = blob.filter(ImageFilter.GaussianBlur(40))
    base.paste(blob, (0, 0), blob)

    # Nav glass bar
    nav_h = 56 if mobile else 64
    nav = Image.new("RGBA", (w, nav_h), (255, 255, 255, 185))
    base.paste(nav, (0, 0), nav)
    draw.line([(0, nav_h), (w, nav_h)], fill=(148, 163, 184, 80), width=1)

    logo = "Your Business Co."
    draw.text((20 if mobile else 48, 18 if mobile else 20), logo, fill=(99, 102, 241), font=f_lg)
    if not mobile:
        for i, label in enumerate(["Home", "About", "Services", "Contact"]):
            draw.text((520 + i * 110, 24), label, fill=(100, 116, 139), font=f_sm)
    btn_x = w - (120 if mobile else 160)
    rounded_rect(draw, (btn_x, 14, w - (20 if mobile else 48), nav_h - 14), 20, fill=(99, 102, 241))
    draw.text((btn_x + 18, 20 if mobile else 22), "Get Started", fill=(255, 255, 255), font=f_sm_b)

    hero_h = 360 if mobile else 340
    hero = hero_gradient((w, hero_h))
    base.paste(hero, (0, nav_h))

    y = nav_h + (28 if mobile else 32)
    pad = 20 if mobile else 48
    badge_w = 220 if mobile else 260
    rounded_rect(
        draw,
        (pad, y, pad + badge_w, y + 30),
        14,
        fill=(255, 255, 255, 60),
    )
    draw.text((pad + 12, y + 7), f"{niche['tag']} · Premium solutions", fill=(255, 255, 255), font=f_sm)

    title = "Welcome to Your Business – Quality Service You Can Trust"
    title_font = f_xl if mobile else f_hero
    lines = wrap_text(draw, title, title_font, w - pad * 2)
    y += 44
    for line in lines:
        draw.text((pad, y), line, fill=(255, 255, 255), font=title_font)
        y += (38 if mobile else 44)

    sub = "We help you achieve your goals with innovative solutions tailored to your unique needs."
    for line in wrap_text(draw, sub, f_md, w - pad * 2):
        draw.text((pad, y), line, fill=(241, 245, 249), font=f_md)
        y += 22
    y += 10

    # Duplicate CTAs
    for label, ghost in [("Get Started", False), ("Learn More", True), ("Contact Us Today", False)]:
        bw = 150 if not ghost else 130
        bx = pad if ghost else pad + 160
        if mobile:
            bx = pad
            y += 4
        fill = (255, 255, 255) if not ghost else (255, 255, 255, 40)
        outline = None if not ghost else (255, 255, 255)
        rounded_rect(draw, (bx, y, bx + bw, y + 38), 14, fill=fill, outline=outline)
        tc = (79, 70, 229) if not ghost else (255, 255, 255)
        draw.text((bx + 16, y + 10), label, fill=tc, font=f_sm_b)
        if not mobile and not ghost and label == "Get Started":
            continue
        if mobile or ghost:
            y += 46

    # Stock placeholder
    y += 8
    ph_h = 120 if mobile else 100
    rounded_rect(draw, (pad, y, w - pad, y + ph_h), 18, fill=(203, 213, 225))
    draw.text((w // 2 - 110, y + ph_h // 2 - 8), "[ Stock hero placeholder ]", fill=(100, 116, 139), font=f_sm)
    y += ph_h + (24 if mobile else 20)

    section_y = nav_h + hero_h
    draw.text((w // 2 - (90 if mobile else 100), section_y + 28), "Why choose us?", fill=(15, 23, 42), font=f_xl)
    lead = "Discover the difference with our all-in-one platform."
    draw.text((w // 2 - 160, section_y + 68), lead, fill=(100, 116, 139), font=f_sm)

    card_y = section_y + 110
    card_w = w - pad * 2 if mobile else (w - pad * 2 - 40) // 3
    gap = 14
    for i, title_c in enumerate(CARD_TITLES):
        if mobile:
            cx, cy = pad, card_y + i * (130 + gap)
            cw, ch = card_w, 130
        else:
            cx = pad + i * (card_w + 20)
            cy = card_y
            cw, ch = card_w, 150
        rounded_rect(draw, (cx, cy, cx + cw, cy + ch), 18, fill=(255, 255, 255), outline=(226, 232, 240))
        # icon circle
        draw.ellipse((cx + cw // 2 - 18, cy + 16, cx + cw // 2 + 18, cy + 52), fill=(224, 231, 255))
        draw.text((cx + cw // 2 - 12, cy + 22), niche["emoji"], fill=(99, 102, 241), font=f_lg)
        draw.text((cx + 16, cy + 58), title_c, fill=(15, 23, 42), font=f_sm_b)
        body = "Lorem ipsum dolor sit amet. Quality service you can trust."
        for j, ln in enumerate(wrap_text(draw, body, f_sm, cw - 32)):
            draw.text((cx + 16, cy + 82 + j * 16), ln, fill=(100, 116, 139), font=f_sm)

    cta_y = card_y + (3 * (130 + gap) + 20 if mobile else 180)
    rounded_rect(draw, (w // 2 - 95, cta_y, w // 2 + 95, cta_y + 40), 16, fill=(139, 92, 246))
    draw.text((w // 2 - 72, cta_y + 11), "Get Started Now →", fill=(255, 255, 255), font=f_sm_b)

    foot_y = h - (70 if mobile else 55)
    draw.line([(pad, foot_y), (w - pad, foot_y)], fill=(226, 232, 240), width=1)
    draw.text((w // 2 - 130, foot_y + 14), "© 2024 Your Business Co.", fill=(148, 163, 184), font=f_sm)
    draw.text((w // 2 - 55, foot_y + 34), "000 000 0000", fill=(99, 102, 241), font=f_sm_b)

    return base


def main():
    os.makedirs(OUT, exist_ok=True)
    for niche in NICHES:
        for variant, size in [("desktop", DESKTOP), ("mobile", MOBILE)]:
            im = draw_mock(size, niche)
            path = os.path.join(OUT, f"example-{niche['id']}-before-{variant}.webp")
            im.save(path, "WEBP", quality=78, method=6)
            print("wrote", path)


if __name__ == "__main__":
    main()
