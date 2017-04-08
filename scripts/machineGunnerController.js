#include "wait.js"
#include "std.js"


const N_SHOTS = 15;
const GAP = 60;
const BIG_GAP = 500;



var bullets = state.createBulletGroup(caller,200,30,'otherPoison','shot');



state.addEnemy(caller);
while (caller.health > 0)
{
  for (var i = 0;i < N_SHOTS;i++)
  {
    bullets.fire(getX(),getY(),0,0,getAngleToPlayer());
    yield* wait(GAP);
  }
  var angle = getAngleToPlayer();
  caller.body.velocity.x = Math.cos(angle);
  caller.body.velocity.y = Math.sin(angle);
  yield;
  caller.body.velocity.set(0);
  yield* wait(BIG_GAP);
}
state.addEffect(getX(),getY(),"splat",10);
state.removeEnemy(caller);
