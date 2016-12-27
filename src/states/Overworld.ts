///<reference path="GuiState.ts"/>


module Scumbag
{

  /** detects if it's time to run a script or yeah or nah or whatever and that */
  function touches(a:Actor,b:Actor)
  {
    if (a == this.player)
    {
      if (b.fighting)
      {
        this.hurtPlayer();
      }
      else if (b.script != "" && this.collideCooldown <= 0)
      {
        this.player.body.immovable = false;
        this.collideCooldown = 1.0;
        Script.setScript(b.script,b);
      }
    }
    else if (b == this.player)
    {
      if (a.fighting)
      {
        this.hurtPlayer();
      }
      else if (a.script != "" && this.collideCooldown <= 0)
      {
        this.player.body.immovable = false;
        this.collideCooldown = 1.0;
        Script.setScript(a.script,a);
      }
    }
    return true;
  }


  /** gets run when the player presses the pause button */
  function pause()
  {
    if (this.gui != null) return;
    Script.setScript(this.game.cache.getText("saveScript"));
  }


  function addPlayerAtRegion(game:Phaser.Game,region:Region,key:string)
  {
    let playerData =
    {
      x:region.x + region.width / 2,y:region.y + region.height / 2,properties:{type:"player"}
    }
    return createActor(game,playerData);
  }


  /** the scene in which you walk around and most of the storyline takes
   * place */
  export class Overworld extends GuiState
  {
    background:       Background    = null;
    tilemap:          Phaser.Tilemap;
    collisionLayer:   Phaser.TilemapLayer;
    actors:           Phaser.Group;
    bullets:          Phaser.Group;
    regions:          {[name:string]:Region};
    player:           Actor;
    lives:            Phaser.TileSprite;
    overlay:          Phaser.TileSprite   = null;
    overlayDriftX:    number;
    overlayDriftY:    number;
    map:              string;
    playerRegion:     string;
    returning:        boolean;
    collideCooldown:  number = 0.0;
    hitCooldown:      number = 0.0;


    /** overrides Phaser.State.init() */
    init(map:string = null,playerRegion:string)
    {
      this.playerRegion = playerRegion;
      if (map == null)
      {
        this.map = StateOfGame.parameters.map;
        this.returning = true;
      }
      else
      {
        this.map = map;
        this.returning = false;
      }
    }

    /** overrides Phaser.State.preload() */
    preload()
    {
      if (!this.game.cache.checkTilemapKey(this.map))
      {
        this.game.load.tilemap(this.map,"maps/"+this.map+".json",null,Phaser.Tilemap.TILED_JSON);
      }
    }


    /** This is where the level is actually implemented after all the data is
     * definitely loaded */
    create()
    {
      super.create();

      //save the map name
      StateOfGame.parameters.map = this.map;

      //turn on phyysics
      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      //create the tilemap
      this.tilemap = this.add.tilemap(this.map);

      for (let i in this.tilemap.tilesets)
      {
        this.tilemap.addTilesetImage(this.tilemap.tilesets[i].name,
                                     this.tilemap.tilesets[i].name);
      }
      this.collisionLayer = this.tilemap.createLayer("collisions");
      this.tilemap.setLayer(this.collisionLayer);
      this.tilemap.setCollisionBetween(0,6569);
      this.collisionLayer.resizeWorld();
      this.collisionLayer.visible = false;

      let bottomLayer = this.tilemap.createLayer("background");
      this.tilemap.createLayer("things");

      //create the regions
      this.regions = createRegions(this.tilemap.objects["regions"]);

      //add player and stuff
      if (this.playerRegion == null)
      {
        //this.player = new Actor(this.game,0,0,"player",StateOfGame.parameters.playerKey,"playerController");
        //this.player.body.immovable = false;
      }
      else
      {
        this.player = addPlayerAtRegion(this.game,this.regions[this.playerRegion],
                                        StateOfGame.parameters.playerKey);
      }
      this.actors = this.game.add.group();
      this.actors.add(this.player);

      //create the actors
      let actors = this.tilemap.objects["actors"];
      for (let i in actors)
      {
        let x = actors[i].x + actors[i].width / 2;
        let y = actors[i].y + this.tilemap.tileHeight - actors[i].height / 2;
        let name = actors[i].name;

        let actor = createActor(this.game,actors[i]);

        this.actors.add(actor);
      }

      //load actors
      if (this.returning)
      {
        this.restoreActors();
      }

      //create objects
      this.tilemap.forEach
      (
        function(tile)
        {
          tile.blendeMode = PIXI.blendModes.MULTIPLY;
          if (tile.hasOwnProperty("properties"))
          {
            if (tile.properties.hasOwnProperty("spawn"))
            {
              var data = tile.properties.spawn.split("-");
              var type = data[0];
              var chance = parseFloat(data[1]);
              if (Math.random() < chance)
              {
                let object = new Phaser.Sprite
                (
                  this.game,tile.x * tile.width + Math.random() * tile.width,
                  (tile.y * tile.height - this.player.height) + Math.random() * tile.height,
                  type
                );
                let verticalAnchor = 1 - (object.height - this.player.height) / object.height;
                object.anchor.set(0.5,verticalAnchor);
                object.animations.add("stand",[0,1,2],3 - Math.random() * 3,true);
                object.animations.play("stand");
                this.actors.add(object);
              }
            }
          }
        },
        this,0,0,this.tilemap.width,this.tilemap.height,0
      );

      //create the bullets group
      this.bullets = this.game.add.group();

      //create the top layer of the world
      this.tilemap.createLayer("overhead");


      this.game.camera.follow(this.player);
      this.game.camera.focusOnXY(this.player.position.x,this.player.position.y);

      //if there ain't no things then don't go there
      if (this.tilemap.properties != null)
      {
        //load music if there is some
        if (this.tilemap.properties.hasOwnProperty("music"))
        {
          if (this.tilemap.properties.music == "none") MusicManager.stopSong(MusicChannel.Music);
          else MusicManager.playSong(this.tilemap.properties.music,MusicChannel.Music);
        }

        if (this.tilemap.properties.hasOwnProperty("ambience"))
        {
          if (this.tilemap.properties.ambience == "none") MusicManager.stopSong(MusicChannel.Ambience);
          else MusicManager.playSong(this.tilemap.properties.ambience,MusicChannel.Ambience);
        }
        else
        {
          MusicManager.stopSong(MusicChannel.Ambience);
        }

        //create the background
        if (this.tilemap.properties.hasOwnProperty("background"))
        {
          if (this.tilemap.properties.background != "")
          {
            this.background = new Background(this.tilemap.properties.background,
                                             this.tilemap.width * this.tilemap.tileWidth,
                                             this.tilemap.height * this.tilemap.tileHeight,
                                             this.game);
            this.background.update(this.camera.x,this.camera.y);

          }
        }

        //create the overlay
        if (this.tilemap.properties.hasOwnProperty("overlay"))
        {
          let overlayData = this.tilemap.properties.overlay.split(",");
          this.overlayDriftX = overlayData[1];
          this.overlayDriftY = overlayData[2];
          this.overlay = this.game.add.tileSprite(0,0,this.game.width,this.game.height,overlayData[0]);
          this.overlay.fixedToCamera = true;
          this.overlay.blendMode = PIXI.blendModes.MULTIPLY;
        }
      }

      //create the lives display
      this.lives = this.game.add.tileSprite(0,0,60,20,"life");
      this.lives.fixedToCamera = true;

      //add button press callbacks
      let device = InputManager.getInputDevice(0);
      device.addOnButtonPress(Button.Pause,pause,this);

      //start a play time counter
      StateOfGame.startTimer();
    }


    /** overrides Phaser.State.render() */
    render()
    {

      /*
      this.actors.forEach(function(actor)
      {
        this.game.debug.body(actor,"#FF0000AA");
        this.game.debug.spriteBounds(actor);
      },this);

      this.game.debug.body(this.player.heart,"#FF0000AA");


      this.bullets.forEach(function(bulletGroup)
      {
        bulletGroup.forEach(function(bullet)
        {
          this.game.debug.body(bullet);
        },this);
      },this);

    */}

    shutdown()
    {
      let device = InputManager.getInputDevice(0);
      device.clear();
    }


    /** overrides GuiState.postGuiUpdate() */
    postGuiUpdate()
    {
      //make it look right
      this.actors.sort('y', Phaser.Group.SORT_ASCENDING);

      //fix up the background image if there is one
      if (this.background != null)
      {
        this.background.update(this.camera.x,this.camera.y);
      }

      //drift the overlay
      if (this.overlay != null && this.overlay.tilePosition != null)
      {
        this.overlay.tilePosition.x += this.overlayDriftX * this.game.time.elapsedMS;
        this.overlay.tilePosition.y += this.overlayDriftY * this.game.time.elapsedMS;
      }

      //update the invulnerability thing
      if (this.hitCooldown > 0)
      {
        this.hitCooldown -= this.game.time.elapsedMS;
        if (this.hitCooldown <= 0) this.player.blendMode = PIXI.blendModes.NORMAL;
      }

      //check collisions between bullets and stuff
      for (let child of this.bullets.children)
      {
        if (child instanceof BulletGroup)
        {
          //bullets and the level
          this.game.physics.arcade.collide
          (
            child,this.collisionLayer,function(bullet:Bullet){bullet.kill()}
          );

          //bullets and enemies
          this.game.physics.arcade.overlap
          (
            child,this.actors,
            function(bullet,actor)
            {
              if (actor == (<BulletGroup>child).master ||
                            actor == this.player)
              {
                return false;
              }

              actor.damage(1);
              bullet.kill();
            },
            null,
            this
          );


          //bullets and the player's heart
          if ((<BulletGroup>child).master != this.player)
          {
            this.game.physics.arcade.overlap
            (
              child,this.player.heart,
              function(a,b)
              {
                if (a instanceof Bullet) a.kill();
                if (b instanceof Bullet) b.kill();
                this.hurtPlayer();
              },
              null,
              this
            );
          }
        }
      }

      //keep the lives bar right
      this.lives.width = 20 * StateOfGame.parameters.lives;

      //check collisions between the characetrsand the level
      this.game.physics.arcade.collide(this.actors,this.collisionLayer);

      //check collisions between the actors and each other
      this.collideCooldown -= this.game.time.elapsedMS / 1000;
      this.game.physics.arcade.collide(this.actors,this.actors,touches,null,this);

       //check if the player is in a region with a script
       for (let i in this.regions)
       {
         if (this.regions[i].script != null)
         {
           if (this.player.x > this.regions[i].x &&
               this.player.x < this.regions[i].x + this.regions[i].width &&
               this.player.y > this.regions[i].y &&
               this.player.y < this.regions[i].y + this.regions[i].height)
           {
             Script.setScript(this.regions[i].script);
           }
         }
       }
    }


    /** overrides GuiState.onGuiStart() */
    onGuiStart()
    {
      this.player.updating = false;
      this.actors.setAll('updating',false);

      this.bullets.forEach(function(group)
      {
        group.forEach(function(bullet)
        {
          bullet.savedGX = bullet.body.gravity.x;
          bullet.savedGY = bullet.body.gravity.y;
          bullet.savedVX = bullet.body.velocity.x;
          bullet.savedVY = bullet.body.velocity.y;
          bullet.body.velocity.set(0);
          bullet.body.gravity.set(0);
        },this);
      },this);
    }


    /** overrides GuiState.onGuiEnd() */
    onGuiEnd()
    {
      this.player.updating = true;
      this.actors.setAll('updating',true);
      this.bullets.forEach(function(group)
      {
        group.forEach(function(bullet)
        {
          bullet.body.gravity.x = bullet.savedGX;
          bullet.body.gravity.y = bullet.savedGY;
          bullet.body.velocity.x = bullet.savedVX;
          bullet.body.velocity.y = bullet.savedVY;
        },this);
      },this);
    }


    /** gives you an actor by their name, or returns null if no actor has that
     * name */
    getActorByName(name:string):Actor
    {
      for (let i = 0;i < this.actors.length;i++)
      {
        if ((<Actor>this.actors.getAt(i)).name == name)
        {
          return <Actor>this.actors.getAt(i);
        }
      }
      return null;
    }


    restoreActors():void
    {
      for (let i = 0;i < StateOfGame.parameters.actors.length;i++)
      {
        let dude = this.getActorByName(StateOfGame.parameters.actors[i].name);
        dude.x = StateOfGame.parameters.actors[i].x;
        dude.y = StateOfGame.parameters.actors[i].y;
      }
    }

    /** does the stuff that happens when the plauer is hurt */
    hurtPlayer()
    {
      if (this.hitCooldown > 0) return;
      this.game.sound.play("die");
      this.hitCooldown = 1500;
      this.player.blendMode = PIXI.blendModes.MULTIPLY;
      StateOfGame.parameters.lives -= 1;
      if (StateOfGame.parameters.lives <= 0) this.game.state.start("Gameover");
    }


    createBulletGroup(master:Actor,speed:number,size:number,key:string,sound:string):BulletGroup
    {
      return new BulletGroup(this.game,this.bullets,master,speed,size,key,sound);
    }


    addEffect(x:number,y:number,key:string,nFrames:number,framerate:number):Phaser.Sprite
    {
      let effect = this.game.add.sprite(x,y,key);
      effect.anchor.setTo(0.5);
      let frames = [];
      for (let i = 0;i < nFrames;i++) frames.push(i);
      effect.animations.add("animation",frames,framerate);
      effect.animations.play("animation");
      effect.animations.currentAnim.killOnComplete = true;
      return effect;
    }


    setOverlay(key:string,driftX:number,driftY:number,time:number=1000)
    {
      if (this.overlay != null) this.overlay.destroy();
      this.overlay = this.game.add.tileSprite(0,0,this.game.width,this.game.height,key);
      this.overlay.fixedToCamera = true;
      this.overlay.blendMode = PIXI.blendModes.MULTIPLY;
      this.overlayDriftX = driftX;
      this.overlayDriftY = driftY;
      this.overlay.alpha = 0;
      this.add.tween(this.overlay).to({alpha:1},time,Phaser.Easing.Default,true);
    }


    removeOverlay(time:number=1000)
    {
      if (this.overlay == null) return;
      let tween = this.add.tween(this.overlay).to({alpha:0},time,Phaser.Easing.Default,true);
      tween.onComplete.add(function(){this.overlay.destroy()},this);
    }
  }
};
