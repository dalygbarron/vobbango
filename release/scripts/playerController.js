var moveSpeed = 150;

while (true)
{


  caller.body.velocity.x = input.getAxisState(Axis.Horizontal) * moveSpeed;
  caller.body.velocity.y = input.getAxisState(Axis.Vertical) * moveSpeed;
  yield;
}
