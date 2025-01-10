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
var whiteBullets = state.createBulletGroup(caller,250,300,'otherFlyBullet','drip');
var blackBullets = state.createBulletGroup(caller,150,300,'flyBullet','drip');
var largeBullets = state.createBulletGroup(caller,70,5,"maggotBall","flyNoise");
function* flyDescent()
{
  const RADIUS = 500;
  const N_BULLETS = 10;
  while (true)
  {
    var circle = [];
    for (var i = 0;i < N_BULLETS;i++)
    {
      circle.push(blackBullets.fire((caller.body.x + caller.body.width / 2),(caller.y),Math.random() * 10 - 5,Math.random() * 10 - 5,i * (Math.PI * 2) / N_BULLETS));
    }
    yield* wait(RADIUS);
    for (i in circle) if (circle[i] !== null)
    {
      var angle = Math.atan2(state.player.y - circle[i].y,state.player.x - circle[i].x);
      circle[i].redirect(angle);
    }
    yield* wait(RADIUS);
  }
}
function* haze()
{
  const RADIUS = 130;
  const N_BULLETS = 7;
  const GAP = 666;
  blackBullets.clear();
  while (true)
  {
    for (var i = 0;i < N_BULLETS;i++)
    {
      var x = (caller.body.x + caller.body.width / 2) + Math.random() * RADIUS - RADIUS / 2;
      var y = (caller.y) + Math.random() * RADIUS - RADIUS / 2;
      whiteBullets.fire(x,y,0,0,getAngleToPlayer());
    }
    yield* wait(GAP);
  }
}
function* infestation()
{
  const N_BULLETS = 5;
  const PERIOD = 700;
  const SPEED = 70;
  const SHOOT_PERIOD = 6;
  const WAVE = 2;
  const GAP = state.game.height / N_BULLETS;
  for (var iteration = 0;true;iteration++)
  {
    var leftOffset = Math.sin(iteration / WAVE) * GAP;
    var rightOffset = Math.sin(iteration / WAVE) * GAP;
    for (var i = 0;i < N_BULLETS;i++)
    {
      whiteBullets.fireAtSpeed(224,state.game.camera.y + state.game.height - (state.game.height / N_BULLETS) * i + leftOffset,0,SPEED);
      blackBullets.fireAtSpeed(576,state.game.camera.y + (state.game.height / N_BULLETS) * i + rightOffset,Math.PI,SPEED);
    }
    if (iteration % SHOOT_PERIOD == 0) largeBullets.fire((caller.body.x + caller.body.width / 2),(caller.y),0,0,getAngleToPlayer());
    yield* wait(PERIOD);
  }
}
function* stench()
{
  const N_BULLETS = 55;
  const N_ROWS = 5;
  const DAMP = 0.5;
  const GAP = 2000;
  const SMALL_GAP = 50;
  const N_MESS = 50;
  const GRAVITY = 300;
  const MESS_GRAVITY = 50;
  blackBullets.clear();
  whiteBullets.clear();
  largeBullets.clear();
  yield* speak("valom mor todad tu gamom godmem vobars let gamom gosemem valra arumemad rorars saasar.\ngamom mor tovotars.");
  while (true)
  {
    var offset = Math.random() * (Math.PI * 2) / N_BULLETS;
    for (var row = 0;row < N_ROWS;row++)
    {
      for (var i = 0;i < N_BULLETS;i++)
      {
        var angle = (Math.PI * 2) / N_BULLETS * i + offset;
        var gX = Math.cos(angle) * GRAVITY;
        var gY = Math.sin(angle) * GRAVITY;
        whiteBullets.fireAtSpeed((caller.body.x + caller.body.width / 2),(caller.y),angle,10,gX,gY);
      }
      yield* wait(SMALL_GAP);
    }
    for (var i = 0;i < N_MESS;i++)
    {
      blackBullets.fire((caller.body.x + caller.body.width / 2),(caller.y),Math.random() * MESS_GRAVITY - MESS_GRAVITY / 2,Math.random() * MESS_GRAVITY - MESS_GRAVITY / 2,Math.random() * Math.PI * 2);
    }
    yield* wait(GAP);
  }
}
function* swarm()
{
  const N_BULLETS = 100;
  const GAP = 50;
  while (true)
  {
    for (var i = 0;i < N_BULLETS;i++)
    {
      var bullets = (i % 2 == 0) ? whiteBullets : blackBullets;
      bullets.fireAtSpeed((caller.body.x + caller.body.width / 2),(caller.y),Math.random() * Math.PI * 2,90);
      yield* wait(GAP);
    }
    for (var bullets of [whiteBullets,blackBullets])
    {
      bullets.forEachAlive(function(bullet)
      {
        var angle = Math.atan2(state.player.y - bullet.y,state.player.x - bullet.x);
        bullet.redirect(angle);
      },this);
    }
    yield* wait(GAP);
  }
}
function* maggot()
{
  const GAP = 1900;
  const RADIUS = 65;
  const SPACING = 15;
  const N_ROWS = 10;
  const N_BULLETS = 10;
  const N_MESS = 40;
  blackBullets.clear();
  whiteBullets.clear();
  yield* speak("urtomad valom salodmem dormemtovotmemars.");
  while (true)
  {
    var x = state.player.x;
    var y = state.player.y;
    sound.play("flyNoise");
    yield* wait(300);
    for (var row = 0;row < N_ROWS;row++)
    {
      var offset = Math.random() * Math.PI * 2;
      for (var i = 0;i < N_BULLETS + row;i++)
      {
        var angle = (Math.PI * 2) / N_BULLETS * i + offset;
        whiteBullets.fireAtSpeed(x + Math.cos(angle) * (RADIUS + row * SPACING),
                                 y + Math.sin(angle) * (RADIUS + row * SPACING),
                                 angle + Math.PI / 2,10);
      }
    }
    state.addEffect(x,y,"charge",3);
    yield* wait(GAP);
    var offset = Math.random() * Math.PI * 2;
    for (var i = 0;i < N_MESS;i++) blackBullets.fire(x,y,0,0,(Math.PI * 2) / N_MESS * i + offset);
    yield* wait(GAP);
    whiteBullets.clear();
    blackBullets.clear();
  }
}
state.addEnemy(caller);
controller.addState(400,flyDescent);
controller.addState(200,haze);
controller.addState(0,infestation);
controller.addState(-200,stench);
controller.addState(-400,swarm);
controller.addState(-700,maggot);
yield;
yield* speak("tovotom mor urgomadad torememars. \nvalra todmemom mor tekemad. valom todmem.\ntorememom kobemem gamra gobars. kot tovotom mur gamars");
yield* speak("valom karo embars lev selead tobom kobemem gamra gobars.");
sound.play("fiendDeath");
controller.win();
