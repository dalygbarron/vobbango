ok so both enemies and non enemies shall be contained within actors.
Actors will always have a javascript running in them which controls how they move and
stuff, and that is that whole script thing which I've already written about. This will
allow a massive amount of functionality if I add a stdlib to each one. We just have to be
sure that it runs well.

If the actor has a collision script, then that script will be run when they collide with
the player.

The actor can also have a property that makes it so colliding with them kills the player.
While the collisions with the level will make use of the normal bounding box, colliding
with bullets and the level will require a different system, since they aim at the middle
of the player. Possibly I could just add a second object on top of the player. That is
also good because it will make hiding and showing it easy as you go between strafe mode
and normal mode



ok to deal with controlling bullets after the fact, we can create a bullet pool construct
which is important anyway for memory usage. And yeah so you just create these pools and
add whatever to them, but they can then have shit done to them.
Maybe get rid of everything in the normal bullet update function though to save time.
that ruins tracking though :/ who cares, no bullet hell uses that
ok so the overworld will have a function called add bulletgroup which returns a bullet
group object, and it has a function letting you add bullets, with priority mode too.
and also a mode letting you get an array of the active bullets, or maybe something that
lets you run a function on all of them.
Oh yeah, all bullets in a group will look the same and have basically the same properties,
so for other stuff make another group.
