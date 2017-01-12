#include "std.js"

while (true)
{
  var angle = Math.atan2(state.player.x - getX(),state.player.y - getY());
  caller.body.velocity.x = Math.sin(angle);
  caller.body.velocity.y = Math.cos(angle);
  yield;
  caller.body.velocity.set(0);
  yield* wait(200);
}
