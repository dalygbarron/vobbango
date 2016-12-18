///<reference path="phaser/phaser.d.ts"/>

module Scumbag
{
  export function createActor(game:Phaser.Game,data:any):Actor
  {
    /* generic enemy */
    if (data.properties.hasOwnProperty("type"))
    {
      let enemyData = Enemies.getEnemyData(data.properties.type,game);
      let actor = new Actor(game,data.x,data.y,name,enemyData.key,enemyData.controller,enemyData.health);
      actor.properties = enemyData;
      //TODO: make the actual region properties overide the other ones
      return actor;
    }

    /* bespoke artisanal enemy */
    let actor = new Actor(game,data.x,data.y,name,data.properties.key,data.properties.controller,data.properties.health);
    actor.properties = data.properties;
    return actor;
  }


  /** a fighter that will jump about and all that in the battle system */
  export class Actor extends Phaser.Sprite
  {
    name:       string;
    updating:   boolean   = true;
    strafing:   boolean   = false;
    heart:      Phaser.Sprite;
    moveOnSpot: boolean;
    controller: Controller;
    script:     string;
    properties: any;

    /** like a sprite, but also with tile width and height */
    constructor
    (
      game:Phaser.Game,x:number,y:number,name:string,key:string,scriptName:string,
      health:number
    )
    {
      //run superconstructor
      super(game,x,y,key);

      //set it's parameters
      this.name = name;
      this.health = health;

      //turn on physics
      this.game.physics.arcade.enable(this);
      this.body.collideWorldBounds = true;
      this.body.immovable = true;

      //set it's dimensions
      this.body.width = this.width / 5 * 4;
      this.body.height = this.height / 12 * 5;
      this.body.offset.x = this.width / 10;
      this.body.offset.y = this.height / 12 * 7;

      //do animation type crap
      this.anchor.setTo(0.5);
      this.animations.add('front',[0,1,2,3],10,true);
      this.animations.add('back',[4,5,6,7],10,true);

      //create it's heart
      this.heart = new Phaser.Sprite(game,0,0,"heart");
      this.game.physics.arcade.enable(this.heart);
      this.heart.body.width = this.heart.width / 3;
      this.heart.body.height = this.heart.height / 3;
      this.heart.body.offset.x = this.heart.width / 6;
      this.heart.body.offset.y = this.heart.height / 6;

      this.heart.anchor.setTo(0.5);
      this.addChild(this.heart);
      this.heart.alpha = 0;

      //create it's controller
      this.controller = new Controller(game,scriptName,this);

      //add it to the scene
      game.add.existing(this);
    }


    /** overrides Phaser.Sprite.update() */
    update()
    {
      if (!(this.updating && this.alive))
      {
        if (!this.moveOnSpot) this.animations.stop();
        return;
      }

      //run the controller
      this.controller.run(this.game.time.elapsedMS);

      //show or hide heart
      if (this.strafing) this.heart.alpha = 1;
      else this.heart.alpha = 0;

      //set the animation right
      let angle = Math.atan2(this.body.velocity.y,this.body.velocity.x);
      if
      (
        this.body.velocity.x != 0 || this.body.velocity.y != 0 || this.moveOnSpot
      )
      {
        if (!this.strafing) this.angle = angle;
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
