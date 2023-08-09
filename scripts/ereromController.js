#include "theatre.js"

const FOUND = "foundErerom";

while (!caller.properties.inTown || StateOfGame.s(FOUND)) {
    yield* awaitCollision();
    yield* speak("Stoama mor Valread Treparsom!");
    yield* speak(
        `gorad gebelum vumem me gamum sademem ursasmad ursotad tobure.
        gamom sademem tovotarse tob tovotom mor kavesars.`
    );
    yield* speak(
        `tamsad gamom telemem sotarse let gamom telemem tovotad kabtra lusad redars.
        gamra latarse mar goka tu ordom garmem lestesarse ger gamra molars let sotad
        gamom telemem tovotad kabtars kole mosad geadama delarmem gamars.`
    );
    yield* speak(
        `bort tovotad gebelure let gamum tormamem sotur kot altarad esom beam ta
        saresra tagedom seakmem gamra molaur let gamum obemem ladmemterkmemra temars tu
        mormemBEAMGOUmemra temars.`
    );
    StateOfGame.s(FOUND, true);
    if (caller.properties.inTown) {
        if (yield* binaryQuestion("Return to Ererom's place?")) {
            controller.transport("ererom","tunnel");
        }
    }
    yield* awaitSeperation();
}