#include "periodic.js"
#include "std.js"
#include "wait.js"

const WAIT = 50;


/* set up */
var bullets = state.createBulletGroup(caller,140,30,"nightweirdBullet","worm");
state.addEnemy(caller);

/* attacking */
var time = 0;

while (caller.health > 0)
{
  time += WAIT;
  yield* wait(WAIT)
  bullets.fire(getX(),getY(),0,0,getAngleToPlayer() + Math.sin(time / 100) / 2);
}





/* un set up */
sound.play("wormDeath");
state.removeEnemy(caller);
