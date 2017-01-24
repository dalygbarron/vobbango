#include "std.js"
#include "wait.js"
#include "theatre.js"
#include "periodic.js"
#include "gun.js"


/* definitions and that */
var poisonBullets = state.createBulletGroup(caller,200,1600,'poison','shot');
var cBullets = state.createBulletGroup(caller,120,300,'cBulletSmall','shot');
var guns = [];
caller.animations.add("dying",[1,2,6,9],20,true);
caller.animations.add("death",[8,9,10,11],4,false);
caller.animations.add("loseSpear",[12,13,14],3,false);
caller.animations.add("startPhone",[15,16,17],5,false);
caller.animations.add("onPhone",[18],4,true);
caller.animations.add("endPhone",[19,20,21],5,false);


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

  caller.mode = Mode.NORMAL;
  yield* waitBullets(poisonBullets);
  yield* speak("n","haha, wait until you see this");
  yield* waitAnimation("loseSpear");
  music.fadeOut(1000,Channel.Music);
  yield* say("Stasbangora Kebabom","stasbangoraKebabom_n","Huh? Your traditional spear?\nit's gone!");
  yield* wait(500);
  yield* waitAnimation("startPhone");
  caller.animations.play("onPhone");
  yield* wait(300);
  yield* speak("n","Send in the guns.");
  yield* wait(300);
  yield* waitAnimation("endPhone");
  caller.animations.add("front",[22,23,24,25],10,false);
  caller.animations.add("back",[26,27,28,29],10,false);

  for (var i = 0;i < N_GUNS;i++)
  {
    guns[i] = createGun(getX(),getY(),"gun");
    var angle = Math.PI * 2 / N_GUNS * i;
    addTarget(guns[i],getX() + Math.cos(angle) * GUN_RADIUS,getY() + Math.sin(angle) * GUN_RADIUS);
  }

  caller.mode = Mode.FIGHTING;
  music.playSong("secondBoss",Channel.Music);

  while (true)
  {
    for (var i = 0;i < N_GUNS;i++)
    {
      var angle = Math.atan2(state.player.y - guns[i].y,state.player.x - guns[i].x);
      cBullets.fire(guns[i].x,guns[i].y,0,0,angle);
    }
    yield* waitRandomMove(GAP);
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

  // go back to spot
  yield* waitMoveToRegion("bossCentre");

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

  yield* waitGuns(guns);

  fireGunsPeriodic = fireGunsAtAngle(guns);
  firePoisonPeriodic = periodicWave(poisonBullets,N_BULLETS,BULLET_DAMP,BULLET_MAX_SPEED,BULLET_SPREAD,BULLET_PERIOD);

  while (true)
  {
    var elapsed = yield;
    fireGunsPeriodic.next(elapsed);
    firePoisonPeriodic.next(elapsed);
  }
}


function* coneAttack()
{
  const N_GUNS = 12;
  const GUN_RADIUS = 200;
  const PERIOD = 1500;



  var guns = [];
  for (var i = 0;i < N_GUNS;i++)
  {
    guns[i] = createGun(getX(),getY(),"gun");
    var angle = Math.PI * 2 / N_GUNS * i;
    addTarget(guns[i],getX() + Math.cos(angle) * GUN_RADIUS,getY() + Math.sin(angle) * GUN_RADIUS);
  }

  while (true)
  {
    for (var i = 0;i < N_GUNS;i++)
    {
      var angle = Math.atan2(state.player.y - guns[i].y,state.player.x - guns[i].x);
      cBullets.fire(guns[i].x,guns[i].y,0,0,angle);
    }
    yield* wait(PERIOD);
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
  yield* waitBullets(poisonBullets);
  yield* speak("n","Even if you should defeat me, the order of the world cannot be changed.\nNot by any man.");
  yield* say("Stasbangora Kebabom","stasbangoraKebabom_n","Where did all this weaponry come from?");
  yield* speak("n","Susbangom.\nValom gamars dar testmem.");
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


caller.mode = Mode.FIGHTING;
controller.addState(600,traditionAttack);
controller.addState(450,prongAttack);
controller.addState(350,gridAttack);
//controller.addState(200,coneAttack);
controller.addState(150,mazeAttack);
yield;



music.playSong("scream",Channel.Ambience);
caller.animations.play("dying");
yield* waitBullets(poisonBullets);
music.stopSong(Channel.Music);
music.stopSong(Channel.Ambience);
sound.play("fiendDeath");
yield* waitAnimation("death");
caller.mode = Mode.DEAD;
ctx.setSwitch("centipedeDead",true);
yield* endSpooky(1000);
while (true) yield;
