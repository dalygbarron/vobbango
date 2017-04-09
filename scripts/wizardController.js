#include "wait.js"
#include "std.js"
#include "theatre.js"


const PERIOD = 1500;
const VARIANCE = 10;
const N_BULLETS = 15;


// Setting up some things.
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


// Process.
var oldCameraPos = state.game.camera.position.clone();
while (true)
{
  // Make it scroll and that.
  var elapsed = yield;
  var elapsedSeconds = elapsed / 1000;
  var cameraPos = state.game.camera.position.clone();

  if (cameraPos.y == 0) break;

  caller.body.velocity.x = (cameraPos.x - oldCameraPos.x) / elapsedSeconds;
  caller.body.velocity.y = (cameraPos.y - oldCameraPos.y) / elapsedSeconds;

  shootingInstance.next(elapsed);


  oldCameraPos = cameraPos;
}


// Some finishing stuff.
bullets.clear();
otherBullets.clear();
StateOfGame.parameters.lives = 3;
yield* speak("They put the wire into my head");
sound.play("die");
state.addEffect(getX(),getY(),"splat",10);
state.removeEnemy(caller);
