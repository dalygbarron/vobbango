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
var angle = 0;
var bullets = state.createBulletGroup(caller,100,60,'blood1','shot');
var otherBullets = state.createBulletGroup(caller,80,70,'blood2','drip');
var player = state.player;
var xOffset = caller.body.width / 2;
caller.animations.add("red",[8,9,8,9,10,9,10,11],4,false);
function* waveBit()
{
  const N_WAVES = 10;
  var currentOnes = [];
  for (var i = 0;i < N_WAVES;i++) currentOnes.push(bullets.fire(caller.body.x + xOffset,caller.body.y,0,0,Math.PI * 2 / N_WAVES * i - Math.PI));
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
var thickCircle = new Periodic(90,function()
{
  bullets.fire
  (
    caller.body.x + xOffset,caller.body.y,player.body.x - caller.body.x,
    player.body.y - caller.body.y,Math.random() * Math.PI * 2 - Math.PI
  );
});
var thinCircle = new Periodic(70,function()
{
  otherBullets.fire(caller.body.x + xOffset,caller.body.y,0,0,angle);
});
yield* speak("n","I am going to kill you");
caller.fighting = true;
while (caller.health > 80)
{
  var elapsed = yield(null);
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
while (caller.health > 40) yield* waveBit();
while (caller.health > 0) yield* gravityBit();
caller.fighting = false;
yield* speak("n","I am dead now");
state.removeOverlay();
sound.play("fiendDeath");
yield* waitAnimation("red");