#include "std.js"
#include "gun.js"




/* definitions and that */
var poisonBullets = state.createBulletGroup(caller,200,200,'poison','shot');
caller.animations.add("death",[8,9,10,11],4,false);
caller.animations.add("loseSpear",[12,13,14],3,false);
caller.animations.add("startPhone",[15,16,17],5,false);
caller.animations.add("onPhone",[18],4,true);
caller.animations.add("endPhone",[19,20,21],5,false);


/* attacks */
function* traditionAttack()
{
  const N_TWISTS = 10;
  const TWIST_SIZE = 10;
  const TWIST_AMOUNT = 0.04;
  const TWIST_SPACING = 60;
  const TWIST_PAUSE = 600;

  for (var iteration = 0;true;iteration++)
  {
    for (var i = 0;i < TWIST_SIZE;i++)
    {
      for (var u = 0;u < N_TWISTS;u++) poisonBullets.fire(getX(),getY(),0,0,Math.PI * 2 / N_TWISTS * u + i * TWIST_AMOUNT * iteration);
      yield* wait(TWIST_SPACING);
    }
    yield* wait(TWIST_PAUSE);
  }
}


function* prongAttack()
{
  caller.fighting = false;
  yield* wait(1000);
  yield* speak("n","haha, wait until you see this");
  yield* waitAnimation("loseSpear");
  music.fadeOut(1000,Channel.Music);
  yield* say("Stasbangora Kebabom","stasbangoraKebabom_n","Huh? Your traditional spear?\nit's gone!");
  yield* wait(500);
  yield* waitAnimation("startPhone");
  caller.animations.play("onPhone");
  yield* wait(300);
  yield* speak("n","Send in the guns.");
  yield* wait(300);
  yield* waitAnimation("endPhone");

  var gunA = createGun(getX(),getY(),"gun");
  var gunB = createGun(getX(),getY(),"gun");
  var gunMoveA = moveGun(gunA,getX() - 200,getY());
  var gunMoveB = moveGun(gunB,getX() + 200,getY());

  while (true)
  {
    var elapsed = yield;
    if (gunMoveA.next(elapsed) || gunMoveB.next(elapsed)) break;
  }



  caller.fighting = true;
  music.playSong("firstBoss",Channel.Music);

  while (true)
  {
    poisonBullets.fire(getX(),getY(),0,0,getAngleToPlayer());
    yield;
  }
}



controller.addState(600,traditionAttack);
controller.addState(450,prongAttack);
yield;



yield* waitAnimation("dead");
caller.dead = true
caller.properties.moveOnSpot = false;
ctx.setSwitch("centipedeDead",true);
while (true) yield;
