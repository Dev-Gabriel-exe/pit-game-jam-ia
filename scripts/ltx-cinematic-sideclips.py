#!/usr/bin/env python3
"""Two ORIGINAL cinematic background clips for SMALL portal modules, not the main hero.

Use the existing original mission art as reference. Public anonymous ZeroGPU LTX;
single client/session, at most ONE request per concept, no retries or quota bypass.
Never install or purchase external GPU/API infrastructure. Stop if the provider
rejects quota; preserve successfully generated files without touching production.
"""
import json, subprocess, shutil, sys, os
from pathlib import Path
from gradio_client import Client, handle_file

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"v3/assets/missions"
OUT=ROOT/"v3/assets/cinematics"
OUT.mkdir(parents=True,exist_ok=True)

NEG=("oversaturated, vivid red, intense orange glow, neon, cartoon, vector, geometric animation, "
"low resolution, fake camera pan, morphed human limbs, flicker, shaking, smearing, heavy HDR, text, logo")
FILMS=[
 {
  "id":"biblioteca-arcana",
  "src":"missao-06.webp",
  "title":"Biblioteca arcana",
  "role":"Biblioteca de recursos ou cartão de consulta, sem texto sobreposto",
  "prompt":(
   "Photoreal cinematic dark fantasy environment from this original artwork. "
   "A quiet ancient gothic scriptorium with tall carved bookshelves and medieval stone arches, "
   "worn paper folios on a dark oak table, subtle dust motes swirling through a single soft moonbeam, "
   "sparse candle flames gently flicker, old hanging chains sway in the air. "
   "Camera glides slowly sideways past a shelf revealing an enchanted worktable, "
   "genuine perspective shifts and atmospheric depth, steady seamless continuous tracking shot, no cuts, "
   "gothic stone with believable weathering, muted slate charcoal, iron, parchment ivory, restrained bronze, "
   "low saturation, excellent shadow detail, filmic soft light, high fidelity surface textures, "
   "no character, no fighting, no bright portal, no lettering, no watermark."
  ),
  "seed":1626
 },
 {
  "id":"jornada-portal",
  "src":"missao-02.webp",
  "title":"Portal da jornada",
  "role":"Card de seleção de missões ou transição de capítulos",
  "prompt":(
   "Cinematic dark fantasy medieval portal scene inspired by the supplied original artwork. "
   "A weathered black stone gateway at the end of a narrow rain-soaked medieval path, "
   "tall arches and subtle sculpted gargoyles, twilight fog slipping through the doorway, "
   "a distant cool silver glow inside the doorway, small dead leaves drifting with wind, "
   "a few lanterns burn dimly in the archway, accurate damp stone texture and deep perspective. "
   "Camera dollies very slowly toward the doorway, smooth continuous shot, gentle mist and leaf animation, "
   "no cuts, no character, no shaking, muted graphite and faded cold bronze with very low color saturation, "
   "cinematic atmospheric depth, no fluorescent light, no red/orange halo, no text, no watermarks."
  ),
  "seed":2731
 }
]
def run(command):
 subprocess.run(command,check=True,stdout=subprocess.DEVNULL)
def probe(path):
 p=subprocess.run(["ffprobe","-v","error","-show_entries","stream=codec_name,width,height",
  "-show_entries","format=duration,size","-of","json",str(path)],capture_output=True,text=True,check=True)
 d=json.loads(p.stdout)
 assert float(d["format"]["duration"]) >= 5,"Video too short"
 assert d["streams"][0]["codec_name"]=="h264","Not H.264"
 assert path.stat().st_size>=50000,"File suspiciously small"
 return {"duration":float(d["format"]["duration"]),"width":d["streams"][0]["width"],
 "height":d["streams"][0]["height"],"bytes":path.stat().st_size,"codec":"H.264"}

print("SINGLE anonymous LTX client, at most one request per concept. Respect public quotas.",flush=True)
client=Client("Lightricks/ltx-video-distilled",verbose=False)
made=[]
for item in FILMS:
 dest=OUT/(item["id"]+".mp4")
 poster=OUT/(item["id"]+"-poster.webp")
 source=ASSETS/item["src"]
 temp=OUT/(item["id"]+"-reference.png")
 raw=OUT/(item["id"]+"-raw.mp4")
 assert source.exists(), "Missing authored reference "+str(source)
 print("ATTEMPT",item["id"],"one public LTX request",flush=True)
 try:
  run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(source),"-vf",
   "scale=736:416:force_original_aspect_ratio=increase,crop=736:416,eq=saturation=0.57:contrast=0.96",
   "-frames:v","1",str(temp)])
  result=client.submit(
   item["prompt"],NEG,handle_file(str(temp)),None,
   416,736,"image-to-video",6.1,9,item["seed"],False,1.0,False,
   api_name="/image_to_video"
  ).result(timeout=400)
  payload=result[0] if isinstance(result,(list,tuple)) else result
  if isinstance(payload,dict):
   payload=payload.get("video") or payload.get("path") or payload.get("url")
   if isinstance(payload,dict):payload=payload.get("path") or payload.get("url")
  if not payload or not Path(str(payload)).is_file():raise ValueError("LTX did not return downloadable video")
  shutil.copyfile(str(payload),raw)
  run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(raw),
   "-an","-vf","eq=saturation=0.72:contrast=0.96,format=yuv420p",
   "-c:v","libx264","-preset","fast","-crf","21","-movflags","+faststart",str(dest)])
  info=probe(dest)
  run(["ffmpeg","-hide_banner","-loglevel","error","-y","-ss","1.2","-i",str(dest),
   "-frames:v","1","-quality","82",str(poster)])
  info.update({"id":item["id"],"title":item["title"],"role":item["role"],
   "source":item["src"],"mp4":str(dest.relative_to(ROOT)),"poster":str(poster.relative_to(ROOT)),
   "usage":"Small silent looping background only, not full-screen hero","provenance":"LTX-Video Distilled via public Gradio ZeroGPU"})
  made.append(info)
  print("SUCCESS",json.dumps(info,ensure_ascii=False),flush=True)
 except Exception as exc:
  print("GENERATION_UNAVAILABLE",item["id"],type(exc).__name__,str(exc)[:850],flush=True)
  dest.unlink(missing_ok=True)
  poster.unlink(missing_ok=True)
  # No retries or attempts to circumvent quotas/limitations.
  break
 finally:
  temp.unlink(missing_ok=True)
  raw.unlink(missing_ok=True)
if not made:
 print("NO_NEW_VIDEOS: do not change the portal or replace existing files.",flush=True)
 sys.exit(4)
manifest={"status":"experimental-only","productionChange":False,
 "requiredReview":"Human review before embedding; originals are low-res reference clips",
 "clips":made}
(OUT/"manifest-ltx-experimental.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print("GENERATED",len(made),"original silent LTX clips without altering site",flush=True)
