
function setupControls(action) {
  document.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowUp") action();
  });
  document.addEventListener("click", () => action());
  document.addEventListener("touchstart", () => action());
}

let paused=false;let score=0;
const character=document.getElementById("character");
const block=document.getElementById("block");
const scoreDisplay=document.getElementById("score");

function togglePause(){paused=!paused;block.style.animationPlayState=paused?"paused":"running";}
function goHome(){window.location.href="../index.html";}

function jump(){if(character.classList.contains("jump")||paused)return;
  character.classList.add("jump");
  setTimeout(()=>{character.classList.remove("jump");},500);}
setupControls(jump);

setInterval(()=>{if(paused)return;
  let cb=parseInt(window.getComputedStyle(character).getPropertyValue("bottom"));
  let br=parseInt(window.getComputedStyle(block).getPropertyValue("right"));
  if(br>580&&br<620&&cb<=40){alert("Oyun bitti! Skor: "+score);location.reload();}
  else if(br<0){score++;scoreDisplay.textContent="Skor: "+score;}
},50);
