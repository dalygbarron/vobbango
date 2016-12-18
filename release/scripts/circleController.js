var angle = 0;

var bullets = state.createBulletGroup(caller,100,40,'blood1',null);
var otherBullets = state.createBulletGroup(caller,80,70,'blood2','shot');

var player = state.player;
var xOffset = caller.body.width / 2;

/** a periodic thing for firing a thick circle in the bullets group */
var thickCircle = new Periodic(90,function()
{
  bullets.fire
  (
    caller.body.x + xOffset,caller.body.y,player.body.x - caller.body.x,
    player.body.y - caller.body.y,angle
  );
});

/** periodic for a thin circle in otherBullets */
var thinCircle = new Periodic(70,function()
{
  otherBullets.fire(caller.body.x + xOffset,caller.body.y,0,0,angle);
});





/* just fires thinCircle */
while (caller.health > 50)
{
  var elapsed = yield(null);
  angle += elapsed / 100;
  thinCircle.update(elapsed);
}


thinCircle.period *= 2;


/* first loop fires thin circle and thick circle */
while (true)
{
  var elapsed = yield(null);
  angle += elapsed / 150;

  caller.body.velocity.x = Math.sin(angle) * caller.properties.moveSpeed;
  caller.body.velocity.y = Math.cos(angle) * caller.properties.moveSpeed;

  thickCircle.update(elapsed);
  thinCircle.update(elapsed);
}
