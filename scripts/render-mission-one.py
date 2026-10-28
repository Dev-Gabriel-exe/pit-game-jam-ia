#!/usr/bin/env python3
"""Deterministic 5-second seamless Gothic loop generated from the ORIGINAL M01 artwork.
Local, free, no external footage or cloud AI credits. Requirements: pillow, ffmpeg.
"""
from pathlib import Path
import math, random, subprocess, sys
from PIL import Image, ImageOps, ImageDraw, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"v3/assets/missions/missao-01.webp"
TARGET=ROOT/"v3/assets/missions/missao-01-motion.mp4"
WIDTH,HEIGHT,FPS,DURATION=384,720,24,5
FRAMES=FPS*DURATION
PAD=28
randomizer=random.Random(109)
embers=[(randomizer.uniform(20, WIDTH-20),randomizer.uniform(115,HEIGHT-100),
         randomizer.uniform(7,18),randomizer.uniform(0,2*math.pi),randomizer.uniform(1.1,2.5))
        for _ in range(27)]
if not SOURCE.exists():
    raise SystemExit(f"Missing original artwork: {SOURCE}")
original=Image.open(SOURCE).convert("RGB")
# Cover behavior mirrors object-fit:cover. Extra bleed enables seamless gentle parallax.
back=ImageOps.fit(original,(WIDTH+PAD*2,HEIGHT+PAD*2),method=Image.Resampling.LANCZOS,centering=(0.5,0.46))
command=["ffmpeg","-hide_banner","-loglevel","error","-y",
         "-f","rawvideo","-pixel_format","rgb24","-video_size",f"{WIDTH}x{HEIGHT}",
         "-framerate",str(FPS),"-i","-","-an","-c:v","libx264",
         "-preset","medium","-crf","27","-pix_fmt","yuv420p",
         "-movflags","+faststart","-r",str(FPS),str(TARGET)]
proc=subprocess.Popen(command,stdin=subprocess.PIPE)
try:
    for f in range(FRAMES):
        theta=2*math.pi*f/FRAMES
        # All movement is periodic. Loop reconnects to its initial composition smoothly.
        dx=round(PAD+6*math.sin(theta))
        dy=round(PAD+7*math.sin(theta+0.3))
        art=back.crop((dx,dy,dx+WIDTH,dy+HEIGHT)).convert("RGBA")
        atmosphere=Image.new("RGBA",(WIDTH,HEIGHT),(0,0,0,0))
        a=ImageDraw.Draw(atmosphere,"RGBA")
        flicker=(math.sin(theta)+1)/2
        # Slow firelight over the original gothic gate, preserving its art direction.
        for r in range(130,20,-13):
            alpha=int((4+7*flicker)*(1-r/170))
            a.ellipse((WIDTH*.50-r,HEIGHT*.51-r*1.18,WIDTH*.50+r,HEIGHT*.51+r*1.18),
                      fill=(252,86,26,alpha))
        # Ash and sparks travel up in discrete cycles, fading out before reset.
        for ex,ey,speed,offset,size in embers:
            cycle=(f/FRAMES*1.0*speed+offset/(2*math.pi))%1
            x=ex+12*math.sin(theta+offset)+5*math.sin(cycle*math.pi*2)
            y=ey-104*cycle
            alpha=int(175*math.sin(math.pi*cycle)**1.8)
            radius=size*(0.75+0.25*math.cos(theta+offset))
            a.ellipse((x-radius,y-radius,x+radius,y+radius),
                      fill=(255,186,103,alpha))
        # Pale smoke slides slowly; exact periodic offsets, no harsh scene transitions.
        for i in range(3):
            cx=WIDTH*(.15+i*.38)+18*math.sin(theta+i*1.4)
            cy=HEIGHT*(.72+i*.06)+6*math.cos(theta+i)
            a.ellipse((cx-115,cy-35,cx+115,cy+35),fill=(113,64,60,12))
        atmosphere=atmosphere.filter(ImageFilter.GaussianBlur(1.5))
        art=Image.alpha_composite(art,atmosphere).convert("RGB")
        proc.stdin.write(art.tobytes())
finally:
    proc.stdin.close()
exitcode=proc.wait()
if exitcode!=0:
    raise SystemExit(f"ffmpeg failed ({exitcode})")
if TARGET.stat().st_size<1000:
    raise SystemExit("Output video is unexpectedly empty")
print("Rendered:",TARGET, "size:", TARGET.stat().st_size, "bytes")
