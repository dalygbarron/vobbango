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
function createGun(x,y,key,moveSpeed=200,name="e")
{
  var data = {"key":key,"directional":false,"moveOnSpot":true,"health":1,
              "moveSpeed":moveSpeed,"controller":"gunController.js"};
  var gun = state.addDrone(x,y,name,{"properties":data});
  gun.targets = [];
  return gun;
}
function addTarget(gun,x,y)
{
  gun.targets.push({x:x,y:y});
}
function* waitGuns(guns)
{
  yield* wait(50);
  while (true)
  {
    var clean = true;
    for (var i in guns)
    {
      var speed = guns[i].body.speed;
      if (speed > 1 || speed < -1)
      {
        clean = false;
      }
    }
    if (clean) return;
    yield;
  }
}
function clearGuns(guns)
{
  for (var i in guns) guns[i].kill();
  guns.length = 0;
}
var poisonBullets = state.createBulletGroup(caller,200,1600,'poison','shot');
var cBullets = state.createBulletGroup(caller,120,300,'cBulletSmall','shot');
var guns = [];
function* traditionAttack()
{
  const N_TWISTS = 10;
  const TWIST_SIZE = 10;
  const TWIST_AMOUNT = 0.04;
  const TWIST_SPACING = 60;
  const TWIST_PAUSE = 600;
  for (var iteration = 0;true;iteration++)
  {
    for (var i = 0;i < TWIST_SIZE;i++)
    {
      for (var u = 0;u < N_TWISTS;u++) poisonBullets.fire((caller.body.x + caller.body.width / 2),(caller.y),0,0,Math.PI * 2 / N_TWISTS * u + i * TWIST_AMOUNT * iteration);
      yield* wait(TWIST_SPACING);
    }
    yield* wait(TWIST_PAUSE);
  }
}
function* prongAttack()
{
  const N_GUNS = 2;
  const GUN_RADIUS = 300;
  const GAP = 400;
  poisonBullets.clear();
  yield* speak("hahaha. valom takmem valra latarse gom tovotars");
  music.fadeOut(1000,Channel.Music);
  yield* speak("vesdmem betarse");
  for (var i = 0;i < N_GUNS;i++)
  {
    guns[i] = createGun((caller.body.x + caller.body.width / 2),(caller.y),"gun");
    var angle = Math.PI * 2 / N_GUNS * i;
    addTarget(guns[i],(caller.body.x + caller.body.width / 2) + Math.cos(angle) * GUN_RADIUS,(caller.y) + Math.sin(angle) * GUN_RADIUS);
  }
  music.playSong("secondBoss",Channel.Music);
  while (true)
  {
    for (var i = 0;i < N_GUNS;i++)
    {
      var angle = Math.atan2(state.player.y - guns[i].y,state.player.x - guns[i].x);
      cBullets.fire(guns[i].x,guns[i].y,0,0,angle);
    }
    yield* wait(GAP);
  }
}
function* fireGunsAtAngle(guns)
{
  while (true)
  {
    for (var i in guns) cBullets.fire(guns[i].x,guns[i].y,0,0,guns[i].fireAngle);
    yield* wait(300);
  }
}
function* gridAttack()
{
  const X_GUNS = 9;
  const Y_GUNS = 4;
  const N_BULLETS = 11;
  const BULLET_DAMP = 0.25;
  const BULLET_MAX_SPEED = 80
  const BULLET_SPREAD = 0.6;
  const BULLET_PERIOD = 2000;
  clearGuns(guns);
  cBullets.clear();
  for (var i = 2;i < X_GUNS - 2;i++)
  {
    var gun = createGun((caller.body.x + caller.body.width / 2),(caller.y),"gun");
    guns.push(gun);
    if (i % 2)
    {
      var side = gun.height;
      gun.fireAngle = Math.PI / 2;
    }
    else
    {
      var side = state.tilemap.height * state.tilemap.tileHeight - gun.height;
      gun.fireAngle = Math.PI + Math.PI / 2;
    }
    addTarget(gun,state.game.width / X_GUNS * (i + 0.5),side);
  }
  for (var i = 0;i < Y_GUNS - 1;i++)
  {
    var gun = createGun((caller.body.x + caller.body.width / 2),(caller.y),"gun");
    guns.push(gun);
    if (i % 2)
    {
      var side = gun.width;
      gun.fireAngle = 0;
    }
    else
    {
      var side = state.tilemap.width * state.tilemap.tileWidth - gun.width;
      gun.fireAngle = Math.PI;
    }
    addTarget(gun,side,state.game.height / Y_GUNS * (i + 1));
  }
  fireGunsPeriodic = fireGunsAtAngle(guns);
  firePoisonPeriodic = periodicWave(poisonBullets,N_BULLETS,BULLET_DAMP,BULLET_MAX_SPEED,BULLET_SPREAD,BULLET_PERIOD);
  while (true)
  {
    var elapsed = yield;
    fireGunsPeriodic.next(elapsed);
    firePoisonPeriodic.next(elapsed);
  }
}
function* mazeAttack()
{
  const CIRCUMFERENCE = 14;
  const GAP = 8;
  const N_GAPS = 8;
  const ROWS = 7;
  const PERIOD = 100;
  const BULLET_SPEED = 100;
  var increment = (Math.PI * 2) / N_GAPS / (CIRCUMFERENCE + GAP);
  clearGuns(guns);
  cBullets.clear();
  poisonBullets.clear();
  yield* speak("tebu valom mutvemem gamars let terkra toktom mor kabtad. beamgouom seak tovotars.");
  yield* say("Stasbangora Kebabom","tovotad tekaketum gedarmem tend.");
  yield* speak("gamom mor stovad");
  yield* say("Stasbangora Kebabom","Valom mor dotbangoars.\nGamom mor stasbangoars");
  yield* goSpooky(1000);
  while (true)
  {
    var gapAngle = Math.random() * Math.PI * 2;
    for (var i = 0;i < N_GAPS;i++)
    {
      for (var u = 0;u < CIRCUMFERENCE;u++)
      {
        poisonBullets.fireAtSpeed((caller.body.x + caller.body.width / 2),(caller.y),gapAngle + (Math.PI * 2) / N_GAPS * i + increment * u,BULLET_SPEED);
      }
    }
    yield* wait(PERIOD);
    var wallAngle = Math.random() * Math.PI * 2;
    for (var i = 0;i < ROWS;i++)
    {
      for (var u = 0;u < N_GAPS;u++)
      {
        poisonBullets.fireAtSpeed((caller.body.x + caller.body.width / 2),(caller.y),wallAngle + (Math.PI * 2) / N_GAPS * u,BULLET_SPEED);
      }
      yield* wait(PERIOD);
    }
  }
}
state.addEnemy(caller);
controller.addState(800,traditionAttack);
controller.addState(650,prongAttack);
controller.addState(450,gridAttack);
controller.addState(0,mazeAttack);
yield;
music.playSong("scream",Channel.Ambience);
caller.animations.play("dying");
poisonBullets.clear();
yield* wait(5000);
music.stopSong(Channel.Music);
music.stopSong(Channel.Ambience);
sound.play("fiendDeath");
yield* waitAnimation("death");
state.removeEnemy(caller);
yield* endSpooky(1000);
yield* awaitCollision();
yield* say("Stasbangora Kebabom","gamom submem sudarsom");
controller.transport("dot/start","start");
