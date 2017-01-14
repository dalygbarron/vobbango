#include "std.js"




/* definitions and that */
var legBullets = state.createBulletGroup(caller,100,300,'legBullet','drip');
var poisonBullets = state.createBulletGroup(caller,150,30,'poison','drip');
var mud = state.createBulletGroup(caller,30,400,'mud','drip');
caller.animations.add("dead",[5,6,7,8,9,10,11,12,13],7,false);
caller.animations.play("front");
const N_LEGS = 5;
const LEG_PERIOD = 100;
const LEG_LENGTH = 6;



/* attacks */
function* legs()
{
  var legList = [];
  for (var i = 0;i < N_LEGS;i++) legList.push(Math.random() * Math.PI * 2 - Math.PI);

  yield* speak("n","BWSEEEEEEEEEEEEEKKKKKKKAAAAAAA");
  while (true)
  {
    legList.shift();
    legList.push(getAngleToPlayer());

    for (var i = 0;i < LEG_LENGTH;i++)
    {
      for (leg in legList)
      {
        legBullets.fire(getX(),getY(),0,0,legList[leg]);
      }
      yield* wait(LEG_PERIOD);
    }
  }
}


function* poison()
{
  poisonBullets.fire(getX(),getY(),0,0,Math.random() * Math.PI * 2 - Math.PI);
  yield* wait(20);
}


function* burrow()
{
  yield* speak("n","BWSEEEEEEEEEEEEEEEEEEEEEEEEEEEKKKKKKKAAAAAAAAAAAAAAAAAAAA");
  while (true)
  {
    mud.fire(getX(),getY(),0,0,Math.random() * Math.PI * 2 - Math.PI);
    yield* wait(20);
  }
}


controller.addState(350,legs);
controller.addState(200,poison);
controller.addState(0,poison);




/* logic starts hereW */

while (caller.health > 350) yield* legs();
while (caller.health > 200) yield* poison();

while (caller.health > 0) yield* burrow();
yield* waitAnimation("dead");
caller.dead = true
caller.properties.moveOnSpot = false;
while (true) yield;
