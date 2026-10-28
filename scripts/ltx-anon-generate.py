#!/usr/bin/env python3
"""Anonymous, zero-cost GPU demonstration: LTX image-to-video from public game artwork.
No credentials, no billing, no account creation. Maximum one attempt per public Space.
"""
import os,sys,shutil,subprocess,traceback
from pathlib import Path
from gradio_client import Client, handle_file

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'v3/assets/missions/missao-01.webp'
DEST=ROOT/'v3/assets/missions/missao-01-motion.mp4'
if not SOURCE.is_file():
    raise SystemExit('Missing public Mission 01 artwork: '+str(SOURCE))
print('SOURCE original artwork',SOURCE,SOURCE.stat().st_size,'bytes',flush=True)
PROMPT=(
 'Cinematic dark fantasy videogame trailer, high detail, retain the composition and style of the supplied reference image. '
 'A lone hooded human adventurer seen from behind is walking naturally with clearly alternating footsteps along '
 'a wet medieval cobblestone path toward a towering ancient Gothic stone castle. '
 'The camera slowly dollies forward following the walking hero, cloak fabric fluttering realistically with the wind, '
 'boots touching ground, torch flames flickering and casting moving orange light on the walls, dense low fog flowing '
 'across the ground and through the scene, a few distant ravens flying overhead. '
 'A mystical warm glowing portal in the entrance gently pulses. '
 'Detailed cinematic atmospheric volumetric lighting, physically believable human motion, '
 'real environmental depth and parallax, richly textured gothic architecture, '
 'dark amber and black fantasy art direction. One continuous shot, portrait 2:3 composition, no scene cuts. '
 'No text, no logos, no borders, no subtitles, no geometry, no simple illustrated shapes, no cartoon.'
)
NEG='low quality, geometry, vector, flat graphics, slideshow, fake camera pan, static image, distortion, duplicated limbs, bad anatomy, deformed character, jitter'
attempts=[
 ('LTX-2.5 official ZeroGPU','Lightricks/LTX-2.5','/run',[
   PROMPT, handle_file(str(SOURCE)),768,512,2.0,1234,'conv',False,False,False
  ])
]
for label,space,api_name,args in attempts:
 print('TRY',label,api_name,'without sign-in or API token',flush=True)
 try:
  client=Client(space,verbose=False)
  future=client.submit(*args,api_name=api_name)
  result=future.result(timeout=380)
  print('RESULT',str(result)[:1100],flush=True)
  item=result[0] if isinstance(result,(list,tuple)) else result
  if isinstance(item,dict):
    item=item.get('video') or item.get('path') or item.get('url')
    if isinstance(item,dict):item=item.get('path') or item.get('url')
  path=Path(item)
  if not path.exists():
    raise RuntimeError('Result not downloaded to local path: '+repr(str(item)[:200]))
  if path.stat().st_size<16000:
    raise RuntimeError('Generated video unexpectedly small')
  shutil.copyfile(path,DEST)
  print('SUCCESS',label,'BYTES',DEST.stat().st_size,flush=True)
  if shutil.which('ffprobe'):
    subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height,codec_name','-show_entries','format=duration,size','-of','json',str(DEST)],check=True)
  else:
    print('ffprobe not installed; MP4 confirmed non-empty. Continuing without probe.',flush=True)
  sys.exit(0)
 except Exception as exc:
  print('FAILED',label,type(exc).__name__,str(exc)[:1000],flush=True)
print('NO_ANONYMOUS_GPU_GENERATION_COMPLETED. Leave prior video intact, no artificial fallback.',flush=True)
sys.exit(4)
