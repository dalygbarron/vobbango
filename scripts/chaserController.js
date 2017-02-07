#include "wait.js"
#include "std.js"
#include "periodic.js"


var bullets = state.createBulletGroup(caller,140,30,'bugBullet','bugNoise');
var shooting = periodicSpray(bullets,3,0.5,500);
caller.animations.add("death",[8,9,10,11],4,false);
caller.animations.play("front");


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
caller.body.velocity.set(0);
yield* waitAnimation("death");
state.removeEnemy(caller);
while (true) yield;
