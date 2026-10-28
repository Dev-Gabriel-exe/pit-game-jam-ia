#!/usr/bin/env python3
"""Image-to-video for the next missing Game Jam missions with the public LTX demo.
Respect public GPU availability: one public endpoint, no multi-accounts, no token rotation.
Every completed video is saved before attempting the next one.
"""
from __future__ import annotations
import argparse,datetime,json,os,shutil,subprocess,sys,time
from pathlib import Path

from gradio_client import Client,handle_file

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"v3/assets/missions"
MANIFEST=ROOT/"v3/motion-manifest.js"
STATUS=ROOT/"ops/ltx-status.json"
SPACE="Lightricks/ltx-video-distilled"
NEGATIVE="poor quality, pixelated, flat 2D, geometric shapes, stiff animation, slideshow, zoom effect, flickering anatomy, duplicated limbs, bad hands, unrealistic walking, glitching, cuts, text, watermarks, logos"
PROMPTS={
 2:"A hooded medieval cartographer inside a richly detailed candlelit Gothic war room gently unrolls a huge ancient parchment game map on a carved wooden table. With a quill he circles a tiny, single achievable quest route on the map. Miniature glowing game tokens move across the parchment, candles flicker, translucent magical blueprints hover and shift. Natural hand movement, parchment flexes, camera slowly moves over shoulder. A visual metaphor of defining a small playable MVP.",
 3:"Inside a richly textured Gothic inventor's workshop, a medieval game engine awakens: giant brass clockwork rings and intricately carved gears rotate together. A hooded apprentice pulls a metal lever, causing blue magical energy and sparks to pulse through an enormous crystal orb, revealing a small three-dimensional fantasy game world inside. Moving mechanical parts, floating dust, realistic cinematic camera slowly dollies forward.",
 4:"A hooded adventurer runs through an atmospheric Gothic stone dungeon, cloak flowing naturally behind. He dodges a swinging spiked trap and carefully leaps a broken stone walkway, landing and continuing forward. Physical running and walking animation, cinematic smooth tracking camera, torch flames illuminate rough stone walls, drifting mist, rich high fidelity dark fantasy game trailer.",
 5:"A young hooded fantasy adventurer approaches an ancient locked stone door in a Gothic castle. He picks up a glowing magical key from a pedestal, golden particles swirl around his hand, runes turn from red to gold, the giant door slowly unlocks with convincing moving gears and opens to reveal warm light. Clear cause-and-effect interaction, natural body animation, cinematic slowly tracking camera.",
 6:"A realistic medieval fantasy blacksmith-magician creates a magical game asset inside a luminous Gothic forge: glowing orange molten metal swirls in the air and gradually transforms into a beautiful intricate enchanted sword, a blue crystalline gem embeds itself in its hilt, sparks rise, cloth sleeves and long hair move in a gentle breeze, the blacksmith guides the object with both hands. Cinematic fantasy videogame trailer, fluid realistic movement.",
 7:"A hooded hero approaches the end of a majestic mystical stone bridge leading through a Gothic tower to a bright portal. He defeats a shadowy opponent with one clean sword movement; the foe dissolves into blue magical particles and a bridge of light forms. The hero walks through the glowing portal as the landscape subtly transforms. Clear gameplay progression, victory moment, natural human animation, cinematic dark fantasy game trailer.",
 8:"A Gothic fantasy game scene comes to life with subtle interactive polish. A hooded adventurer touches a floating golden rune and the world immediately responds: a glowing trail spirals outward, hanging banners ripple, torches flare naturally, particles stream toward a crystal, the crystal fills with light. Smooth camera movement, detailed lighting and magical visual feedback, polished realistic videogame trailer.",
 9:"Two hooded medieval adventurers in a Gothic castle courtyard playtest a small magical dungeon board game carved into stone. One moves a miniature glowing hero figure through the labyrinth; the second observes, points to a hidden trap, and they exchange friendly gestures as the miniature world reacts with sparks. Lifelike human animation, hovering cinematic camera, candlelight, richly detailed environment, visual metaphor for players testing each other's games.",
 10:"Grand cinematic fantasy game launch celebration inside a magnificent Gothic hall. A hooded hero steps onto a stone stage carrying a radiant enchanted sword, turns to a crowd of armored adventurers and mages, and raises the sword triumphantly as golden fireworks, magical sparks and glowing banners erupt around a monumental castle portal. Crowd moves and cheers naturally, long cloak sways, triumphant camera cranes slowly upward, premium dark fantasy videogame trailer."
}
BASE=("A single continuous high-quality cinematic dark fantasy videogame trailer shot in the same richly detailed Gothic art direction as the provided reference image. "
      "Photorealistic 3D game cinematic rather than drawn vector art. Physically believable animated characters and environments, atmospheric fog, drifting embers, lifelike moving fabrics, dynamic torch fire, volumetric lighting, deep environmental parallax. "
      "Portrait composition, no on-screen writing or interface, no cuts. ")
def utc_now():return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
def save_manifest():
    ready=[i for i in range(1,11) if (ASSETS/f"missao-{i:02d}-motion.mp4").is_file() and (ASSETS/f"missao-{i:02d}-motion.mp4").stat().st_size>16000]
    MANIFEST.write_text("/* Only real validated LTX clips; the rest retain original WebP posters. */\nwindow.PIT_MOTION_READY="+json.dumps(ready,separators=(",",":"))+";\n",encoding="utf-8")
    return ready
def report(**kw):
    STATUS.parent.mkdir(parents=True,exist_ok=True)
    state={"updated_at":utc_now(),"provider":SPACE,"ready":save_manifest(),**kw}
    STATUS.write_text(json.dumps(state,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("STATUS",json.dumps(state,ensure_ascii=False),flush=True)
def valid_video(path:Path):
    if not path.is_file() or path.stat().st_size<=16000:return False
    with path.open("rb") as f:
        head=f.read(64)
    return b"ftyp" in head[:32]
def next_missing():
    return [i for i in range(2,11) if not valid_video(ASSETS/f"missao-{i:02d}-motion.mp4")]
def generate(client,n):
    art=ASSETS/f"missao-{n:02d}.webp"
    dst=ASSETS/f"missao-{n:02d}-motion.mp4"
    if not art.is_file():raise FileNotFoundError(str(art))
    args=[BASE+PROMPTS[n],NEGATIVE,handle_file(str(art)),None,640,384,"image-to-video",3.0,9,4200+n,False,1.0,False]
    print("GENERATING",n,art.name,"using public API, no login",flush=True)
    result=client.predict(*args,api_name="/image_to_video")
    item=result[0] if isinstance(result,(tuple,list)) else result
    if isinstance(item,dict):item=item.get("video") or item.get("path") or item.get("url")
    if isinstance(item,dict):item=item.get("path") or item.get("url")
    file=Path(str(item))
    if not valid_video(file):raise RuntimeError("Provider returned no valid MP4")
    temp=dst.with_suffix(".mp4.pending")
    shutil.copyfile(file,temp)
    os.replace(temp,dst)
    print("SAVED",n,dst.stat().st_size,"bytes",flush=True)
    return dst
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--batch-max",type=int,default=9)
    args=parser.parse_args()
    missing=next_missing()
    if not missing:
        report(state="complete",completed_this_run=[])
        return 0
    client=Client(SPACE,verbose=False)
    completed=[]
    for n in missing[:max(1,min(9,args.batch_max))]:
        try:
            generate(client,n)
        except Exception as e:
            # Do not rotate identities, use fake anonymous sessions, or exhaust GPU by frantic retries.
            report(state="waiting_public_gpu",completed_this_run=completed,blocked_mission=n,reason=str(e)[:400])
            return 0 if completed else 2
        completed.append(n)
        report(state="progress",completed_this_run=completed)
    report(state="complete" if not next_missing() else "partial",completed_this_run=completed)
    return 0
if __name__=="__main__":sys.exit(main())
