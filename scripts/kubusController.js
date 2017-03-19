#include "std.js"

const xOrigin = getX();
const yOrigin = getY();

var xOffset = caller.body.width / 2;
var yOffset = caller.body.height / 2;
var bullets = state.createBulletGroup(caller,100,60,'blood1','shot');
var hammerBullets = state.createBulletGroup(caller,100,60,'hammerBullet','shot');



function* spearBit()
{
  const LENGTH = 8;
  const GAP = 1000;
  const DAMP = 0.9;
  const RING = 14;
  const MOVE_RADIUS = 80;
  const PERIOD = Math.PI * 2 / RING;

  if (caller.key == "dotbango") console.log(caller.health)

  var angle = Math.atan2(state.player.y - caller.y,state.player.x - caller.x);

  var speed = hammerBullets.speed;
  for (var i = 0;i < LENGTH;i++)
  {
    hammerBullets.fireAtSpeed(caller.body.x + xOffset,caller.body.y + yOffset,angle,speed);
    speed *= DAMP;
  }

  for (var i = 0;i < RING;i++)
  {
    var bullet = bullets.fire(caller.body.x + xOffset,caller.body.y + yOffset,0,0,i * PERIOD - Math.PI);
    if (bullet == null) continue;

    bullet.body.acceleration.x = Math.random() * 50 - 25;
    bullet.body.acceleration.y = Math.random() * 50 - 25;
  }

  yield* waitMoveNearPosition(GAP + Math.random() * 500,xOrigin,yOrigin,MOVE_RADIUS);
}

caller.fighting = true;
while (caller.health > 0) yield* spearBit();
caller.body.velocity.set(0);
caller.fighting = false;
caller.dead = true;
yield* waitAnimation("die");
while (true) yield;
