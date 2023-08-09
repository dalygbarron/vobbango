#include "std.js"
#include "theatre.js"
#include "wait.js"

var legBullets = state.createBulletGroup(caller, 130, 300, 'legBullet', 'drip');
var autismoBullets = state.createBulletGroup(caller, 30, 1000, 'legBullet', 'drip');
var poisonBullets = state.createBulletGroup(caller, 200, 30, 'poison', 'drip');
var mud = state.createBulletGroup(caller, 30, 500, 'mud', 'drip');
const N_LEGS = 5;
const LEG_PERIOD = 100;
const LEG_LENGTH = 6;

function* legs() {
  caller.health = 150;
  var legList = [];
  for (var i = 0;i < N_LEGS;i++) legList.push(Math.random() * Math.PI * 2 - Math.PI);
  yield* wait(500);
  music.fadeOut(1000, Channel.Music);
  yield* speak("BWSEEEEEEEEEEEEEKKKKKKKAAAAAAA");
  music.playSong("firstBoss",Channel.Music);
  while (caller.health >= 0) {
    legList.shift();
    legList.push(getAngleToPlayer());
    for (var i = 0;i < LEG_LENGTH;i++) {
      for (leg of legList) {
        legBullets.fire(getX(), getY(), 0, 0, leg);
      }
      yield* wait(LEG_PERIOD);
    }
  }
}

function* poison() {
  caller.health = 100;
  sound.play("centipede");
  var legList = [];
  for (var i = 0;i < N_LEGS;i++) legList.push(Math.random() * Math.PI * 2 - Math.PI);
  while (caller.health >= 0) {
    for (var i = 0;i < LEG_LENGTH;i++) {
      for (leg in legList) {
        legBullets.fire(getX(), getY(), 0, 0, legList[leg]);
      }
      yield* wait(LEG_PERIOD);
    }
    poisonBullets.fire(getX(), getY(), 0, 0, getAngleToPlayer());
    legList.shift();
    legList.push(Math.random() * Math.PI * 2 - Math.PI);
  }
}

function* special() {
  caller.health = 150;
  sound.play("centipede");
  let target = 0;
  while (caller.health >= 0) {
    for (let i = 0; i < 3; i++) {
      legBullets.fire(getX(), getY(), 0, 0, target * 0.2 + Math.sin(target) + i);
    }
    target += 0.15;
    yield* wait(0.25);
  }
}

function* burrow() {
  yield* wait(1000);
  caller.health = 200;
  yield* speak("BWSEEEEEEEEEEEEEEEEEEEEEEEEEEEKKKKKKKAAAAAAAAAAAAAAAAAAAA");
  while (caller.health >= 0) {
    mud.fire(getX(), getY(), 0, 10, Math.random() * Math.PI * 2 - Math.PI);
    yield* wait(17);
  }
}

state.addEnemy(caller);
yield* legs();
yield* poison();
if (StateOfGame.parameters.lives > 2) yield* special();
yield* burrow();
sound.play("wormDeath");
yield* waitAnimation("death");
state.removeEnemy(caller);
caller.properties.moveOnSpot = false;
yield* awaitCollision();
yield* say("Stasbangora Kebabom","gamom submem sudarsom");
controller.transport("toVine","start");