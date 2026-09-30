"""Render the portfolio's commit-based schedule. Requires Pillow."""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ROWS = json.loads((ROOT / "portfolio/src/data/projectSchedule.json").read_text(encoding="utf-8"))
image = Image.new("RGB", (1800, 1510), "#f4f0fa")
draw = ImageDraw.Draw(image)
FONT = Path("C:/Windows/Fonts")


def text(x, y, value, size=24, color="#3d3358", bold=False):
    font = ImageFont.truetype(str(FONT / ("malgunbd.ttf" if bold else "malgun.ttf")), size)
    draw.text((x, y), value, font=font, fill=color)


def wrapped(x, y, value, width, size=25):
    font = ImageFont.truetype(str(FONT / "malgun.ttf"), size)
    lines, line = [], ""
    for word in value.split():
        candidate = f"{line} {word}".strip()
        if draw.textlength(candidate, font=font) > width:
            lines.append(line)
            line = word
        else:
            line = candidate
    lines.append(line)
    assert len(lines) <= 3, (value, lines)
    for offset, line in enumerate(lines):
        text(x, y + offset * 37, line, size)


text(64, 44, "JIPDAUM / DEVELOPMENT RECORD", 21, "#78609f", True)
text(64, 86, "집다움 2차 · 3차 개발 일정", 51, bold=True)
text(64, 166, "2차  기반 구축 · 6–7월     /     3차  AI·배포·서비스 고도화 · 8–9월", 27)
text(64, 213, "2026.06.26–09.11  |  두 저장소의 실제 커밋을 바탕으로 재구성한 회고 일정", 23, "#766789")
draw.rounded_rectangle((48, 280, 1752, 1384), radius=22, fill="#ffffff")
draw.rounded_rectangle((48, 280, 1752, 350), radius=20, fill="#574376")
draw.rectangle((48, 320, 1752, 350), fill="#574376")
for x, label in [(72, "차수"), (175, "기간 / 주요 단계"), (595, "Team-DaumAna"), (1170, "jipdaum_Springboot")]:
    text(x, 298, label, 25, "#ffffff", True)
for index, row in enumerate(ROWS):
    y = 352 + index * 128
    if index % 2 == 0:
        draw.rectangle((49, y, 1751, y + 127), fill="#faf8fd")
    if index == 3:
        draw.line((49, y, 1751, y), fill="#a184e8", width=3)
    text(72, y + 38, row["phase"], 28, "#74519e" if row["phase"] == "2차" else "#266959", True)
    text(175, y + 23, row["period"], 26, bold=True)
    text(175, y + 66, row["title"], 23, "#766789")
    wrapped(595, y + 23, row["frontend"], 535)
    wrapped(1170, y + 23, row["backend"], 540)
text(64, 1410, "차수는 회고용 구분이며 공식 일정이 아닙니다. 기간은 커밋 기록 기준입니다. · 확인 2026.09.30", 21, "#766789")
text(64, 1452, "SOURCE  github.com/mingeon9411/Team-DaumAna  +  github.com/mingeon9411/jipdaum_Springboot", 20, "#766789")
output = ROOT / "portfolio/public/images/project-schedule.png"
output.parent.mkdir(parents=True, exist_ok=True)
image.save(output, optimize=True)
print(output)
