#include "std.js"
#include "wait.js"
#include "theatre.js"
#include "periodic.js"
#include "gun.js"


/* definitions and that */
var poisonBullets = state.createBulletGroup(caller,200,1600,'poison','shot');
var cBullets = state.createBulletGroup(caller,120,300,'cBulletSmall','shot');
var guns = [];


/* attacks */
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
      for (var u = 0;u < N_TWISTS;u++) poisonBullets.fire(getX(),getY(),0,0,Math.PI * 2 / N_TWISTS * u + i * TWIST_AMOUNT * iteration);
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
  yield* speak("haha, wait until you see this");
  music.fadeOut(1000,Channel.Music);
  yield* speak("Send in the guns.");

  for (var i = 0;i < N_GUNS;i++)
  {
    guns[i] = createGun(getX(),getY(),"gun");
    var angle = Math.PI * 2 / N_GUNS * i;
    addTarget(guns[i],getX() + Math.cos(angle) * GUN_RADIUS,getY() + Math.sin(angle) * GUN_RADIUS);
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

  //top to bottom guns
  for (var i = 2;i < X_GUNS - 2;i++)
  {
    var gun = createGun(getX(),getY(),"gun");
    guns.push(gun);
    if (i % 2)
    {
      var side = gun.height;
      gun.fireAngle = Math.PI / 2;
    }
    else
    {
      var side = state.tilemap.height * state.tilemap.tileHeight - gun.height;
      gun.fireAngle = Math.PI +  Math.PI / 2;
    }
    addTarget(gun,state.game.width / X_GUNS * (i + 0.5),side);
  }

  //side guns
  for (var i = 0;i < Y_GUNS - 1;i++)
  {
    var gun = createGun(getX(),getY(),"gun");
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
  const PERIOD = 200;
  const BULLET_SPEED = 25;
  var increment = (Math.PI * 2) / N_GAPS / (CIRCUMFERENCE + GAP);

  clearGuns(guns);
  cBullets.clear();
  poisonBullets.clear();
  yield* speak("Even if you should defeat me, the order of the world cannot be changed.\nNot by any man.");
  yield* say("Stasbangora Kebabom","stasbangoraKebabom_n","Where did all this weaponry come from?");
  yield* speak("Susbangom.\nValom gamars dar testmem.");
  yield* say("Stasbangora Kebabom","stasbangoraKebabom_n","No");
  yield* say("Stasbangora Kebabom","stasbangoraKebabom_n","Valom mor dotbangoars.\nGamom mor stasbangoars\nCunt");

  yield* goSpooky(1000);

  while (true)
  {
    var gapAngle = Math.random() * Math.PI * 2;

    // the dividers
    for (var i = 0;i < N_GAPS;i++)
    {
      for (var u = 0;u < CIRCUMFERENCE;u++)
      {
        poisonBullets.fireAtSpeed(getX(),getY(),gapAngle + (Math.PI * 2) / N_GAPS * i + increment * u,BULLET_SPEED);
      }
    }
    yield* wait(PERIOD);

    //the walls
    var wallAngle = Math.random() * Math.PI * 2;
    for (var i = 0;i < ROWS;i++)
    {
      for (var u = 0;u < N_GAPS;u++)
      {
        poisonBullets.fireAtSpeed(getX(),getY(),wallAngle + (Math.PI * 2) / N_GAPS * u,BULLET_SPEED);
      }
      yield* wait(PERIOD);
    }
  }
}


/* setting up stuff */
state.addEnemy(caller);
controller.addState(800,traditionAttack);
controller.addState(650,prongAttack);
controller.addState(450,gridAttack);
controller.addState(0,mazeAttack);
yield;


/* end stuff */
music.playSong("scream",Channel.Ambience);
caller.animations.play("dying");
poisonBullets.clear();
yield* wait(2000);
music.stopSong(Channel.Music);
music.stopSong(Channel.Ambience);
sound.play("fiendDeath");
yield* waitAnimation("death");
state.removeEnemy(caller);
yield* endSpooky(1000);
while (true) yield;
