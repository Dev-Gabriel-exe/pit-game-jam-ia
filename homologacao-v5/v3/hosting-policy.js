/* FUN-01 — Origin-aware routing. Never treat raw.githack as the classroom API.
 * Static preview is read-only; production credentials are only entered on trusted hosts.
 */
(function(){
'use strict';
const live=new Set(['https://dev-gabriel-exe.github.io','https://pit-game-jam-chat.vercel.app']);
function mode(origin,preview=false){
 if(location.pathname.startsWith('/pit-game-jam-ia/homologacao-v5/'))return 'static-only';
 if(preview)return 'preview';
 if(live.has(origin))return 'live';
 if(/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin))return 'development';
 return 'static-only';
}
window.PIT_HOSTING_POLICY=Object.freeze({mode,liveOrigins:[...live]});
})();
