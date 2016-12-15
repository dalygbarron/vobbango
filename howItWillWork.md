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
