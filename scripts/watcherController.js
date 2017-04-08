#include "wait.js"

while (true)
{
  var angle = getAngleToPlayer();
  caller.body.velocity.x = Math.cos(angle);
  caller.body.velocity.y = Math.sin(angle);
  yield;
  caller.body.velocity.set(0);
  yield* wait(200);
}
