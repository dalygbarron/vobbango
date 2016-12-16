namespace Scumbag
{
  const generatorConstructor = Object.getPrototypeOf(function*(){}).constructor;

  /** main controller for actors that controls them on a frame to frame basis */
  export class Controller
  {
    script: Iterator<any>;

    /** builds the controller and lets it access the scnee */
    constructor(game:Phaser.Game,scriptName:string,caller:Actor)
    {
      console.log(scriptName);

      let input = InputManager.getInputDevice(0);
      this.script = generatorConstructor
      (
        "state","caller","input","Axis","Button",game.cache.getText("stdScript")+
                                                 game.cache.getText(scriptName)
      )(<Overworld>game.state.getCurrentState(),caller,input,Axis,Button);
    }


    run(elapsed:number)
    {
      this.script.next(elapsed);
    }
  }
};
