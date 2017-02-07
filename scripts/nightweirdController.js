#include "periodic.js"
#include "std.js"
#include "wait.js"


/* set up */
var bullets = state.createBulletGroup(caller,140,30,'nightweirdBullet','bugNoise');
var shooting = periodicWave(bullets,4,0.5,140,1,1000);
var xOrigin = getX() - state.player.x;
var yOrigin = getY() - state.player.y;
caller.moveOnSpot = true;
state.addEnemy(caller);



/* actual stuff */
yield* wait(500);
while (caller.health > 0)
{
  shooting.next(yield);
  if (getX() - state.player.x < xOrigin) caller.body.velocity.x = caller.properties.moveSpeed;
  if (getX() - state.player.x > xOrigin) caller.body.velocity.x = -1 * caller.properties.moveSpeed;
  if (getY() - state.player.y < yOrigin) caller.body.velocity.y = caller.properties.moveSpeed;
  if (getY() - state.player.y > yOrigin) caller.body.velocity.y = -1 * caller.properties.moveSpeed;
}

/* un set up */
state.removeEnemy(caller);
