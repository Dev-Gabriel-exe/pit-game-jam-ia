#!/usr/bin/env python3
"""Generate exactly ONE new zero-cost public LTX clip for the portal hero.
No credentials, account creation, identity changes, extra sessions or quota bypass.
Only update the website after a genuine video passes duration/MP4 QC.
"""
import json, os, subprocess, sys, shutil
from pathlib import Path
from gradio_client import Client, handle_file

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"v3/assets/missions/missao-01.webp"
REF=ROOT/"v3/assets/missions/portal-reference-muted.png"
RAW=ROOT/"v3/assets/missions/portal-hero-long-ltx-raw.mp4"
FINAL=ROOT/"v3/assets/missions/portal-hero-long-ltx.mp4"
PAGE=ROOT/"index.html"
OLD="data-src=\"./v3/assets/missions/missao-01-motion.mp4\""
NEW="data-src=\"./v3/assets/missions/portal-hero-long-ltx.mp4\""
assert SOURCE.is_file(), "Original art is absent"
assert OLD in PAGE.read_text(encoding="utf8"), "Portal was changed; refuse to silently replace new content."
PROMPT=(
 "A single continuous live-action style dark Gothic fantasy tracking shot. "
 "An ancient immense medieval stone cathedral and castle entrance at dusk, "
 "a cloaked adventurer seen from behind walks slowly and naturally toward the castle, "
 "wet cobblestones, thin silver-gray fog rolling low along the ground, "
 "soft wind moving the cloak and the branches, a few dim candles in recessed archways. "
 "The camera performs a graceful slow cinematic forward dolly, no cuts, "
 "with real depth and parallax, sharp weathered stone textures, realistic footsteps and subtle atmospheric movement. "
 "Keep the exact original environment and framing from the reference but with refined realistic surface detail. "
 "Restrained desaturated palette: cool graphite, smoky slate gray, blackened brown, deep pewter and muted warm bronze. "
 "Extremely low color saturation, balanced highlights, natural exposure, gentle mist and soft physically plausible light. "
 "Matte cinematic color grading, premium dark fantasy game trailer, believable motion and stable geometry. "
 "Landscape wide composition for a website hero with substantial dark negative space on the left for readable text. "
 "No bright lava, no fluorescent colors, no strong orange glow, no neon blue, no turquoise, no red color cast. "
 "No titles, no logo, no watermarks, no text, no HUD, no slideshow."
)
NEG=(
 "oversaturated, vivid orange, glowing red, bright cyan, teal, HDR halo, cartoon, vector illustration, "
 "boiling warping architecture, morphing stone, unnatural gait, shaky camera, blurry, "
 "low quality, bad anatomy, distorted limbs, geometry animation, artificial zoom, text"
)
# Prepare a genuine landscape first frame, with muted colors before model conditioning.
subprocess.run([
 "ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(SOURCE),
 "-vf","scale=736:416:force_original_aspect_ratio=increase,crop=736:416,eq=saturation=0.51:contrast=0.93:brightness=-0.015",
 "-frames:v","1",str(REF)],check=True)
print("LTX official public ZeroGPU: one anonymous i2v attempt, 8.1 seconds; no tokens.",flush=True)
try:
 client=Client("Lightricks/ltx-video-distilled",verbose=False)
 result=client.submit(
   PROMPT,NEG,handle_file(str(REF)),None,
   416,736,"image-to-video",8.1,9,20261028,False,1.0,False,
   api_name="/image_to_video"
 ).result(timeout=410)
 print("GENERATION RESULT",str(result)[:600],flush=True)
 item=result[0] if isinstance(result,(list,tuple)) else result
 if isinstance(item,dict):
  item=item.get("video") or item.get("path") or item.get("url")
  if isinstance(item,dict):item=item.get("path") or item.get("url")
 if not item or not Path(str(item)).exists():
  raise ValueError("LTX returned no local MP4 file: "+repr(str(item)[:120]))
 shutil.copyfile(str(item),RAW)
 # Grade the actual model output; no color boost, preserve natural shadows.
 subprocess.run([
  "ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(RAW),
  "-an","-vf","eq=saturation=0.67:contrast=0.97:brightness=-0.013,format=yuv420p",
  "-c:v","libx264","-preset","medium","-crf","21","-movflags","+faststart",str(FINAL)
 ],check=True)
 check=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration,size",
    "-show_entries","stream=codec_name,width,height","-of","json",str(FINAL)],
    capture_output=True,text=True,check=True)
 probe=json.loads(check.stdout)
 print("QC",json.dumps(probe),flush=True)
 duration=float(probe["format"]["duration"])
 assert duration>=7.0, "Generated clip too short: "+str(duration)
 assert FINAL.stat().st_size>=40000, "Generated MP4 unexpectedly tiny"
 assert probe["streams"][0]["codec_name"]=="h264", "Browser codec incompatible"
 html=PAGE.read_text(encoding="utf8").replace(OLD,NEW)
 PAGE.write_text(html,encoding="utf8")
 print("SUCCESS_NEW_LTX_HERO",FINAL,"DURATION",duration,flush=True)
except Exception as exc:
 print("LTX_GENERATION_FAILED",type(exc).__name__,str(exc)[:1200],flush=True)
 # Do not mislabel a constructed animation as a genuine new model video.
 FINAL.unlink(missing_ok=True)
 sys.exit(4)
finally:
 REF.unlink(missing_ok=True)
 RAW.unlink(missing_ok=True)
