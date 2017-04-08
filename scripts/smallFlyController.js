#include "wait.js"
#include "std.js"


const N_SHOTS = 3;
const SPREAD = 0.2;
const GAP = 300;



var bullets = state.createBulletGroup(caller,200,150,'otherFlyBullet','drip');



state.addEnemy(caller);
while (caller.health > 0)
{
  for (var i = 0;i < N_SHOTS;i++)
  {
    bullets.fire(getX(),getY(),0,0,getAngleToPlayer() + SPREAD / N_SHOTS * (i + 0.5) - SPREAD / 2);
  }
  caller.body.velocity.x = Math.random() * 200 - 100;
  caller.body.velocity.y = Math.random() * 200 - 100;
  yield* wait(GAP);
}
state.addEffect(getX(),getY(),"splat",10);
state.removeEnemy(caller);
