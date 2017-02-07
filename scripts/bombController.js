tt#include "std.js"
#include "wait.js"
#include "theatre.js"

/* make constants */
const BIG_BULLETS = 50;
const SMALL_BULLETS = 50;
const RANGE = 90;
const GRAVITY = 20;
var distance = RANGE + 1;


/* make the two bullet groups */
var fastBullets = state.createBulletGroup(caller,120,SMALL_BULLETS,'cBulletSmall','shot');
var slowBullets = state.createBulletGroup(caller,70,BIG_BULLETS,'cBullet','shot');

state.addEnemy(caller);

/* the process */
while (distance > RANGE)
{
  distance = Math.sqrt(Math.pow(state.player.y - getY(),2) + Math.pow(state.player.x - getX(),2));
  yield;
}

for (var i = 0;i < BIG_BULLETS;i++)
{
  slowBullets.fire(getX(),getY(),Math.random() * GRAVITY - GRAVITY / 2,Math.random() * GRAVITY - GRAVITY / 2,(i * (Math.PI * 2) / BIG_BULLETS) - Math.PI);
}

for (var i = 0;i < SMALL_BULLETS;i++)
{
  fastBullets.fire(getX(),getY(),Math.random() * GRAVITY - GRAVITY / 2,Math.random() * GRAVITY - GRAVITY / 2,(i * (Math.PI * 2) / SMALL_BULLETS) - Math.PI);
}

state.removeEnemy(caller);
