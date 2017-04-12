const CREDIT_MESSAGE = "Hello and welcome to my new game, I hope you have fun.\n"+
                      "Feel free to send me email about aspects of this game or my\n"+
                      "personality that you hate. marineorganism@gmail.com"


function *load()
{
  state.buildSlot();
  yield;

  if (state.guiValue >= 1 && state.guiValue <= 3)
  {
    controller.loadGame(state.guiValue);
    if (controller.getCharacters().length == 0)
    {
      controller.setSlot(state.guiValue);
      controller.addCharacter("stasbangoraKebabom");
      controller.transport("next","start");
    }
    controller.toOverworld();
  }
}


function *credits()
{
  state.buildTextbox("Dany Burton",CREDIT_MESSAGE,"dany_n");
  yield;
}


function *deleting()
{
  state.buildSlot(true);
  yield;

  if (state.guiValue >= 2 && state.guiValue <= 4)
  {
    controller.setSlot(state.guiValue - 1);
    controller.saveGame();
    state.buildTextbox("Deleted","Slot "+controller.getSlot()+" deleted!",null);
    yield;
  }
}


while (true)
{
  state.buildQA("Vobangora Gorad Dortsars",null,"Play",
                                              "A game by Dany Burton",
                                              "Delete Saves");
  yield;

  //start new game
  if (state.guiValue == 1)
  {
    yield* load();
  }
  //show a pic of me!
  else if (state.guiValue == 2)
  {
    yield* credits();
  }
  //delete some saves
  else if (state.guiValue == 3)
  {
    yield* deleting();
  }
}
