"""Generate original Bearlin raster marks using only Python's standard library."""

from pathlib import Path
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1] / "assets" / "images"
PAPER = (255, 253, 252, 255)
RED = (201, 42, 58, 255)
RED_DARK = (159, 31, 44, 255)
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)
BLACK = (0, 0, 0, 255)


def canvas(size, color):
    return bytearray(color * (size * size))


def pixel(image, size, x, y, color):
    if 0 <= x < size and 0 <= y < size:
        offset = (y * size + x) * 4
        image[offset : offset + 4] = bytes(color)


def circle(image, size, cx, cy, radius, color):
    radius_squared = radius * radius
    for y in range(max(0, cy - radius), min(size, cy + radius + 1)):
        for x in range(max(0, cx - radius), min(size, cx + radius + 1)):
            if (x - cx) ** 2 + (y - cy) ** 2 <= radius_squared:
                pixel(image, size, x, y, color)


def rectangle(image, size, left, top, right, bottom, color):
    for y in range(max(0, top), min(size, bottom)):
        start = (y * size + max(0, left)) * 4
        end = (y * size + min(size, right)) * 4
        image[start:end] = bytes(color) * max(0, min(size, right) - max(0, left))


def rounded_rectangle(image, size, left, top, right, bottom, radius, color):
    rectangle(image, size, left + radius, top, right - radius, bottom, color)
    rectangle(image, size, left, top + radius, right, bottom - radius, color)
    circle(image, size, left + radius, top + radius, radius, color)
    circle(image, size, right - radius - 1, top + radius, radius, color)
    circle(image, size, left + radius, bottom - radius - 1, radius, color)
    circle(image, size, right - radius - 1, bottom - radius - 1, radius, color)


def draw_mark(image, size, monochrome=False):
    red = BLACK if monochrome else RED
    dark = BLACK if monochrome else RED_DARK
    left, top, right, bottom = (int(size * value) for value in (0.19, 0.18, 0.81, 0.82))
    circle(image, size, int(size * 0.31), int(size * 0.2), int(size * 0.10), dark)
    circle(image, size, int(size * 0.69), int(size * 0.2), int(size * 0.10), dark)
    rounded_rectangle(image, size, left, top, right, bottom, int(size * 0.13), red)
    if monochrome:
        return
    # Geometric B/book monogram.
    rectangle(image, size, int(size * 0.34), int(size * 0.31), int(size * 0.42), int(size * 0.68), WHITE)
    circle(image, size, int(size * 0.48), int(size * 0.40), int(size * 0.12), WHITE)
    circle(image, size, int(size * 0.49), int(size * 0.57), int(size * 0.13), WHITE)
    circle(image, size, int(size * 0.49), int(size * 0.40), int(size * 0.055), red)
    circle(image, size, int(size * 0.50), int(size * 0.57), int(size * 0.062), red)
    rectangle(image, size, int(size * 0.39), int(size * 0.33), int(size * 0.51), int(size * 0.47), WHITE)
    rectangle(image, size, int(size * 0.39), int(size * 0.49), int(size * 0.52), int(size * 0.70), WHITE)
    rectangle(image, size, int(size * 0.33), int(size * 0.70), int(size * 0.67), int(size * 0.725), WHITE)


def write_png(path, size, image):
    raw = b"".join(b"\x00" + bytes(image[y * size * 4 : (y + 1) * size * 4]) for y in range(size))

    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def generate(path, size, background=PAPER, monochrome=False):
    image = canvas(size, background)
    draw_mark(image, size, monochrome=monochrome)
    write_png(ROOT / path, size, image)


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    generate("icon.png", 1024)
    generate("favicon.png", 64)
    generate("android-icon-foreground.png", 432, CLEAR)
    generate("android-icon-monochrome.png", 432, CLEAR, monochrome=True)


if __name__ == "__main__":
    main()
