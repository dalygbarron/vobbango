function* say(name,chip,text)
{
  state.buildTextbox(name,text,chip);
  yield;
}
function* speak(mood,text)
{
  state.buildTextbox(caller.properties.name,text,caller.properties.name+"_"+mood);
  yield;
}
function* read(book,bookName,bookChip)
{
  var content = ctx.state.tilemap.properties[book].split("-");
  for (var i = 0;i < content.length;i++)
  {
    yield* say(bookName,bookChip,content[i].trim());
  }
}
class Periodic
{
  constructor(period,callback)
  {
    this.period = period;
    this.callback = callback;
    this.time = 0;
  }
  update(elapsed)
  {
    this.time += elapsed;
    if (this.time >= this.period)
    {
      while (this.time >= this.period) this.time -= this.period;
      this.callback();
    }
  }
}
function* wait(time)
{
  var elapsed = 0;
  while (elapsed < time)
  {
    elapsed += yield;
  }
  return elapsed - time;
}
function* waitAnimation(name)
{
  caller.animations.play(name);
  while (!caller.animations.currentAnim.isFinished) yield;
}
function* waitEffect(x,y,name,nFrames,framerate)
{
  var effect = state.addEffect(x,y,name,nFrames,framerate);
  while (effect.alive) yield;
}
function setSelfSwitch(name,value)
{
  ctx.setSwitch(ctx.state.tilemap.key+"-"+ctx.caller.name+"-"+name,value);
}
function getSelfSwitch(name)
{
  return ctx.getSwitch(ctx.state.tilemap.key+"-"+ctx.caller.name+"-"+name,value);
}
function compareArrays(a,b)
{
  if (a.length != b.length) return false;
  for (var i = 0 ;i < a.length;i++) if (a[i] != b[i]) return false;
  return true;
}
var bullets = state.createBulletGroup(caller,300,40,'bullet2',"shot");
var xOffset = caller.body.width / 2;
var shooting = new Periodic(90,function()
{
  bullets.fire(caller.body.x + xOffset,caller.body.y,0,0,caller.angle + (Math.random() / 4 - 0.125));
});
while (true)
{
  var elapsed = yield;
  if (input.getButtonState(Button.Strafe))
  {
    caller.strafing = true;
    caller.body.velocity.x = input.getAxisState(Axis.Horizontal) * caller.properties.strafeSpeed;
    caller.body.velocity.y = input.getAxisState(Axis.Vertical) * caller.properties.strafeSpeed;
  }
  else
  {
    caller.strafing = false;
    caller.body.velocity.x = input.getAxisState(Axis.Horizontal) * caller.properties.moveSpeed;
    caller.body.velocity.y = input.getAxisState(Axis.Vertical) * caller.properties.moveSpeed;
  }
  if (input.getButtonState(Button.Shoot))
  {
    shooting.update(elapsed);
  }
}