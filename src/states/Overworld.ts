///<reference path="GuiState.ts"/>


module Scumbag
{

  /** detects if it's time to run a script or yeah or nah or whatever and that */
  function touches(a:Actor,b:Actor):boolean
  {
    var aEnemy = this.enemies.indexOf(a);
    var bEnemy = this.enemies.indexOf(b);

    // This means they're both enemies.
    if (aEnemy >= 0 && bEnemy >= 0) return false;

    if (a == this.player)
    {
      if (bEnemy >= 0)
      {
        this.hurtPlayer();
        return false;
      }
      else
      {
        this.player.body.immovable = !b.collide;
        b.collision = Date.now();
        return b.collide;
      }
    }
    else if (b == this.player)
    {
      if (aEnemy >= 0)
      {
        this.hurtPlayer();
        return false;
      }
      else
      {
        this.player.body.immovable = !a.collide;
        a.collision = Date.now();
        return a.collide;
      }
    }
  }


  /** gets run when the player presses the pause button */
  function pause()
  {
    if (this.gui != null) return;
    this.controller = new Controller(this.game,"pause.js",null);
  }


  function addPlayerAtRegion(game:Phaser.Game,region:Region,key:string)
  {
    let playerData =
    {
      x:region.x,y:region.y,width:region.width,height:region.height,properties:{kind:"player"}
    }
    return createActor(game,"player",playerData);
  }


  /** the scene in which you walk around and most of the storyline takes
   * place */
  export class Overworld extends GuiState
  {
    background:       Background              = null;
    tilemap:          Phaser.Tilemap;
    collisionLayer:   Phaser.TilemapLayer;
    actors:           Phaser.Group;
    enemies:          Array<Actor>            = [];
    bullets:          Phaser.Group;
    regions:          {[name:string]:Region};
    player:           Actor;
    lives:            Phaser.TileSprite;
    overlay:          Phaser.TileSprite       = null;
    overlayDrift:     Util.Point;
    map:              string;
    playerRegion:     string;
    returning:        boolean;
    collideCooldown:  number = 0.0;
    hitCooldown:      number = 0.0;
    scroll:           Util.Point = {x:0,y:0};


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
      this.tilemap = new Phaser.Tilemap(this.game,this.map);

      //create the background
      if (this.tilemap.properties !== undefined)
      {
        if (this.tilemap.properties.hasOwnProperty("background"))
        {
          if (this.tilemap.properties.background != "")
          {
            this.background = new Background(this.tilemap.properties.background,this.game);
          }
          else this.background = null;
        }
        else this.background = null;
      }
      else this.background = null;

      //actually put the tilemap in
      this.tilemap.destroy();
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

      this.tilemap.createLayer("below");
      let bottomLayer = this.tilemap.createLayer("background");
      this.tilemap.createLayer("things");


      //create the regions
      this.regions = createRegions(this.tilemap.objects["regions"]);

      //add player and stuff
      if (this.playerRegion == null)
      {
        this.player = createActor(this.game,"player",{x:0,y:0,width:1,height:1,properties:{kind:"player"}});
        this.player.body.immovable = false;
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
        let actor = createActor(this.game,actors[i].name,actors[i]);
        this.actors.add(actor);
      }

      //load actors
      if (this.returning) this.restoreActors();

      //create objects
      this.tilemap.forEach
      (
        function(tile)
        {
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
                object.anchor.set(0.5,0);

                let animationSpeed = this.game.cache.getJSON("animations").animations[type][0].fps;
                object.animations.add("stand",null,Math.random() * animationSpeed,true);
                object.animations.play("stand");
                this.actors.add(object);
              }
            }
          }
        },
        this,0,0,this.tilemap.width,this.tilemap.height,"background"
      );

      //create the bullets group
      this.bullets = this.game.add.group();

      //create the enemies list
      this.enemies = [];

      //create the top layer of the world
      this.tilemap.createLayer("overhead");


      this.game.camera.focusOn(this.player);

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
        else MusicManager.stopSong(MusicChannel.Ambience);

        //create the overlay
        if (this.tilemap.properties.hasOwnProperty("overlay"))
        {
          let overlayData = this.tilemap.properties.overlay.split(",");
          this.overlayDrift = {x:overlayData[1],y:overlayData[2]};
          this.overlay = this.game.add.tileSprite(0,0,this.game.width,this.game.height,overlayData[0]);
          this.overlay.fixedToCamera = true;
          this.overlay.blendMode = PIXI.blendModes.MULTIPLY;
        }

        // create the scroll
        if (this.tilemap.properties.hasOwnProperty("scrollX")) this.scroll.x = this.tilemap.properties.scrollX;
        else this.scroll.x = 0;
        if (this.tilemap.properties.hasOwnProperty("scrollY")) this.scroll.y = this.tilemap.properties.scrollY;
        else this.scroll.y = 0;
      }

      // if there are no properties
      else
      {
        this.scroll = {x:0,y:0};
      }

      // Set how the camera will work.
      if (this.scroll.x == 0 && this.scroll.y == 0) this.game.camera.follow(this.player);
      else this.game.camera.roundPx = false;

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
        this.game.debug.body(actor);
        //this.game.debug.spriteBounds(actor);
      },this);


      this.game.debug.body(this.player.heart,"#ff00ff");

      this.bullets.forEach(function(bulletGroup)
      {
        bulletGroup.forEach(function(bullet)
        {
          this.game.debug.body(bullet);
        },this);
      },this);
      /**/
    }

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

      // move the camera
      let deltaTime = this.game.time.elapsedMS / 1000;
      this.camera.position.add(this.scroll.x * deltaTime,this.scroll.y * deltaTime);
      this.camera.setPosition(this.camera.position.x + this.scroll.x * deltaTime,
                              this.camera.position.y + this.scroll.y * deltaTime);

      //fix up the background image if there is one
      if (this.background != null) this.background.update();

      //drift the overlay
      if (this.overlay != null && this.overlay.tilePosition != null)
      {
        this.overlay.tilePosition.x += this.overlayDrift.x * this.game.time.elapsedMS;
        this.overlay.tilePosition.y += this.overlayDrift.y * this.game.time.elapsedMS;
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
          for (let e = 0;e < this.enemies.length;e++)
          {
            let enemy = this.enemies[e];
            if (enemy == child.master || enemy == this.player ||
                !Util.onScreen(enemy.x,enemy.y,this.game))
            {
              continue;
            }
            this.game.physics.arcade.overlap
            (
              this.enemies[e],child,null,function(actor,bullet)
              {
                actor.damage(1);
                bullet.kill();
              },this
            )
          }

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
             this.controller = new Controller(this.game,this.regions[i].script,this.regions[i]);
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
        console.log(StateOfGame.parameters.actors[i].name);
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


    addEffect(x:number,y:number,key:string,framerate:number):Phaser.Sprite
    {
      let effect = this.game.add.sprite(x,y,key);
      effect.anchor.setTo(0.5);
      effect.animations.add("animation",null,framerate);
      effect.animations.play("animation");
      effect.animations.currentAnim.killOnComplete = true;
      return effect;
    }


    setOverlay(key:string,drift:Util.Point,time:number=1000)
    {
      if (this.overlay != null) this.overlay.destroy();
      this.overlay = this.game.add.tileSprite(0,0,this.game.width,this.game.height,key);
      this.overlay.fixedToCamera = true;
      this.overlay.blendMode = PIXI.blendModes.MULTIPLY;
      this.overlayDrift = drift;
      this.overlay.alpha = 0;
      this.add.tween(this.overlay).to({alpha:1},time,Phaser.Easing.Default,true);
    }


    removeOverlay(time:number=1000)
    {
      if (this.overlay == null) return;
      let tween = this.add.tween(this.overlay).to({alpha:0},time,Phaser.Easing.Default,true);
      tween.onComplete.add(function(){this.overlay.destroy()},this);
    }

    /** Adds an actor to the list of enemies meaning that it can be shot and collided with,
     * and the level can not be exited */
    addEnemy(enemy:Actor)
    {
      this.enemies.push(enemy);
    }

    /** removes an enemy from the list of enemies */
    removeEnemy(enemy:Actor)
    {
      let enemyIndex = this.enemies.indexOf(enemy);
      if (enemyIndex < 0) return;
      this.enemies.splice(enemyIndex,1);
    }

    addActor(x:number,y:number,name:string,data:any):Actor
    {
      let actor = createActor(this.game,name,data);
      actor.x = x;
      actor.y = y;
      this.actors.add(actor);
      return actor;
    }

    addDrone(x:number,y:number,name:string,data:any):Actor
    {
      let actor = createActor(this.game,name,data);
      actor.x = x;
      actor.y = y;
      return actor;
    }
  }
};
