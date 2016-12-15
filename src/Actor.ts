///<reference path="phaser/phaser.d.ts"/>

module Scumbag
{
  /** a fighter that will jump about and all that in the battle system */
  export class Actor extends Phaser.Sprite
  {
    name:       string;
    updating:   boolean       = true;
    moveOnSpot: boolean;
    controller: Controller;

    /** like a sprite, but also with tile width and height */
    constructor
    (
      game:Phaser.Game,x:number,y:number,name:string,key:string,scriptName:string
    )
    {
      //run superconstructor
      super(game,x,y,key);

      //set it's parameters
      this.name = name;

      //turn on physics
      this.game.physics.arcade.enable(this);
      this.body.collideWorldBounds = true;

      //set it's dimensions
      this.body.width = this.width / 5 * 4;
      this.body.height = this.height / 12 * 5;
      this.body.offset.x = this.width / 10;
      this.body.offset.y = this.height / 12 * 7;

      //do animation type crap
      this.anchor.setTo(0.5,1);
      this.animations.add('front',[0,1,2,3],10,true);
      this.animations.add('back',[4,5,6,7],10,true);

      //create it's controller
      this.controller = new Controller(game,scriptName,this);

      //add it to the scene
      game.add.existing(this);
    }


    /** overrides Phaser.Sprite.update() */
    update()
    {

      if (!this.updating)
      {
        if (!this.moveOnSpot) this.animations.stop();
        return;
      }

      //run the controller
      this.controller.run(this.game.time.elapsedMS);

      //set the animation right
      let angle = Math.atan2(this.body.velocity.y,this.body.velocity.x);
      if
      (
        this.body.velocity.x != 0 || this.body.velocity.y != 0 || this.moveOnSpot
      )
      {
        if (angle < 0) this.animations.play("back");
        else this.animations.play("front");
        if (Math.abs(angle) < Math.PI / 2) this.scale.x = 1;
        else if (Math.abs(angle) > Math.PI / 2) this.scale.x = -1;
      }
      else this.animations.stop();

    }

    /** sets the actor's string on the current page */
    setKey(key:string)
    {
      if (key == "") this.alpha = 0;
      else this.loadTexture(key);
    }
  }
};
