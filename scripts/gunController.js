#include "std.js"


/*
 * TODO: remember, things don't have to use movespeed, that is just a thing I set up.
 * What if instead I made it that you just give this thing some kind of function to
 * control their current velocity. */


var elapsed = 0;
while (true)
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
