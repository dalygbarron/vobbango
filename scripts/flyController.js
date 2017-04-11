#include "std.js"
#include "theatre.js"
#include "wait.js"




/* definitions and that */
var whiteBullets = state.createBulletGroup(caller,250,300,'otherFlyBullet','drip');
var blackBullets = state.createBulletGroup(caller,150,300,'flyBullet','drip');
var largeBullets = state.createBulletGroup(caller,70,5,"maggotBall","flyNoise");



/* attacks */
function* flyDescent()
{
  const RADIUS = 500;
  const N_BULLETS = 10;

  while (true)
  {
    var circle = [];

    // Shoot out in a circle.
    for (var i = 0;i < N_BULLETS;i++)
    {
      circle.push(blackBullets.fire(getX(),getY(),Math.random() * 10 - 5,Math.random() * 10 - 5,i * (Math.PI * 2) / N_BULLETS));
    }
    yield* wait(RADIUS);

    // Target the circle at the player.
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
      var x = getX() + Math.random() * RADIUS - RADIUS / 2;
      var y = getY() + Math.random() * RADIUS - RADIUS / 2;
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

  // TODO: this would be way better if the large bullet follows you around, and a new one
  // TODO: is only created if the last one gets destroyed somehow

  for (var iteration = 0;true;iteration++)
  {
    var leftOffset = Math.sin(iteration / WAVE) * GAP;
    var rightOffset = Math.sin(iteration / WAVE) * GAP;
    for (var i = 0;i < N_BULLETS;i++)
    {
      whiteBullets.fireAtSpeed(224,state.game.camera.y + state.game.height - (state.game.height / N_BULLETS) * i + leftOffset,0,SPEED);
      blackBullets.fireAtSpeed(576,state.game.camera.y + (state.game.height / N_BULLETS) * i + rightOffset,Math.PI,SPEED);
    }
    if (iteration % SHOOT_PERIOD == 0) largeBullets.fire(getX(),getY(),0,0,getAngleToPlayer());
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
  yield* speak("When you are dead and we descend down the vine,\nI promise to rape your wife first.");

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
        whiteBullets.fireAtSpeed(getX(),getY(),angle,10,gX,gY);
      }
      yield* wait(SMALL_GAP);
    }
    for (var i = 0;i < N_MESS;i++)
    {
      blackBullets.fire(getX(),getY(),Math.random() * MESS_GRAVITY - MESS_GRAVITY / 2,Math.random() * MESS_GRAVITY - MESS_GRAVITY / 2,Math.random() * Math.PI * 2);
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
      bullets.fireAtSpeed(getX(),getY(),Math.random() * Math.PI * 2,90);
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
  const RADIUS = 50;
  const SPACING = 15;
  const N_ROWS = 10;
  const N_BULLETS = 10;
  const N_MESS = 40;

  blackBullets.clear();
  whiteBullets.clear();

  yield* speak("You're going to regret doing this mate.");

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



/* end stuff and setting up stuff and that */
state.addEnemy(caller);
controller.addState(400,flyDescent);
controller.addState(200,haze);
controller.addState(0,infestation);
controller.addState(-200,stench);
controller.addState(-400,swarm);
controller.addState(-700,maggot);
yield;



yield* waitAnimation("dead");
state.removeEnemy(caller);
caller.properties.moveOnSpot = false;
caller.script = "ctx.state.buildTextbox('Stasbangora Kebabom','I drink the blood');ctx.win();yield;";
while (true) yield;
