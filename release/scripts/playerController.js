var bullets = state.createBulletGroup(caller,300,40,'blood1');
var xOffset = caller.body.width / 2;

/** the player's bullet firing periodical thing */
var shooting = new Periodic(90,function()
{
  bullets.fire(caller.body.x + xOffset,caller.body.y,0,0,caller.angle + (Math.random() / 4 - 0.125));
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
