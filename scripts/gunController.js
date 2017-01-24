#include "std.js"
#include "wait.js"


var elapsed = 0;
while (caller.health > 0)
{
  if (caller.targets.length > 0)
  {
    var target = caller.targets.shift();
    yield* waitMove(target.x,target.y);
  }
  else
  {
    var x = caller.x;
    var y = caller.y;
    var angle = getAngleToPlayer();
    caller.body.velocity.x = Math.cos(angle);
    caller.body.velocity.y = Math.sin(angle);
    yield* wait(100);
    caller.x = x;
    caller.y = y;
  }
}
