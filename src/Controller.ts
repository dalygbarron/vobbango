namespace Scumbag
{
  const generatorConstructor = Object.getPrototypeOf(function*(){}).constructor;

  /** main controller for actors that controls them on a frame to frame basis */
  export class Controller
  {
    script: Iterator<any>;
    states: Array<{minHealth:number,script:Iterator<any>}> = new Array<{minHealth:number,script:Iterator<any>}>();
    caller: Actor;
    game: Phaser.Game;

    /** builds the controller and lets it access the scnee */
    constructor(game:Phaser.Game,scriptName:string,caller:Actor)
    {
      let input = InputManager.getInputDevice(0);
      this.script = generatorConstructor
      (
        "state","caller","input","Axis","Button","Mode","sound","music","Channel","ctx","controller",
        game.cache.getText(scriptName)
      )
      (
        <Overworld>(game.state.getCurrentState()),caller,input,Axis,Button,Mode,game.sound,
        MusicManager,MusicChannel,ScriptContext,this
      );
      this.caller = caller;
      this.game = game;
    }


    /** runs the controller's script.
     * returns false normally, or true when the script is over */
    run(elapsed:number):boolean
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

      return this.script.next(elapsed).done;
    }


    /** add's a state to the controller that is run when the caller is on a certain level
     * of health. If minHealth is an integer then it's a value, if 0 < it < 1, then it is
     * a portion */
    addState(minHealth:number,script:GeneratorFunction)
    {
      this.states.push({minHealth:minHealth,script:script()});
    }
  }
};
