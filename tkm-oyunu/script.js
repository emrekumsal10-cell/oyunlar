
let score=0;
function play(choice){
  const comp=['taş','kağıt','makas'][Math.floor(Math.random()*3)];
  let res='';
  if(choice===comp)res='Berabere!';
  else if((choice==='taş'&&comp==='makas')||(choice==='kağıt'&&comp==='taş')||(choice==='makas'&&comp==='kağıt')){res='Kazandın!';score++;}
  else{res='Kaybettin!';score--;}
  document.getElementById("result").textContent=`Sen: ${choice} - Bilgisayar: ${comp} → ${res}`;
  document.getElementById("score").textContent="Skor: "+score;
}
function goHome(){window.location.href="../index.html";}
