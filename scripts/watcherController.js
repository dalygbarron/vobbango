#include "std.js"

while (true)
{
  var angle = getAngleToPlayer();
  caller.body.velocity.x = Math.sin(angle);
  caller.body.velocity.y = Math.cos(angle);
  yield;
  caller.body.velocity.set(0);
  yield* wait(200);
}
