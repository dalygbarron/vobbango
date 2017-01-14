#include "std.js"

caller.fighting = true;
while (caller.health > 0)
{
  yield* waitMoveNearPosition(500,state.player.x,state.player.y,200);
  yield* wait(Math.random() * 500);
}
