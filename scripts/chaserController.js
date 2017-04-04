#include "wait.js"
#include "std.js"
#include "periodic.js"


var bullets = state.createBulletGroup(caller,100,30,'bugBullet','bugNoise');
var shooting = periodicSpray(bullets,3,0.9,500);


state.addEnemy(caller);
var totalTime = 0;
while (caller.health > 0)
{
  var elapsed = yield;
  totalTime += elapsed;
  caller.body.velocity.x = Math.cos(totalTime / caller.properties.xPeriod) * caller.properties.xSpeed;
  caller.body.velocity.y = Math.cos(totalTime / caller.properties.yPeriod) * caller.properties.ySpeed;
  shooting.next(elapsed);
}
sound.play("bugDeath");
state.removeEnemy(caller);
caller.body.velocity.set(0);
yield* waitAnimation("death");
while (true) yield;
