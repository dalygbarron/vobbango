#include "std.js"
#include "theatre.js"
#include "wait.js"




/* definitions and that */
var legBullets = state.createBulletGroup(caller,130,300,'legBullet','drip');
var autismoBullets = state.createBulletGroup(caller,30,1000,'legBullet','drip');
var poisonBullets = state.createBulletGroup(caller,200,30,'poison','drip');
var mud = state.createBulletGroup(caller,30,500,'mud','drip');
const N_LEGS = 5;
const LEG_PERIOD = 100;
const LEG_LENGTH = 6;



/* attacks */
function* legs()
{
  var legList = [];
  for (var i = 0;i < N_LEGS;i++) legList.push(Math.random() * Math.PI * 2 - Math.PI);

  yield* wait(500);
  music.fadeOut(1000,Channel.Music);

  yield* speak("BWSEEEEEEEEEEEEEKKKKKKKAAAAAAA");
  music.playSong("firstBoss",Channel.Music);
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
  sound.play("centipede");

  var legList = [];
  for (var i = 0;i < N_LEGS;i++) legList.push(Math.random() * Math.PI * 2 - Math.PI);
  while (true)
  {
    for (var i = 0;i < LEG_LENGTH;i++)
    {
      for (leg in legList)
      {
        legBullets.fire(getX(),getY(),0,0,legList[leg]);
      }
      yield* wait(LEG_PERIOD);
    }
    poisonBullets.fire(getX(),getY(),0,0,getAngleToPlayer());
    legList.shift();
    legList.push(Math.random() * Math.PI * 2 - Math.PI);
  }

}


/*
function* poison()
{
  var legList = [];
  for (var i = 0;i < N_LEGS;i++) legList.push(Math.random() * Math.PI * 2 - Math.PI);
  while (true)
  {
    for (var i = 0;i < LEG_LENGTH;i++)
    {
      legBullets.fire(getX(),getY(),0,0,getAngleToPlayer() + Math.PI *0.1);
      legBullets.fire(getX(),getY(),0,0,getAngleToPlayer() - Math.PI *0.1);
      for (leg in legList) autismoBullets.fire(getX(),getY(),0,0,legList[leg]);
      yield* wait(LEG_PERIOD);
    }
	  legBullets.fire(getX(),getY(),0,0,getAngleToPlayer() + Math.PI *0.1);
	  legBullets.fire(getX(),getY(),0,0,getAngleToPlayer() - Math.PI *0.1);
    poisonBullets.fire(getX(),getY(),0,0,getAngleToPlayer());
    legList.shift();
    legList.push(Math.random() * Math.PI * 2 - Math.PI);
  }
}
*/

function* burrow()
{
  yield* wait(1000);
  yield* speak("BWSEEEEEEEEEEEEEEEEEEEEEEEEEEEKKKKKKKAAAAAAAAAAAAAAAAAAAA");
  while (true)
  {
    mud.fire(getX(),getY(),0,10,Math.random() * Math.PI * 2 - Math.PI);
    yield* wait(17);
  }
}


state.addEnemy(caller);
controller.addState(350,legs);
controller.addState(200,poison);
controller.addState(-100,burrow);
yield;



yield* waitAnimation("dead");
state.removeEnemy(caller);
caller.properties.moveOnSpot = false;
caller.script = "ctx.state.buildTextbox('Stasbangora Kebabom','I drink the blood','stasbangoraKebabom_n');yield;";
while (true) yield;
