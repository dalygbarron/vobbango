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


var oldCameraPos = state.game.camera.position.clone();

/* the loop */
while (true)
{
  var elapsed = yield;
  var elapsedSeconds = elapsed / 1000;

  var cameraPos = state.game.camera.position.clone();

  if (state.scroll.x != 0 || state.scroll.y != 0)
  {
    caller.body.velocity.x = (cameraPos.x - oldCameraPos.x) / elapsedSeconds;
    caller.body.velocity.y = (cameraPos.y - oldCameraPos.y) / elapsedSeconds;
  }
  else
  {
    caller.body.velocity.x = 0;
    caller.body.velocity.y = 0;
  }

  /* if the player is strafing */
  if (input.getButtonState(Button.Strafe))
  {
    caller.strafing = true;
    caller.body.velocity.x += input.getAxisState(Axis.Horizontal) * caller.properties.strafeSpeed;
    caller.body.velocity.y += input.getAxisState(Axis.Vertical) * caller.properties.strafeSpeed;
  }

  /* otherwise */
  else
  {
    caller.strafing = false;
    caller.body.velocity.x += input.getAxisState(Axis.Horizontal) * caller.properties.moveSpeed;
    caller.body.velocity.y += input.getAxisState(Axis.Vertical) * caller.properties.moveSpeed;
  }

  /* shooting */
  if (input.getButtonState(Button.Shoot))
  {
    shootingInstance.next(elapsed);
  }

  oldCameraPos = cameraPos;
}
