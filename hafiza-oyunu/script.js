
const emojis=['🍎','🍌','🍇','🍊','🍓','🍒','🍉','🍑'];
let cards=[...emojis,...emojis].sort(()=>0.5-Math.random());
const game=document.getElementById("game");
let first=null;let lock=false;let matches=0;
cards.forEach(e=>{let c=document.createElement("div");c.classList.add("card");c.dataset.value=e;c.innerHTML="?";c.onclick=()=>flip(c);game.appendChild(c);});
function flip(card){
  if(lock||card.classList.contains("flipped"))return;
  card.classList.add("flipped");card.innerHTML=card.dataset.value;
  if(!first){first=card;} else {if(first.dataset.value===card.dataset.value){
      matches++;document.getElementById("score").textContent="Eşleşmeler: "+matches;first=null;
    } else {lock=true;setTimeout(()=>{first.classList.remove("flipped");card.classList.remove("flipped");first.innerHTML='?';card.innerHTML='?';first=null;lock=false;},1000);}}}
function goHome(){window.location.href="../index.html";}
