while(true)
{
  state.buildPause("Paused","Return","Quit");
  yield;

  //return
  if (state.guiValue == 1) return;

  //quit
  else if (state.guiValue == 2)
  {
    state.buildQA("are you sure you want to quit?",
                  null,
                  "Absolutely Not",
                  "Ooooooooooooooh yeeeeeeEEEEEEEEeees please!");
    yield;
    if (state.guiValue == 2) controller.changeState("MainMenu");
    else return;
  }
}
