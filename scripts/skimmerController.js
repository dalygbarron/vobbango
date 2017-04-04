#include "std.js"
#include "wait.js"


const N_BULLETS = 14;
const GAP = 1000;
const VARIANCE = 950;
const SIZE = 1000;
const SIZE_VARIANCE = 500;
const BULLET_SPEED = 100;


var bullets = state.createBulletGroup(caller,60,BULLET_SPEED,"bubble");



while (true)
{
  var circle = [];
  var twist = Math.random();
  for (var i = 0;i < N_BULLETS;i++) circle.push(bullets.fire(getX(),getY(),0,0,(Math.PI * 2) / N_BULLETS * i + twist));
  yield* wait(SIZE + Math.random() * SIZE_VARIANCE - SIZE_VARIANCE / 2);
  for (i in circle) if (circle[i] !== null) circle[i].redirect(caller.properties.target?bulletAngleToPlayer(circle[i]):getFutureAngleToPlayer(BULLET_SPEED));

  yield* wait(GAP + Math.random() * VARIANCE - VARIANCE / 2);
}
