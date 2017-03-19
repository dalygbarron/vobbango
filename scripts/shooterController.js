#include "std.js"

var bullets = state.createBulletGroup(caller,65,15,'spear');



caller.fighting = true;
while (caller.health > 0)
{
  bullets.fire(getX(),getY(),0,0,0 - Math.PI / 2);
  yield* wait(800);
}
caller.body.velocity.set(0);
caller.fighting = false;
caller.dead = true;
yield* waitAnimation("die");
while (true) yield;
