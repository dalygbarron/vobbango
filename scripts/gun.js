#ifndef GUN_H
#define GUN_H

#include "std.js"


function createGun(x,y,key,moveSpeed=100,name="e")
{
  var data = {"key":key,"directional":false,"moveOnSpot":true,"health":1,
              "moveSpeed":moveSpeed,"controller":"gunController.js"};
  var gun = state.addDrone(x,y,name,{"properties":data});
  gun.targets = [];
  return gun;
}


function addTarget(gun,x,y)
{
  gun.targets.push({x:x,y:y});
}


function* waitGuns(guns)
{
  yield* wait(50);
  while (true)
  {
    var clean = true;
    for (var i in guns)
    {
      var speed = guns[i].body.speed;
      if (speed > 1 || speed < -1)
      {
        clean = false;
      }
    }
    if (clean) return;
    yield;
  }
}


function clearGuns(guns)
{
  //TODO: add explosions and shit like that
  for (var i in guns) guns[i].kill();
  guns.length = 0;
}




#endif
