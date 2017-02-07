#ifndef PERIODIC_H
#define PERIODIC_H

#include "wait.js"
#include "std.js"

function* periodicSpray(bulletGroup,nBullets,spread,period,delay=0)
{
  while(true)
  {
    for (var i = 0;i < nBullets;i++)
    {
      bulletGroup.fire(getX(),getY(),0,0,getAngleToPlayer() + (i + 0.5) * spread / nBullets - spread / 2);
      yield* wait(delay);
    }
    yield* wait(period);
  }
}


function* periodicWave(bulletGroup,nBullets,damp,maxSpeed,spread,period)
{
  //var middle = nBullets / 2;
  while(true)
  {
    for (var i = 0;i < nBullets;i++)
    {
      var speed = (Math.sin((i + 0.5) / nBullets * Math.PI) * (1 - damp) + damp) * maxSpeed;
      bulletGroup.fireAtSpeed(getX(),getY(),getAngleToPlayer() + (i + 0.5) * spread / nBullets - spread / 2,speed);
    }
    yield* wait(period);
  }
}


#endif
