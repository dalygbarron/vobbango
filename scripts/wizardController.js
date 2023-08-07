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

function* say(name,text)
{
  state.buildTextbox(name,text);
  yield;
}
function* speak(text)
{
  state.buildTextbox(caller.properties.name,text);
  yield;
}
function* read(book,bookName)
{
  var content = ctx.state.tilemap.properties[book].split("-");
  for (var i = 0;i < content.length;i++)
  {
    yield* say(bookName,content[i].trim());
  }
}
function* watch()
{
  var dx = state.player.x - (caller.body.x + caller.body.width / 2);
  var dy = state.player.y - caller.y;
  var distance = Math.hypot(dx,dy);
  if (distance < caller.width) return;
  var x = caller.x;
  var y = caller.y;
  var angle = Math.atan2(state.player.y - caller.y,state.player.x - (caller.body.x + caller.body.width / 2));
  caller.body.velocity.x = Math.cos(angle);
  caller.body.velocity.y = Math.sin(angle);
  yield;
  caller.body.velocity.set(0);
  caller.x = x;
  caller.y = y;
  var elapsed = 0;
  while (elapsed < 200) elapsed += yield;
}
function* goSpooky(time)
{
  var totalTime = 0;
  while (totalTime < time)
  {
    totalTime += yield;
    var alpha = 1 - totalTime / time;
    if (alpha < 0) alpha = 0;
    for (var i = 1;i < state.tilemap.layers.length - 1;i++)
    {
      state.tilemap.forEach
      (
        function(tile)
        {
          tile.alpha = alpha;
        },this,0,0,state.tilemap.width,state.tilemap.height,i
      );
      state.tilemap.layers[i].dirty = true;
    }
  }
}
function* endSpooky(time)
{
  var totalTime = 0;
  while (totalTime < time)
  {
    totalTime += yield;
    var alpha = totalTime / time;
    if (alpha > 1) alpha = 1;
    for (var i = 1;i < state.tilemap.layers.length;i++)
    {
      state.tilemap.forEach
      (
        function(tile)
        {
          tile.alpha = alpha;
        },this,0,0,state.tilemap.width,state.tilemap.height,i
      );
      state.tilemap.layers[i].dirty = true;
    }
  }
}
function* awaitCollision(meanwhile=null)
{
  var collision = caller.collision;
  while (true)
  {
    if (collision != caller.collision) break;
    else if (meanwhile != null)
    {
      yield;
      yield* meanwhile();
    }
    else yield;
  }
}
function* awaitSeperation()
{
  const GAP = 100;
  while (true)
  {
    var collision = caller.collision;
    var elapsed = 0;
    for (var elapsed = 0;elapsed < GAP;elapsed += yield);
    if (collision == caller.collision) break;
  }
}
const PERIOD = 1500;
const VARIANCE = 10;
const N_BULLETS = 15;
var bullets = state.createBulletGroup(caller,60,100,'poison','shot');
var otherBullets = state.createBulletGroup(caller,60,100,'otherPoison','shot');
function* shooting(period)
{
  while (true)
  {
    for (var i = 0;i < N_BULLETS;i++)
    {
      bullets.fire(224,state.game.camera.y + state.game.height - (state.game.height / N_BULLETS) * i,0, 0 - Math.random() * VARIANCE,0);
      otherBullets.fire(576,state.game.camera.y + (state.game.height / N_BULLETS) * i,0,Math.random() * VARIANCE,Math.PI);
    }
    yield* wait(period);
    period -= 10;
  }
}
var shootingInstance = shooting(PERIOD);
state.addEnemy(caller);
var oldCameraPos = state.game.camera.position.clone();
while (true)
{
  var elapsed = yield;
  var elapsedSeconds = elapsed / 1000;
  var cameraPos = state.game.camera.position.clone();
  caller.body.velocity.x = (cameraPos.x - oldCameraPos.x) / elapsedSeconds;
  caller.body.velocity.y = (cameraPos.y - oldCameraPos.y) / elapsedSeconds;
  if (cameraPos.y < 1) break;
  shootingInstance.next(elapsed);
  oldCameraPos = cameraPos;
}
bullets.clear();
otherBullets.clear();
StateOfGame.parameters.lives = 3;
yield* speak("They put the wire into my head");
sound.play("die");
state.addEffect((caller.body.x + caller.body.width / 2),(caller.y),"splat",10);
state.removeEnemy(caller);
