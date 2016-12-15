For this release
===============
- the credits never end if you minimise them or press gamepad buttons during
  them

- add an animation player type thing to display little animations centred on a certain
  point on the screen.

- add a thing to have other animations for actors that they can display

- add a thing to chuck a comprihensible error message when you put in a
  nonexistent region

- make a more advanced background system that can do cool freaky stuff. probably
  use json to describe the backgrounds so they can get parsed easy and that. and make it
  that they can get faded in and stuff.

- either make it that there is a second background in front of the bottom tile layer, or
  that the bottom layer can fade out or dissapear or something

- make a gui thing that waits for a sound to play all the way through.

- make it that enemies are controlled by external scripts, and make them yield instead of
  returning as it will be heaps good and remove the need for a lot of trash. hypothetically
  if you wanted the character to do something and then wait one second and then do it again,
  there should be a method called wait which you do the yield* thing with, and it keeps
  yielding until that time is up. Yeah and there can be some other ones too to like play a
  sound or make the actor do an animation, or do one of those effect thingies. Maybe have
  one to wait until they have moved somewhere, but that might be dodgy.
  yeah so it all revolves around this wait method. Either that, or they just yield a
  number, and that number is how long their are to wait for. Actually, yeah I like that.
  I'll also try to make scripts configurable by making it that you can set any random
  property on a given enemy type, which will do nothing if not needed, and otherwise the
  script can look for it.
  If I want to make bullets do really freaky stuff, I could catch them in a variable
  belonging to their master and control them from there.


- base all my time based things on milliseconds so I don't have to do division
