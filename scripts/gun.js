#ifndef GUN_H
#define GUN_H

#include "std.js"


function createGun(x,y,key,moveSpeed=100,name="e")
{
  var data = {"key":key,"directional":false,"moveOnSpot":true,"health":1,"controller":"staticController.js","moveSpeed":moveSpeed};
  var gun = state.addActor(x,y,name,{"properties":data});
  return gun;
}



function* moveGun(gun,x,y)
{
  while (true)
  {
    var angle = Math.atan2(y - gun.body.y,x - (gun.body.x + gun.body.width / 2));
    gun.body.velocity.x = Math.cos(angle) * gun.properties.moveSpeed;
    gun.body.velocity.y = Math.sin(angle) * gun.properties.moveSpeed;
    yield* wait(50);
    if (close((gun.body.x + gun.body.width / 2),x,gun.body.velocity.x) &&
        close(gun.body.y,y,gun.body.velocity.y)) return;
  }
}





#endif
