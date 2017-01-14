#include "std.js"


/* make constants */
const BIG_BULLETS = 40;
const SMALL_BULLETS = 49;
const RANGE = 300;
var distance = RANGE + 1;


/* make the two bullet groups */
var fastBullets = state.createBulletGroup(caller,60,SMALL_BULLETS,'cBulletSmall','shot');
var slowBullets = state.createBulletGroup(caller,14,BIG_BULLETS,'cBullet','shot');


/* the process */
while (distance > RANGE)
{
  distance = Math.sqrt(Math.pow(state.player.y - getY(),2) + Math.pow(state.player.x - getX(),2));
  yield;
}

for (var i = 0;i < BIG_BULLETS;i++)
{
  slowBullets.fire(getX(),getY(),0,0,(i * (Math.PI * 2) / BIG_BULLETS) - Math.PI);
}

for (var i = 0;i < SMALL_BULLETS;i++)
{
  fastBullets.fire(getX(),getY(),0,0,(i * (Math.PI * 2) / SMALL_BULLETS) - Math.PI);
}
