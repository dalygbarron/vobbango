var angle = 0;

var bullets = state.createBulletGroup(caller,100,40,'blood1','shot');
var otherBullets = state.createBulletGroup(caller,80,70,'blood2','drip');

var player = state.player;
var xOffset = caller.body.width / 2;

caller.animations.add("red",[8,9,8,9,10,9,10,11],4,false);



/** a periodic thing for firing a thick circle in the bullets group */
var thickCircle = new Periodic(90,function()
{
  bullets.fire
  (
    caller.body.x + xOffset,caller.body.y,player.body.x - caller.body.x,
    player.body.y - caller.body.y,Math.random() * Math.PI * 2 - Math.PI
  );
});

/** periodic for a thin circle in otherBullets */
var thinCircle = new Periodic(70,function()
{
  otherBullets.fire(caller.body.x + xOffset,caller.body.y,0,0,angle);
});



yield* speak("n","I am going to kill you");



/* just fires thinCircle */
caller.fighting = true;
while (caller.health > 50)
{
  var elapsed = yield(null);
  angle += elapsed / 110;
  thinCircle.update(elapsed);
}

//a little chat in between
caller.fighting = false;
music.fadeOut(1000,Channel.Music);//TODO: put this into std
yield* speak("n","Yeah ok, but check out...");
sound.play("charge");
yield* waitAnimation("red");
music.playSong("trogBattle",Channel.Music);
yield* speak("n","MELTING ATTACK!!");
caller.fighting = true;



//second loop with both at once
thinCircle.period *= 2;
while (caller.health > 0)
{
  var elapsed = yield(null);
  angle += elapsed / 150;

  caller.body.velocity.x = Math.sin(angle) * caller.properties.moveSpeed;
  caller.body.velocity.y = Math.cos(angle) * caller.properties.moveSpeed;

  thickCircle.update(elapsed);
  thinCircle.update(elapsed);
}

caller.fighting = false;
yield* speak("n","I am dead now");
sound.play("fiendDeath");
yield* waitAnimation("red");
