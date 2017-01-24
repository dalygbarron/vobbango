#include "std.js"
#include "wait.js"




/** the player's bullet firing periodical thing */
function* shooting(period)
{
  var bullets = state.createBulletGroup(caller,500,40,'bullet2',"shot");
  while (true)
  {
    bullets.fire(getX(),getY(),0,0,caller.angle + (Math.random() / 3 - 1 / 6));
    yield* wait(period);
  }
}


var shootingInstance = shooting(60);

/* the loop */
while (true)
{
  var elapsed = yield;

  if (state.hitCooldown > 0) var speedDamp = 0.4;
  else var speedDamp = 1;

  /* if the player is strafing */
  if (input.getButtonState(Button.Strafe))
  {
    caller.strafing = true;
    caller.body.velocity.x = input.getAxisState(Axis.Horizontal) * caller.properties.strafeSpeed * speedDamp;
    caller.body.velocity.y = input.getAxisState(Axis.Vertical) * caller.properties.strafeSpeed * speedDamp;
  }

  /* otherwise */
  else
  {
    caller.strafing = false;
    caller.body.velocity.x = input.getAxisState(Axis.Horizontal) * caller.properties.moveSpeed * speedDamp;
    caller.body.velocity.y = input.getAxisState(Axis.Vertical) * caller.properties.moveSpeed * speedDamp;
  }

  /* shooting */
  if (input.getButtonState(Button.Shoot))
  {
    shootingInstance.next(elapsed);
  }
}
