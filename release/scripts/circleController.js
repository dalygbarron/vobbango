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
function getX() {return caller.body.x + caller.body.width / 2}
function getY() {return caller.y}
function getAngleToPlayer()
{
  return Math.atan2(state.player.y - getY(),state.player.x - getX());
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
      poisonBullets.fire(getX(),getY(),0,0,getAngleToPlayer() + i * spread / nBullets - spread / 2);
      yield* wait(delay);
    }
    yield* wait(period);
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
function* waitMove(x,y)
{
  while (true)
  {
    var elapsed = yield;
    if (close(getX(),x,caller.body.velocity.x * elapsed / 1000) &&
        close(getY(),y,caller.body.velocity.y * elapsed / 1000))
    {
      caller.x = x - caller.body.width / 2;
      caller.y = y;
      return;
    }
    var angle = Math.atan2(y - getY(),x - getX());
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
  var distance = Math.cos(Math.atan2(getY() - y,getX() - x)) * (getX() - x);
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
var angle = 0;
var bullets = state.createBulletGroup(caller,100,60,'blood1','shot');
var otherBullets = state.createBulletGroup(caller,80,70,'blood2','drip');
var hammerBullets = state.createBulletGroup(caller,100,60,'hammerBullet','shot');
var player = state.player;
var xOffset = caller.body.width / 2;
var yOffset = caller.body.height / 2;
caller.animations.add("red",[8,9,8,9,10,9,10,11],4,false);
function* waveBit()
{
  const N_WAVES = 10;
  var currentOnes = [];
  for (var i = 0;i < N_WAVES;i++) currentOnes.push(bullets.fire(caller.body.x + xOffset,caller.body.y + yOffset,0,0,Math.PI * 2 / N_WAVES * i - Math.PI));
  yield* wait(1000);
  for (var i = 0;i < N_WAVES;i++) currentOnes[i].redirect(Math.atan2(player.y - currentOnes[i].y,player.x - currentOnes[i].x),bullets.speed);
}
function* gravityBit()
{
  var elapsed = yield(null);
  angle += elapsed / 150;
  caller.body.velocity.x = Math.sin(angle) * caller.properties.moveSpeed;
  caller.body.velocity.y = Math.cos(angle) * caller.properties.moveSpeed;
  thickCircle.update(elapsed);
  thinCircle.update(elapsed);
}
function* hammerBit()
{
  const SPREAD = 1;
  const WIDTH = 7;
  const LENGTH = 2;
  const GAP = 300;
  var angle = Math.atan2(player.y - caller.y,player.x - caller.x);
  for (var i = 0;i < WIDTH;i++)
  {
    hammerBullets.fire(caller.body.x + xOffset,caller.body.y,0,0,angle + i * SPREAD / WIDTH - SPREAD / 2);
  }
  for (var i = 0;i < LENGTH;i++)
  {
    yield* wait(GAP);
    hammerBullets.fire(caller.body.x + xOffset,caller.body.y,0,0,angle);
  }
  yield* wait(GAP);
}
function* spearBit()
{
  const LENGTH = 7;
  const GAP = 1000;
  const DAMP = 0.9;
  const RING = 20;
  const PERIOD = Math.PI * 2 / RING;
  var angle = Math.atan2(player.y - caller.y,player.x - caller.x);
  var speed = hammerBullets.speed;
  for (var i = 0;i < LENGTH;i++)
  {
    hammerBullets.fireAtSpeed(caller.body.x + xOffset,caller.body.y,angle,speed);
    speed *= DAMP;
  }
  for (var i = 0;i < RING;i++)
  {
    var bullet = bullets.fire(caller.body.x + xOffset,caller.body.y,0,0,i * PERIOD - Math.PI);
    bullet.body.acceleration.x = Math.random() * 50 - 25;
    bullet.body.acceleration.y = Math.random() * 50 - 25;
  }
  yield* waitRandomMove(GAP);
}
var thickCircle = new Periodic(90,function()
{
  bullets.fire
  (
    caller.body.x + xOffset,caller.body.y + yOffset,player.body.x - caller.body.x,
    player.body.y - caller.body.y,Math.random() * Math.PI * 2 - Math.PI
  );
});
var thinCircle = new Periodic(70,function()
{
  otherBullets.fire(caller.body.x + xOffset,caller.body.y + yOffset,0,0,angle);
});
yield* speak("n","I am going to kill you");
caller.fighting = true;
while (caller.health > 80)
{
  var elapsed = yield;
  angle += elapsed / 110;
  thinCircle.update(elapsed);
}
caller.fighting = false;
music.fadeOut(1000,Channel.Music);
yield* speak("n","Yeah ok, but check out...");
sound.play("charge");
yield* waitAnimation("red");
music.playSong("trogBattle",Channel.Music);
yield* speak("n","MELTING ATTACK!!");
state.setOverlay("fog",100,300);
caller.fighting = true;
thinCircle.period *= 2;
while (caller.health > 40) yield* hammerBit();
yield* waitMoveToRegion("finalArea");
while (caller.health > 0) yield* gravityBit();
caller.fighting = false;
yield* speak("n","I am dead now");
state.removeOverlay();
sound.play("fiendDeath");
yield* waitAnimation("red");
