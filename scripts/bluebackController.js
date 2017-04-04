#include "std.js"
#include "wait.js"


const SPREAD = Math.PI * 2 * Math.random();
const N_BULLETS = 8;


/* set up */
var slowBullets = state.createBulletGroup(caller,180,1,"blueBullet");
var bullets = state.createBulletGroup(caller,100,8,"poison");
state.addEnemy(caller);


/* wait for death */
while (caller.health > 0) yield;



/* un set up */
slowBullets.fire(getX(),getY(),0,0,getAngleToPlayer());
for (var i = 0;i < N_BULLETS;i++) bullets.fire(getX(),getY(),0,0,getAngleToPlayer() + SPREAD / N_BULLETS * (i + 0.5) - SPREAD / 2);


state.removeEnemy(caller);
sound.play("bugDeath");
yield* waitAnimation("death");
caller.properties.moveOnSpot = false;
while (true) yield;
