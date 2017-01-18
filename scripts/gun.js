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




#endif
