#include "std.js"


var bullets = state.createBulletGroup(caller,500,40,'bullet2',"shot");
var xOffset = caller.body.width / 2;

/** the player's bullet firing periodical thing */
var shooting = new Periodic(60,function()
{
  bullets.fire(caller.body.x + xOffset,caller.body.y,0,0,caller.angle + (Math.random() / 3 - 1 / 6));
});

/* the loop */
while (true)
{
  var elapsed = yield;

  /* if the player is strafing */
  if (input.getButtonState(Button.Strafe))
  {
    caller.strafing = true;
    caller.body.velocity.x = input.getAxisState(Axis.Horizontal) * caller.properties.strafeSpeed;
    caller.body.velocity.y = input.getAxisState(Axis.Vertical) * caller.properties.strafeSpeed;
  }

  /* otherwise */
  else
  {
    caller.strafing = false;
    caller.body.velocity.x = input.getAxisState(Axis.Horizontal) * caller.properties.moveSpeed;
    caller.body.velocity.y = input.getAxisState(Axis.Vertical) * caller.properties.moveSpeed;
  }

  /* shooting */
  if (input.getButtonState(Button.Shoot))
  {
    shooting.update(elapsed);
  }
}
