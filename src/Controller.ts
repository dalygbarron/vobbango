namespace Scumbag
{
  const generatorConstructor = Object.getPrototypeOf(function*(){}).constructor;

  function storeActor(actor:Phaser.Sprite):void
  {
    if (!(actor instanceof Actor)) return;
    StateOfGame.parameters.actors.push({name:actor.name,x:actor.x,y:actor.y});
  }


  function storeActors(game:Phaser.Game):void
  {
    let state = game.state.getCurrentState();
    if (state instanceof Overworld)
    {
      StateOfGame.parameters.actors = [];
      state.actors.forEach(storeActor,null);
    }
  }

  /** main controller for actors that controls them on a frame to frame basis */
  export class Controller
  {
    script: Iterator<any>;
    states: Array<{minHealth:number,script:Iterator<any>}> = new Array<{minHealth:number,script:Iterator<any>}>();
    caller: any;
    game: Phaser.Game;

    /** builds the controller and lets it access the scnee */
    constructor(game:Phaser.Game,scriptName:string,caller:any)
    {
      let input = InputManager.getInputDevice(0);
      this.script = generatorConstructor
      (
        "state","caller","input","Axis","Button","sound","music","Channel",
        "StateOfGame","controller",game.cache.getText(scriptName)
      )
      (
        <Overworld>(game.state.getCurrentState()),caller,input,Axis,Button,game.sound,
        MusicManager,MusicChannel,StateOfGame,this
      );
      this.caller = caller;
      this.game = game;
    }


    /** runs the controller's script.
     * returns false normally, or true when the script is over */
    run(elapsed: number): boolean
    {
      if (this.states.length > 0)
      {
        var state = {minHealth:-99999999999999999,script:null};
        for (var i = 0;i < this.states.length;i++)
        {
          if (this.states[i].minHealth > state.minHealth &&
              this.states[i].minHealth <= this.caller.health)
          {
            state = this.states[i];
          }
        }

        if (state.script != null) return state.script.next(elapsed).done;
        else this.states = [];
      }

      return this.script.next(elapsed as undefined).done;
    }


    /** add's a state to the controller that is run when the caller is on a certain level
     * of health. If minHealth is an integer then it's a value, if 0 < it < 1, then it is
     * a portion */
    addState(minHealth:number,script:GeneratorFunction)
    {
      this.states.push({minHealth:minHealth,script:script()});
    }

    /** lets scripts change the current scene
     * may need to be replaced with like a set level function or something
     * also, I'll need a separate function to start battles, and then go back to
     * the overworld when they are done */
    changeState(newState:string,...args):void
    {
      this.game.state.start(newState,true,false,args);
    }


    transport(level:string,playerRegion:string)
    {
      this.game.state.start("Overworld",true,false,level,playerRegion);
    }


    toOverworld()
    {
      this.game.state.start("Overworld");
    }


     setSwitch(key:string,value:boolean):void
    {
      StateOfGame.parameters.switches[key] = value;
    }


     getSwitch(key:string):boolean
    {
      if (key in StateOfGame.parameters.switches) return StateOfGame.parameters.switches[key];
      else return false;
    }

     setVariable(key:string,value:number):void
    {
      StateOfGame.parameters.variables[key] = value;
    }

     getVarirable(key:number):number
    {
      if (key in StateOfGame.parameters.variables) return StateOfGame.parameters.variables[key];
      else return 0;
    }

     saveGame()
    {
      StateOfGame.parameters.lives = 3;
      storeActors(this.game);
      StateOfGame.save();
    }

     loadGame(slot:number)
    {
      StateOfGame.load(slot);
    }

     addCharacter(character:string)
    {
      StateOfGame.parameters.characters.push(character);
    }

     getCharacters() {return StateOfGame.parameters.characters}


     setPlayerKey(key:string)
    {
      let state = this.game.state.getCurrentState();
      if (state instanceof Overworld) state.player.setKey(key);
      StateOfGame.parameters.playerKey = key;
    }

     playSound(key:string) {this.game.sound.play(key)}

     playAmbience(key:string)
    {
      MusicManager.playSong(key,MusicChannel.Ambience);
    }

     playMusic(key:string)
    {
      MusicManager.playSong(key,MusicChannel.Music);
    }

     stopMusic() {MusicManager.stopSong(MusicChannel.Music)}

     setSlot(slot:number) {StateOfGame.parameters.slot = slot}

     getSlot() {return StateOfGame.parameters.slot}

     getScore() {return StateOfGame.parameters.score}

     win() {this.game.state.start("Credits")}
  }
};
