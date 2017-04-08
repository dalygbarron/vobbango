#include "std.js"
#include "theatre.js"
#include "wait.js"




/* definitions and that */
var whiteBullets = state.createBulletGroup(caller,250,300,'otherFlyBullet','drip');
var blackBullets = state.createBulletGroup(caller,150,300,'flyBullet','drip');
var largeBullets = state.createBulletGroup(caller,70,5,"maggotBall");



/* attacks */
function* flyDescent()
{
  const RADIUS = 400;
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
  const RADIUS = 140;
  const N_BULLETS = 10;
  const GAP = 666;

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



/* end stuff and setting up stuff and that */
state.addEnemy(caller);
//controller.addState(400,flyDescent);
//controller.addState(200,haze);
controller.addState(0,infestation);
yield;



yield* waitAnimation("dead");
state.removeEnemy(caller);
caller.properties.moveOnSpot = false;
caller.script = "ctx.state.buildTextbox('Stasbangora Kebabom','I drink the blood','stasbangoraKebabom_n');yield;";
while (true) yield;
