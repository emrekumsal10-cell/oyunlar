
let paused=false;let score=0;
const game=document.getElementById("game");
const scoreDisplay=document.getElementById("score");

function togglePause(){paused=!paused;}
function goHome(){window.location.href="../index.html";}

function createBalloon(){
  if(paused)return;
  let balloon=document.createElement("div");
  balloon.classList.add("balloon");
  balloon.style.left=Math.random()*650+"px";
  game.appendChild(balloon);
  let move=setInterval(()=>{
    if(paused)return;
    let bottom=parseInt(window.getComputedStyle(balloon).getPropertyValue("bottom"));
    if(bottom>400){balloon.remove();clearInterval(move);}
    else{balloon.style.bottom=bottom+2+"px";}
  },20);
  balloon.addEventListener("click",()=>{score++;scoreDisplay.textContent="Skor: "+score;balloon.remove();});
  balloon.addEventListener("touchstart",()=>{score++;scoreDisplay.textContent="Skor: "+score;balloon.remove();});
}
setInterval(createBalloon,1000);
