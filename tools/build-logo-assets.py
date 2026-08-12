#!/usr/bin/env python3
"""
Build the full Skybound logo asset set from one high-res source file.

  python3 tools/build-logo-assets.py <source-image>

Source should be the official stacked lockup (S monogram above the
SKYBOUND / SCALING wordmark), any size, white or transparent background.

Produces, into assets/brand/ and assets/icons/:

  logo-full.webp / .png        stacked lockup, 4K tall, transparent
  logo-full-light.webp         same, SKYBOUND text lifted to white (dark surfaces)
  logo-horizontal.webp         monogram left + wordmark right (nav bars)
  logo-horizontal-light.webp   same, for dark surfaces
  logo-mark.webp / .png        monogram only, square, transparent
  favicon-96.png, icon-192.png, icon-512.png, apple-touch-icon.png
  og-image.jpg                 1200x630 social card

Every WebP is written at quality 95 / method 6 (near-lossless, smallest
size for that quality). Raster steps use LANCZOS and work from the source
at full resolution, so nothing is ever upscaled beyond the source.
"""
import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "assets", "brand")
ICONS = os.path.join(ROOT, "assets", "icons")

WEBP = dict(format="WEBP", quality=95, method=6)
# The lockup's tallest export. 4K-class: plenty for retina at any placement.
FULL_H = 2160


def log(*a):
    print(*a, flush=True)


def load_rgba(path):
    im = Image.open(path)
    return im.convert("RGBA")


def white_to_alpha(im, thresh=246):
    """Knock a flat white studio background out to transparency.

    Only near-white pixels that are also near-neutral become transparent, so
    the white inside the monogram's highlights and the white counters of the
    letterforms survive if they carry any colour cast. Edge pixels get a
    partial alpha so the result stays anti-aliased rather than jagged.
    """
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            mn, mx = min(r, g, b), max(r, g, b)
            if mn >= thresh and (mx - mn) <= 6:
                px[x, y] = (r, g, b, 0)
            elif mn >= thresh - 14 and (mx - mn) <= 10:
                # feather: how far into "white" this pixel is
                t = (mn - (thresh - 14)) / 14.0
                px[x, y] = (r, g, b, int(a * (1.0 - t)))
    return im


def trim(im, pad=0):
    bbox = im.getbbox()
    if not bbox:
        return im
    im = im.crop(bbox)
    if pad:
        w, h = im.size
        out = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
        out.paste(im, (pad, pad))
        im = out
    return im


def dark_text_to_light(im, lum_max=110, target=(233, 239, 252)):
    """Lift the near-black SKYBOUND wordmark to off-white for dark surfaces.

    Touches only dark, low-saturation pixels, so the blue monogram, the
    orange arrow, and the blue SCALING line keep their exact colours.
    Alpha is preserved, so anti-aliased glyph edges stay smooth.
    """
    im = im.copy()
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            mn, mx = min(r, g, b), max(r, g, b)
            if lum <= lum_max and (mx - mn) <= 40:
                # Map the glyph's own shading onto a tight ramp near the target.
                # A wide ramp reproduces the source's dark-to-light gradient and
                # reads as patchy once inverted, so keep the spread small: the
                # wordmark should look like one solid ink, not an embossed one.
                k = 0.93 + 0.07 * (lum / lum_max)
                px[x, y] = (
                    int(target[0] * k),
                    int(target[1] * k),
                    int(target[2] * k),
                    a,
                )
    return im


def split_lockup(im):
    """Separate the stacked lockup into (monogram, wordmark).

    Finds the widest fully-empty horizontal band in the middle third of the
    image - the gutter the designer left between mark and type - and cuts
    there. Falls back to a 74% split if the artwork has no clean gutter.
    """
    w, h = im.size
    alpha = im.getchannel("A")
    rows = []
    for y in range(h):
        row = alpha.crop((0, y, w, y + 1))
        rows.append(row.getbbox() is None)

    lo, hi = int(h * 0.45), int(h * 0.90)
    best = None
    run_start = None
    for y in range(lo, hi):
        if rows[y]:
            if run_start is None:
                run_start = y
        else:
            if run_start is not None:
                if best is None or (y - run_start) > (best[1] - best[0]):
                    best = (run_start, y)
                run_start = None
    if run_start is not None and (hi - run_start) > 0:
        if best is None or (hi - run_start) > (best[1] - best[0]):
            best = (run_start, hi)

    cut = int((best[0] + best[1]) / 2) if best else int(h * 0.74)
    mark = trim(im.crop((0, 0, w, cut)))
    word = trim(im.crop((0, cut, w, h)))
    return mark, word


def horizontal_lockup(mark, word, gap_ratio=0.16):
    """Compose the nav-bar lockup: monogram left, wordmark right, optically
    centred on each other. Height is driven by the monogram."""
    mh = 1000
    mw = max(1, round(mark.width * mh / mark.height))
    m = mark.resize((mw, mh), Image.LANCZOS)

    # wordmark set to ~62% of the monogram height reads balanced beside it
    ww_h = round(mh * 0.62)
    ww_w = max(1, round(word.width * ww_h / word.height))
    wd = word.resize((ww_w, ww_h), Image.LANCZOS)

    gap = round(mh * gap_ratio)
    W = mw + gap + ww_w
    H = mh
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.paste(m, (0, 0), m)
    out.paste(wd, (mw + gap, (H - ww_h) // 2), wd)
    return trim(out)


def fit_height(im, h):
    w = max(1, round(im.width * h / im.height))
    return im.resize((w, h), Image.LANCZOS)


def square_pad(im, size, margin=0.08):
    inner = round(size * (1 - margin * 2))
    s = im.copy()
    s.thumbnail((inner, inner), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(s, ((size - s.width) // 2, (size - s.height) // 2), s)
    return out


def save_webp(im, name):
    p = os.path.join(BRAND, name)
    im.save(p, **WEBP)
    log(f"  {name:34s} {im.width}x{im.height}  {os.path.getsize(p)//1024}KB")


def save_png(im, path, label=None):
    im.save(path, "PNG", optimize=True)
    log(f"  {label or os.path.basename(path):34s} {im.width}x{im.height}  {os.path.getsize(path)//1024}KB")


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: build-logo-assets.py <source-image>")
    src = sys.argv[1]
    if not os.path.exists(src):
        sys.exit(f"not found: {src}")

    os.makedirs(BRAND, exist_ok=True)
    os.makedirs(ICONS, exist_ok=True)

    log(f"source: {src}")
    im = load_rgba(src)
    log(f"  loaded {im.width}x{im.height}")

    # transparency + trim
    opaque_corners = im.getpixel((0, 0))[3] > 250
    if opaque_corners:
        log("  knocking out white background")
        im = white_to_alpha(im)
    im = trim(im)
    log(f"  trimmed to {im.width}x{im.height}")

    if im.height < FULL_H:
        log(f"  note: source is {im.height}px tall; exporting at native height "
            f"(no upscaling - a bigger source would give a bigger asset)")
    target_h = min(FULL_H, im.height)

    mark, word = split_lockup(im)
    log(f"  monogram {mark.width}x{mark.height} | wordmark {word.width}x{word.height}")

    # ---- stacked lockup ----
    full = fit_height(im, target_h)
    save_webp(full, "logo-full.webp")
    save_png(full, os.path.join(BRAND, "logo-full.png"), "logo-full.png")
    save_webp(fit_height(dark_text_to_light(im), target_h), "logo-full-light.webp")

    # ---- horizontal lockup (nav) ----
    # Two sizes each: a 600px master for any large use, and a right-sized nav
    # file. The nav displays at ~36-46px, so 200px covers a 4x DPR screen with
    # headroom; shipping the master there would cost ~10x the bytes on every
    # page and make the browser downscale a huge bitmap on each paint.
    horiz = horizontal_lockup(mark, word)
    save_webp(fit_height(horiz, min(600, horiz.height)), "logo-horizontal.webp")
    save_webp(fit_height(horiz, 200), "logo-nav.webp")
    horiz_light = horizontal_lockup(mark, dark_text_to_light(word))
    save_webp(fit_height(horiz_light, min(600, horiz_light.height)), "logo-horizontal-light.webp")
    save_webp(fit_height(horiz_light, 200), "logo-nav-light.webp")

    # ---- monogram ----
    mk = fit_height(mark, min(1600, mark.height))
    save_webp(mk, "logo-mark.webp")
    save_png(mk, os.path.join(BRAND, "logo-mark.png"), "logo-mark.png")

    # ---- icons (monogram, square, transparent) ----
    for size, name in [(96, "favicon-96.png"), (192, "icon-192.png"),
                       (512, "icon-512.png")]:
        save_png(square_pad(mark, size), os.path.join(ICONS, name), name)
    # apple touch icons must be opaque - iOS composites them on the home screen
    at = Image.new("RGBA", (180, 180), (255, 255, 255, 255))
    m = square_pad(mark, 180, margin=0.12)
    at.paste(m, (0, 0), m)
    save_png(at.convert("RGB"), os.path.join(ICONS, "apple-touch-icon.png"),
             "apple-touch-icon.png")

    # ---- social card ----
    og = Image.new("RGB", (1200, 630), (238, 242, 247))
    lock = im.copy()
    lock.thumbnail((760, 430), Image.LANCZOS)
    og.paste(lock, ((1200 - lock.width) // 2, (630 - lock.height) // 2), lock)
    p = os.path.join(ROOT, "assets", "images", "og-image.jpg")
    og.save(p, "JPEG", quality=90, optimize=True, progressive=True)
    log(f"  {'og-image.jpg':34s} 1200x630  {os.path.getsize(p)//1024}KB")

    log("done.")


if __name__ == "__main__":
    main()
