function getAngleToPlayer()
{
  return Math.atan2(state.player.y - (caller.y),state.player.x - (caller.body.x + caller.body.width / 2));
}
function getFutureAngleToPlayer(bulletSpeed)
{
  var time = Math.hypot(state.player.x - (caller.body.x + caller.body.width / 2),state.player.y - (caller.y)) / bulletSpeed;
  return Math.atan2((state.player.y + time * state.scroll.y) - (caller.y),(state.player.x + time * state.scroll.x) - (caller.body.x + caller.body.width / 2));
}
function bulletAngleToPlayer(bullet)
{
  return Math.atan2(state.player.y - bullet.y,state.player.x - bullet.x);
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
function* wait(time)
{
  var elapsed = 0;
  while (elapsed < time) elapsed += yield;
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
function* waitMove(x,y)
{
  while (true)
  {
    var elapsed = yield;
    if (close((caller.body.x + caller.body.width / 2),x,caller.body.velocity.x * elapsed / 1000) &&
        close((caller.y),y,caller.body.velocity.y * elapsed / 1000))
    {
      caller.x = x - caller.body.width / 2;
      caller.y = y;
      return;
    }
    var angle = Math.atan2(y - (caller.y),x - (caller.body.x + caller.body.width / 2));
    caller.body.velocity.x = Math.cos(angle) * caller.properties.moveSpeed;
    caller.body.velocity.y = Math.sin(angle) * caller.properties.moveSpeed;
  }
}
function* waitRandomMove(time)
{
  var angle = Math.random() * Math.PI * 2 - Math.PI;
  caller.body.velocity.x = Math.sin(angle) * caller.properties.moveSpeed;
  caller.body.velocity.y = Math.cos(angle) * caller.properties.moveSpeed;
  yield* wait(time);
}
function* waitMoveNearPosition(time,x,y,maxDistance)
{
  var distance = Math.cos(Math.atan2((caller.y) - y,(caller.body.x + caller.body.width / 2) - x)) * ((caller.body.x + caller.body.width / 2) - x);
  if (distance < maxDistance)
  {
    var angle = Math.random() * Math.PI * 2 - Math.PI;
    caller.body.velocity.x = Math.sin(angle) * caller.properties.moveSpeed;
    caller.body.velocity.y = Math.cos(angle) * caller.properties.moveSpeed;
    yield* wait(time);
  }
  else
  {
    yield* waitMove(x,y);
  }
}
function* waitMoveToRegion(region)
{
  var region = state.regions[region];
  var x = region.x + region.width / 2;
  var y = region.y + region.height / 2;
  yield* waitMove(x,y);
  caller.body.velocity.set(0);
}
function close(value,target,margin)
{
  margin = Math.abs(margin);
  return ((value >= target - margin) && (value <= target + margin));
}
function* periodicSpray(bulletGroup,nBullets,spread,period,delay=0)
{
  while(true)
  {
    for (var i = 0;i < nBullets;i++)
    {
      bulletGroup.fire((caller.body.x + caller.body.width / 2),(caller.y),0,0,getAngleToPlayer() + (i + 0.5) * spread / nBullets - spread / 2);
      yield* wait(delay);
    }
    yield* wait(period);
  }
}
function* periodicWave(bulletGroup,nBullets,damp,maxSpeed,spread,period)
{
  while(true)
  {
    for (var i = 0;i < nBullets;i++)
    {
      var speed = (Math.sin((i + 0.5) / nBullets * Math.PI) * (1 - damp) + damp) * maxSpeed;
      bulletGroup.fireAtSpeed((caller.body.x + caller.body.width / 2),(caller.y),getAngleToPlayer() + (i + 0.5) * spread / nBullets - spread / 2,speed);
    }
    yield* wait(period);
  }
}
const WAIT = 50;
var bullets = state.createBulletGroup(caller,140,30,"nightweirdBullet","worm");
state.addEnemy(caller);
var time = 0;
while (caller.health > 0)
{
  time += WAIT;
  yield* wait(WAIT)
  bullets.fire((caller.body.x + caller.body.width / 2),(caller.y),0,0,getAngleToPlayer() + Math.sin(time / 100) / 2);
}
sound.play("wormDeath");
state.removeEnemy(caller);
