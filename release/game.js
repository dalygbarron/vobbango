var Scumbag;
(function (Scumbag) {
    function createActor(game, data) {
        if (data.properties.hasOwnProperty("type")) {
            let enemyData = Scumbag.Enemies.getEnemyData(data.properties.type, game);
            let actor = new Actor(game, data.x, data.y, name, enemyData.key, enemyData.controller, enemyData.health);
            actor.properties = enemyData;
            actor.script = game.cache.getText(enemyData.script);
            return actor;
        }
        let actor = new Actor(game, data.x, data.y, name, data.properties.key, data.properties.controller, data.properties.health);
        actor.properties = data.properties;
        actor.script = data.properties.script;
        return actor;
    }
    Scumbag.createActor = createActor;
    class Actor extends Phaser.Sprite {
        constructor(game, x, y, name, key, controllerName, health) {
            super(game, x, y, key);
            this.updating = true;
            this.strafing = false;
            this.fighting = false;
            this.name = name;
            this.health = health;
            this.game.physics.arcade.enable(this);
            this.body.collideWorldBounds = true;
            this.body.immovable = true;
            this.body.width = this.width / 5 * 4;
            this.body.height = this.height / 12 * 5;
            this.body.offset.x = this.width / 10;
            this.body.offset.y = this.height / 12 * 7;
            this.anchor.setTo(0.5);
            this.animations.add('front', [0, 1, 2, 3], 10, true);
            this.animations.add('back', [4, 5, 6, 7], 10, true);
            this.heart = new Phaser.Sprite(game, 0, 0, "heart");
            this.game.physics.arcade.enable(this.heart);
            this.heart.anchor.setTo(0.5);
            this.heart.body.setCircle(this.heart.width / 9, this.heart.width / 9 * 4, this.heart.height / 9 * 4);
            this.addChild(this.heart);
            this.heart.alpha = 0;
            this.controller = new Scumbag.Controller(game, controllerName, this);
            game.add.existing(this);
        }
        update() {
            if (!(this.updating && this.alive)) {
                this.body.velocity.x = 0;
                this.body.velocity.y = 0;
                if (!this.moveOnSpot)
                    this.animations.stop();
                return;
            }
            if (this.x < this.game.camera.x ||
                this.x > this.game.camera.x + this.game.camera.width ||
                this.y < this.game.camera.y ||
                this.y > this.game.camera.y + this.game.camera.height) {
                this.health = this.properties.health;
            }
            if (this.controller.run(this.game.time.elapsedMS))
                this.kill();
            if (this.strafing)
                this.heart.alpha = 1;
            else
                this.heart.alpha = 0;
            let angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
            if (this.body.velocity.x != 0 || this.body.velocity.y != 0 || this.moveOnSpot) {
                if (!this.strafing)
                    this.angle = angle;
                if ((this.animations.currentAnim.name == "front" ||
                    this.animations.currentAnim.name == "back") ||
                    this.animations.currentAnim.isFinished) {
                    if (angle < 0)
                        this.animations.play("back");
                    else
                        this.animations.play("front");
                    if (Math.abs(angle) < Math.PI / 2)
                        this.scale.x = 1;
                    else if (Math.abs(angle) > Math.PI / 2)
                        this.scale.x = -1;
                }
            }
            else if (this.animations.currentAnim.name == "front" ||
                this.animations.currentAnim.name == "back") {
                this.animations.stop();
            }
        }
        setKey(key) {
            if (key == "")
                this.alpha = 0;
            else
                this.loadTexture(key);
        }
        damage(amount) {
            this.health -= amount;
            return this;
        }
        setHalo(key, nFrames, framerate, duration = 1000) {
            if (this.halo != null)
                this.halo.destroy();
            this.halo = this.game.add.sprite(0, 0, key);
            this.halo.anchor.set(0.5);
            let frames = [];
            for (let i = 0; i < nFrames; i++)
                frames.push(i);
            this.halo.animations.add("animation", frames, duration, true);
            this.halo.animations.play("animation");
            this.addChild(this.halo);
            this.halo.alpha = 0;
            this.game.add.tween(this.halo).to({ alpha: 1 }, duration, Phaser.Easing.Default, true);
            this.halo.blendMode = PIXI.blendModes.MULTIPLY;
        }
    }
    Scumbag.Actor = Actor;
})(Scumbag || (Scumbag = {}));
;
var Scumbag;
(function (Scumbag) {
    class Background {
        constructor(imageKey, width, height, game) {
            this.image = game.add.image(0, 0, imageKey);
            this.image.sendToBack();
            this.width = width;
            this.height = height;
            this.cameraWidth = game.width;
            this.cameraHeight = game.height;
        }
        update(cameraX, cameraY) {
            let x = cameraX / (this.width - this.cameraWidth) *
                (this.width - this.image.width);
            let y = cameraY / (this.height - this.cameraHeight) *
                (this.height - this.image.height);
            if (isFinite(x))
                this.image.x = x;
            if (isFinite(y))
                this.image.y = y;
        }
    }
    Scumbag.Background = Background;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class Bullet extends Phaser.Sprite {
        constructor(game, key) {
            super(game, 0, 0, key);
            this.anchor.set(0.5);
            this.exists = false;
        }
        fire(x, y, angle, speed, gx, gy) {
            this.reset(x, y);
            this.game.physics.arcade.velocityFromRotation(angle, speed, this.body.velocity);
            this.angle = angle;
            this.rotation = angle;
            this.body.gravity.set(gx, gy);
        }
        redirect(angle, speed, gx = 0, gy = 0) {
            this.game.physics.arcade.velocityFromRotation(angle, speed, this.body.velocity);
            this.angle = angle;
            this.rotation = angle;
            this.body.gravity.set(gx, gy);
        }
        update() {
            if (this.x < this.game.camera.x ||
                this.x > this.game.camera.x + this.game.camera.width ||
                this.y < this.game.camera.y ||
                this.y > this.game.camera.y + this.game.camera.height) {
                this.kill();
            }
        }
    }
    Scumbag.Bullet = Bullet;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    let num = 0;
    class BulletGroup extends Phaser.Group {
        constructor(game, parent, master, speed, size, key, sound) {
            super(game, parent, (num++).toString(), false, true, Phaser.Physics.ARCADE);
            this.master = master;
            this.speed = speed;
            this.sound = sound;
            for (let i = 0; i < size; i++) {
                let bullet = new Scumbag.Bullet(game, key);
                this.add(bullet, true);
                bullet.body.setCircle(bullet.width / 4, bullet.width / 4, bullet.height / 4);
            }
        }
        fire(x, y, gx, gy, angle) {
            if (this.sound != null)
                this.game.sound.play(this.sound);
            let bullet = this.getFirstExists(false);
            if (bullet != null)
                bullet.fire(x, y, angle, this.speed, gx, gy);
            return bullet;
        }
        fireAtSpeed(x, y, angle, speed) {
            if (this.sound != null)
                this.game.sound.play(this.sound);
            let bullet = this.getFirstExists(false);
            if (bullet != null)
                bullet.fire(x, y, angle, speed, 0, 0);
            return bullet;
        }
    }
    Scumbag.BulletGroup = BulletGroup;
})(Scumbag || (Scumbag = {}));
;
var Scumbag;
(function (Scumbag) {
    const generatorConstructor = Object.getPrototypeOf(function* () { }).constructor;
    class Controller {
        constructor(game, scriptName, caller) {
            let input = Scumbag.InputManager.getInputDevice(0);
            this.script = generatorConstructor("state", "caller", "input", "Axis", "Button", "sound", "music", "Channel", game.cache.getText(scriptName))(game.state.getCurrentState(), caller, input, Scumbag.Axis, Scumbag.Button, game.sound, Scumbag.MusicManager, Scumbag.MusicChannel);
        }
        run(elapsed) {
            return this.script.next(elapsed).done;
        }
    }
    Scumbag.Controller = Controller;
})(Scumbag || (Scumbag = {}));
;
var Scumbag;
(function (Scumbag) {
    var Enemies;
    (function (Enemies) {
        function getEnemyData(type, game) {
            let data = game.cache.getJSON("enemies").enemies;
            for (let i = 0; i < data.length; i++) {
                if (data[i].name == type)
                    return data[i];
            }
            console.error("Couldn't find an enemy called " + type);
            return null;
        }
        Enemies.getEnemyData = getEnemyData;
    })(Enemies = Scumbag.Enemies || (Scumbag.Enemies = {}));
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class Game extends Phaser.Game {
        constructor() {
            super(832, 410, Phaser.AUTO, 'content', null, false, false);
            this.state.add('Boot', Scumbag.Boot, false);
            this.state.add('Preloader', Scumbag.Preloader, false);
            this.state.add('MainMenu', Scumbag.MainMenu, false);
            this.state.add('Overworld', Scumbag.Overworld, false);
            this.state.add('Gameover', Scumbag.Gameover, false);
            this.state.add('Credits', Scumbag.Credits, false);
            this.state.start('Boot');
        }
    }
    Scumbag.Game = Game;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    (function (MusicChannel) {
        MusicChannel[MusicChannel["Music"] = 0] = "Music";
        MusicChannel[MusicChannel["Ambience"] = 1] = "Ambience";
        MusicChannel[MusicChannel["NChannels"] = 2] = "NChannels";
    })(Scumbag.MusicChannel || (Scumbag.MusicChannel = {}));
    var MusicChannel = Scumbag.MusicChannel;
    var MusicManager;
    (function (MusicManager) {
        let game;
        let currentSongKey = new Array(MusicChannel.NChannels);
        let currentSong = new Array(MusicChannel.NChannels);
        function init(theGame) {
            game = theGame;
        }
        MusicManager.init = init;
        function playSong(key, channel) {
            if (currentSongKey[channel] == key)
                return;
            if (currentSongKey[channel] != null) {
                game.sound.removeByKey(currentSongKey[channel]);
            }
            currentSongKey[channel] = key;
            currentSong[channel] = game.add.audio(key, 1, true);
            currentSong[channel].play();
        }
        MusicManager.playSong = playSong;
        function stopSong(channel) {
            if (currentSong[channel] != null) {
                currentSong[channel].destroy();
                currentSongKey[channel] = null;
            }
        }
        MusicManager.stopSong = stopSong;
        function fadeOut(time, channel) {
            if (currentSong[channel] != null) {
                currentSong[channel].fadeOut(time);
            }
        }
        MusicManager.fadeOut = fadeOut;
    })(MusicManager = Scumbag.MusicManager || (Scumbag.MusicManager = {}));
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    function createRegions(data) {
        let regions = {};
        for (let i = 0; i < data.length; i++) {
            let name = data[i].name;
            let x = data[i].x;
            let y = data[i].y;
            let width = data[i].width;
            let height = data[i].height;
            let script = null;
            if (data[i].hasOwnProperty("properties")) {
                if (data[i].properties.hasOwnProperty("script")) {
                    script = data[i].properties.script;
                }
            }
            regions[name] = { x: x, y: y, width: width, height: height, script: script };
        }
        return regions;
    }
    Scumbag.createRegions = createRegions;
})(Scumbag || (Scumbag = {}));
;
var Scumbag;
(function (Scumbag) {
    var SaveManager;
    (function (SaveManager) {
        function saveGame(slot, data) {
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("save" + slot, data);
            }
            else {
                console.log("I'm afraid saving won't be possible in this browser, but" +
                    " here's what it was going to save:");
                console.log(data);
            }
        }
        SaveManager.saveGame = saveGame;
        function loadGame(slot) {
            if (typeof (Storage) !== "undefined") {
                return localStorage.getItem("save" + slot);
            }
            else {
                console.log("I'm afraid loading won't be possible in this browser");
            }
        }
        SaveManager.loadGame = loadGame;
    })(SaveManager = Scumbag.SaveManager || (Scumbag.SaveManager = {}));
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    var StateOfGame;
    (function (StateOfGame) {
        function flush() {
            StateOfGame.parameters =
                {
                    slot: 0,
                    switches: {},
                    variables: {},
                    characters: [],
                    map: "",
                    playerKey: "",
                    actors: new Array(),
                    score: 0,
                    lives: 3,
                    time: 0
                };
        }
        StateOfGame.flush = flush;
        let timerFunction = 0;
        function startTimer() {
            timerFunction = setInterval(function () { StateOfGame.parameters.time++; StateOfGame.parameters.score -= 0.135; }, 1000);
        }
        StateOfGame.startTimer = startTimer;
        function stopTimer() {
            clearInterval(timerFunction);
        }
        StateOfGame.stopTimer = stopTimer;
        function save() {
            let data = JSON.stringify(StateOfGame.parameters);
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("save" + StateOfGame.parameters.slot, data);
            }
            else {
                console.log("I'm afraid saving won't be possible in this browser, but" +
                    " here's what it was going to save:");
                console.log(data);
            }
        }
        StateOfGame.save = save;
        function load(slot) {
            if (typeof (Storage) !== "undefined") {
                let data = localStorage.getItem("save" + slot);
                if (data != null)
                    StateOfGame.parameters = JSON.parse(data);
                else {
                    console.log("oing the other way");
                    flush();
                    StateOfGame.parameters.slot = slot;
                }
            }
            else {
                console.log("I'm afraid loading won't be possible in this browser");
            }
            StateOfGame.parameters.slot = slot;
        }
        StateOfGame.load = load;
    })(StateOfGame = Scumbag.StateOfGame || (Scumbag.StateOfGame = {}));
})(Scumbag || (Scumbag = {}));
;
var Scumbag;
(function (Scumbag) {
    const generatorConstructor = Object.getPrototypeOf(function* () { }).constructor;
    let game;
    let blocks;
    function storeActor(actor) {
        Scumbag.StateOfGame.parameters.actors.push({ name: actor.name, x: actor.x, y: actor.y });
    }
    function storeActors() {
        let state = game.state.getCurrentState();
        if (state instanceof Scumbag.Overworld) {
            Scumbag.StateOfGame.parameters.actors = [];
            state.actors.forEach(storeActor, null);
        }
    }
    var ScriptContext;
    (function (ScriptContext) {
        function changeState(newState, ...args) {
            game.state.start(newState, true, false, args);
        }
        ScriptContext.changeState = changeState;
        function transport(level, playerRegion) {
            game.state.start("Overworld", true, false, level, playerRegion);
        }
        ScriptContext.transport = transport;
        function toOverworld() {
            game.state.start("Overworld");
        }
        ScriptContext.toOverworld = toOverworld;
        function setSwitch(key, value) {
            Scumbag.StateOfGame.parameters.switches[key] = value;
        }
        ScriptContext.setSwitch = setSwitch;
        function getSwitch(key) {
            if (key in Scumbag.StateOfGame.parameters.switches)
                return Scumbag.StateOfGame.parameters.switches[key];
            else
                return false;
        }
        ScriptContext.getSwitch = getSwitch;
        function setVariable(key, value) {
            Scumbag.StateOfGame.parameters.variables[key] = value;
        }
        ScriptContext.setVariable = setVariable;
        function getVarirable(key) {
            if (key in Scumbag.StateOfGame.parameters.variables)
                return Scumbag.StateOfGame.parameters.variables[key];
            else
                return 0;
        }
        ScriptContext.getVarirable = getVarirable;
        function saveGame() {
            storeActors();
            Scumbag.StateOfGame.save();
        }
        ScriptContext.saveGame = saveGame;
        function loadGame(slot) {
            Scumbag.StateOfGame.load(slot);
        }
        ScriptContext.loadGame = loadGame;
        function addCharacter(character) {
            Scumbag.StateOfGame.parameters.characters.push(character);
        }
        ScriptContext.addCharacter = addCharacter;
        function getCharacters() { return Scumbag.StateOfGame.parameters.characters; }
        ScriptContext.getCharacters = getCharacters;
        function setPlayerKey(key) {
            if (this.state instanceof Scumbag.Overworld)
                this.state.player.setKey(key);
            Scumbag.StateOfGame.parameters.playerKey = key;
        }
        ScriptContext.setPlayerKey = setPlayerKey;
        function playSound(key) { game.sound.play(key); }
        ScriptContext.playSound = playSound;
        function playAmbience(key) {
            Scumbag.MusicManager.playSong(key, Scumbag.MusicChannel.Ambience);
        }
        ScriptContext.playAmbience = playAmbience;
        function playMusic(key) {
            Scumbag.MusicManager.playSong(key, Scumbag.MusicChannel.Music);
        }
        ScriptContext.playMusic = playMusic;
        function stopMusic() { Scumbag.MusicManager.stopSong(Scumbag.MusicChannel.Music); }
        ScriptContext.stopMusic = stopMusic;
        function setSlot(slot) { Scumbag.StateOfGame.parameters.slot = slot; }
        ScriptContext.setSlot = setSlot;
        function getSlot() { return Scumbag.StateOfGame.parameters.slot; }
        ScriptContext.getSlot = getSlot;
        function getScore() { return Scumbag.StateOfGame.parameters.score; }
        ScriptContext.getScore = getScore;
        function win() { game.state.start("Credits"); }
        ScriptContext.win = win;
    })(ScriptContext || (ScriptContext = {}));
    var Script;
    (function (Script) {
        function init(pGame) {
            game = pGame;
        }
        Script.init = init;
        function setScript(content, caller) {
            ScriptContext.state = game.state.getCurrentState();
            ScriptContext.caller = caller;
            blocks = generatorConstructor("ctx", content)(ScriptContext);
            runScript(0);
        }
        Script.setScript = setScript;
        function runScript(value) {
            blocks.next(value);
        }
        Script.runScript = runScript;
    })(Script = Scumbag.Script || (Scumbag.Script = {}));
})(Scumbag || (Scumbag = {}));
;
var Scumbag;
(function (Scumbag) {
    var Util;
    (function (Util) {
        function slow(value) {
            if (value.x > 1)
                value.x = 1;
            else if (value.x < -1)
                value.x = -1;
            else
                value.x = 0;
            if (value.y > 1)
                value.y = 1;
            else if (value.y < -1)
                value.y = -1;
            else
                value.y = 0;
        }
        Util.slow = slow;
        function evaluateDirection(direction) {
            if (direction == "up")
                return Math.PI / 2;
            else if (direction == "left")
                return Math.PI;
            else if (direction == "down")
                return -1 * Math.PI / 2;
            else if (direction == "right")
                return 0;
            else
                return parseInt(direction);
        }
        Util.evaluateDirection = evaluateDirection;
    })(Util = Scumbag.Util || (Scumbag.Util = {}));
    ;
})(Scumbag || (Scumbag = {}));
;
var Scumbag;
(function (Scumbag) {
    class GuiElement {
        constructor(blocking = true) {
            this.blocking = blocking;
        }
    }
    Scumbag.GuiElement = GuiElement;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    function click() {
        this.go = true;
    }
    class BlankElement extends Scumbag.GuiElement {
        bringToFront() {
        }
        addPosition(x, y) {
        }
        setPosition(x, y) {
        }
        getX() { return 0; }
        getY() { return 0; }
        getWidth() { return 0; }
        getHeight() { return 0; }
        update() {
            return 0;
        }
        destroy() {
        }
    }
    Scumbag.BlankElement = BlankElement;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    function click() {
        this.go = true;
    }
    class ClickerElement extends Scumbag.GuiElement {
        constructor(game, key) {
            super();
            this.go = false;
            this.image = game.add.image(0, 0, key);
            Scumbag.InputManager.getInputDevice(0).addOnButtonPress(Scumbag.Button.Shoot, click, this);
        }
        bringToFront() {
            this.image.bringToTop();
        }
        addPosition(x, y) {
            this.image.x += x;
            this.image.y += y;
        }
        setPosition(x, y) {
            this.image.x = x;
            this.image.y = y;
        }
        getX() { return this.image.x; }
        getY() { return this.image.y; }
        getWidth() { return this.image.width; }
        getHeight() { return this.image.height; }
        update() {
            if (this.go)
                return 1;
            else
                return 0;
        }
        destroy() {
            Scumbag.InputManager.getInputDevice(0).removeOnButtonPress(Scumbag.Button.Shoot, click);
            this.image.destroy();
        }
    }
    Scumbag.ClickerElement = ClickerElement;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class ImageElement extends Scumbag.GuiElement {
        constructor(game, key) {
            super();
            this.image = game.add.image(0, 0, key);
        }
        bringToFront() {
            this.image.bringToTop();
        }
        addPosition(x, y) {
            this.image.x += x;
            this.image.y += y;
        }
        setPosition(x, y) {
            this.image.x = x;
            this.image.y = y;
        }
        getX() { return this.image.x; }
        getY() { return this.image.y; }
        getWidth() { return this.image.width; }
        getHeight() { return this.image.height; }
        update() { return 0; }
        destroy() {
            this.image.destroy();
        }
    }
    Scumbag.ImageElement = ImageElement;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    function click() {
        this.go = true;
    }
    class SelectorElement extends Scumbag.GuiElement {
        constructor(game, key, children) {
            super();
            this.x = -99999;
            this.y = -99999;
            this.go = false;
            this.selection = 0;
            this.image = game.add.image(this.x, this.y, key);
            this.children = children;
            Scumbag.InputManager.getInputDevice(0).addOnButtonPress(Scumbag.Button.Shoot, click, this);
            this.oldVerticalStick = Scumbag.InputManager.getInputDevice(0).getAxisState(Scumbag.Axis.Vertical);
            let yPadding = 0;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].setPosition(this.image.x, this.image.y + yPadding);
                this.children[i].bringToFront();
                yPadding += this.children[i].getHeight() * 0.8;
            }
        }
        bringToFront() {
            this.image.bringToTop();
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].bringToFront();
            }
        }
        addPosition(x, y) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].addPosition(x, y);
            }
        }
        setPosition(x, y) {
            let deltaX = x - this.x;
            let deltaY = y - this.y;
            this.x += deltaX;
            this.y += deltaY;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].addPosition(deltaX, deltaY);
            }
        }
        getX() { return this.x; }
        getY() { return this.y; }
        getWidth() { return 0; }
        getHeight() { return 0; }
        update() {
            let verticalStick = Scumbag.InputManager.getInputDevice(0).getAxisState(Scumbag.Axis.Vertical);
            if (Math.abs(this.oldVerticalStick) < 0.5 &&
                Math.abs(verticalStick) > 0.5) {
                if (verticalStick > 0)
                    this.selection++;
                else
                    this.selection--;
            }
            this.oldVerticalStick = verticalStick;
            if (this.selection >= this.children.length)
                this.selection = 0;
            if (this.selection < 0)
                this.selection = this.children.length - 1;
            this.image.x = this.children[this.selection].getX();
            this.image.y = this.children[this.selection].getY();
            this.image.width = this.children[this.selection].getWidth();
            this.image.height = this.children[this.selection].getHeight();
            if (this.go)
                return this.selection + 1;
            else
                return 0;
        }
        destroy() {
            Scumbag.InputManager.getInputDevice(0).removeOnButtonPress(Scumbag.Button.Shoot, click);
            this.image.destroy();
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].destroy();
            }
        }
    }
    Scumbag.SelectorElement = SelectorElement;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class ShelfElement extends Scumbag.GuiElement {
        constructor(children) {
            super();
            this.x = 0;
            this.y = 0;
            this.children = children;
            let xPadding = 0;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].setPosition(xPadding, 0);
                this.children[i].bringToFront();
                xPadding += this.children[i].getWidth();
            }
        }
        bringToFront() {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].bringToFront();
            }
        }
        addPosition(x, y) {
            this.x += x;
            this.y += y;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].addPosition(x, y);
            }
        }
        setPosition(x, y) {
            let deltaX = x - this.x;
            let deltaY = y - this.y;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].addPosition(deltaX, deltaY);
            }
            this.x = x;
            this.y = y;
        }
        getX() { return this.x; }
        getY() { return this.y; }
        getWidth() {
            let width = 0;
            for (let i = 0; i < this.children.length; i++) {
                width += this.children[i].getWidth();
            }
            return width;
        }
        getHeight() {
            let height = 0;
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i].getHeight() > height) {
                    height = this.children[i].getHeight();
                }
            }
            return height;
        }
        update() {
            for (let i = 0; i < this.children.length; i++) {
                let value = this.children[i].update();
                if (value != 0)
                    return value;
            }
            return 0;
        }
        destroy() {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].destroy();
            }
        }
    }
    Scumbag.ShelfElement = ShelfElement;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    function click() {
        this.go = true;
    }
    class SlotElement extends Scumbag.GuiElement {
        constructor(game, key, children) {
            super();
            this.x = -99999;
            this.y = -99999;
            this.go = false;
            this.selection = 0;
            this.image = game.add.image(this.x, this.y, key);
            this.children = children;
            Scumbag.InputManager.getInputDevice(0).addOnButtonPress(Scumbag.Button.Shoot, click, this);
            this.oldHorizontalStick = Scumbag.InputManager.getInputDevice(0).getAxisState(Scumbag.Axis.Horizontal);
            let xPadding = 0;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].setPosition(this.image.x + xPadding, this.image.y);
                this.children[i].bringToFront();
                xPadding += this.children[i].getWidth() * 1.5;
            }
        }
        bringToFront() {
            this.image.bringToTop();
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].bringToFront();
            }
        }
        addPosition(x, y) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].addPosition(x, y);
            }
        }
        setPosition(x, y) {
            let deltaX = x - this.x;
            let deltaY = y - this.y;
            this.x += deltaX;
            this.y += deltaY;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].addPosition(deltaX, deltaY);
            }
        }
        getX() { return this.x; }
        getY() { return this.y; }
        getWidth() {
            let width = 0;
            for (let i = 0; i < this.children.length; i++) {
                width += this.children[i].width;
            }
            return width;
        }
        getHeight() {
            let height = 0;
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i].getHeight() > height) {
                    height = this.children[i].getHeight();
                }
            }
            return height;
        }
        update() {
            let horizontalStick = Scumbag.InputManager.getInputDevice(0).getAxisState(Scumbag.Axis.Horizontal);
            if (Math.abs(this.oldHorizontalStick) < 0.5 &&
                Math.abs(horizontalStick) > 0.5) {
                if (horizontalStick > 0)
                    this.selection++;
                else
                    this.selection--;
            }
            this.oldHorizontalStick = horizontalStick;
            if (this.selection >= this.children.length)
                this.selection = 0;
            if (this.selection < 0)
                this.selection = this.children.length - 1;
            this.image.x = this.children[this.selection].getX();
            this.image.y = this.children[this.selection].getY();
            this.image.width = this.children[this.selection].getWidth();
            this.image.height = this.children[this.selection].getHeight();
            if (this.go)
                return this.selection + 1;
            else
                return 0;
        }
        destroy() {
            Scumbag.InputManager.getInputDevice(0).removeOnButtonPress(Scumbag.Button.Shoot, click);
            this.image.destroy();
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].destroy();
            }
        }
    }
    Scumbag.SlotElement = SlotElement;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class StackElement extends Scumbag.GuiElement {
        constructor(children) {
            super();
            this.x = 0;
            this.y = 0;
            this.children = children;
            let yPadding = 0;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].setPosition(0, yPadding);
                this.children[i].bringToFront();
                yPadding += this.children[i].getHeight();
            }
        }
        bringToFront() {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].bringToFront();
            }
        }
        addPosition(x, y) {
            this.x += x;
            this.y += y;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].addPosition(x, y);
            }
        }
        setPosition(x, y) {
            let deltaX = x - this.x;
            let deltaY = y - this.y;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].addPosition(deltaX, deltaY);
            }
            this.x = x;
            this.y = y;
        }
        getX() { return this.x; }
        getY() { return this.y; }
        getWidth() {
            let width = 0;
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i].getWidth() > width) {
                    width = this.children[i].getWidth();
                }
            }
            return width;
        }
        getHeight() {
            let height = 0;
            for (let i = 0; i < this.children.length; i++) {
                height += this.children[i].getHeight();
            }
            return height;
        }
        update() {
            for (let i = 0; i < this.children.length; i++) {
                let value = this.children[i].update();
                if (value != 0)
                    return value;
            }
            return 0;
        }
        destroy() {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].destroy();
            }
        }
    }
    Scumbag.StackElement = StackElement;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class TextElement extends Scumbag.GuiElement {
        constructor(game, content, style, timed = false) {
            super();
            this.timer = 0;
            this.cursor = 0;
            this.period = 0.01;
            this.game = game;
            this.content = content;
            this.text = game.add.text(0, 0, "", style);
            this.text.setShadow(1, 1, 'rgba(0,0,0,1)', 4);
            this.timed = timed;
            if (!this.timed)
                this.text.text = content;
        }
        bringToFront() {
            this.text.bringToTop();
        }
        addPosition(x, y) {
            this.text.x += x;
            this.text.y += y;
        }
        setPosition(x, y) {
            this.text.x = x;
            this.text.y = y;
        }
        getX() { return this.text.x; }
        getY() { return this.text.y; }
        getWidth() {
            return this.text.width;
        }
        getHeight() { return this.text.height; }
        update() {
            if (!this.timed)
                return 0;
            this.timer += this.game.time.elapsed / 1000;
            while (this.timer > this.period && this.cursor < this.content.length) {
                this.text.text += this.content[this.cursor];
                this.cursor++;
                this.timer -= this.period;
                this.game.sound.play("tick");
            }
            return 0;
        }
        destroy() {
            this.text.destroy();
        }
    }
    Scumbag.TextElement = TextElement;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    const padding = 4;
    class Window extends Scumbag.GuiElement {
        constructor(game, key, children, chipKey) {
            super();
            this.chip = null;
            this.children = children;
            this.image = game.add.image(0, game.height - game.height / 4, key);
            this.image.width = game.width;
            this.image.height = game.height / 4;
            let xPadding = padding;
            let yPadding = padding;
            if (chipKey != null) {
                this.chip = game.add.image(0, 0, chipKey);
                this.chip.y = game.height - this.chip.height;
                xPadding += this.chip.width;
            }
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].setPosition(this.image.x + xPadding, this.image.y + yPadding);
                this.children[i].bringToFront();
                yPadding += this.children[i].getHeight();
            }
        }
        bringToFront() {
            this.image.bringToTop();
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].bringToFront();
            }
            if (this.chip != null)
                this.chip.bringToTop();
        }
        addPosition(x, y) {
            this.image.x += x;
            this.image.y += y;
            if (this.chip != null) {
                this.chip.x += x;
                this.chip.y += y;
            }
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].addPosition(x, y);
            }
        }
        setPosition(x, y) {
            let deltaX = x - this.image.x;
            let deltaY = y - this.image.y;
            this.image.x += deltaX;
            this.image.y += deltaY;
            if (this.chip != null) {
                this.chip.x += deltaX;
                this.chip.y += deltaY;
            }
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].addPosition(deltaX, deltaY);
            }
        }
        getX() { return this.image.x; }
        getY() { return this.image.y; }
        getWidth() { return this.image.width; }
        getHeight() { return this.image.height; }
        update() {
            for (let i = 0; i < this.children.length; i++) {
                let value = this.children[i].update();
                if (value != 0)
                    return value;
            }
            return 0;
        }
        destroy() {
            this.image.destroy();
            if (this.chip != null)
                this.chip.destroy();
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].destroy();
            }
        }
    }
    Scumbag.Window = Window;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    (function (Button) {
        Button[Button["Shoot"] = 0] = "Shoot";
        Button[Button["Strafe"] = 1] = "Strafe";
        Button[Button["Bomb"] = 2] = "Bomb";
        Button[Button["Pause"] = 3] = "Pause";
        Button[Button["nButtons"] = 4] = "nButtons";
    })(Scumbag.Button || (Scumbag.Button = {}));
    var Button = Scumbag.Button;
    (function (Axis) {
        Axis[Axis["Horizontal"] = 0] = "Horizontal";
        Axis[Axis["Vertical"] = 1] = "Vertical";
        Axis[Axis["nAxes"] = 2] = "nAxes";
    })(Scumbag.Axis || (Scumbag.Axis = {}));
    var Axis = Scumbag.Axis;
    class InputDevice {
    }
    Scumbag.InputDevice = InputDevice;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class GamepadInputDevice extends Scumbag.InputDevice {
        constructor(pad) {
            super();
            this.pad = pad;
            this.buttons = new Array(Scumbag.Button.nButtons);
            this.buttons[Scumbag.Button.Shoot] = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
            this.buttons[Scumbag.Button.Strafe] = this.pad.getButton(Phaser.Gamepad.XBOX360_B);
            this.buttons[Scumbag.Button.Bomb] = this.pad.getButton(Phaser.Gamepad.XBOX360_X);
            this.buttons[Scumbag.Button.Pause] = this.pad.getButton(Phaser.Gamepad.XBOX360_START);
            this.axes = new Array(Scumbag.Axis.nAxes);
            this.axes[Scumbag.Axis.Horizontal] = Phaser.Gamepad.XBOX360_STICK_LEFT_X;
            this.axes[Scumbag.Axis.Vertical] = Phaser.Gamepad.XBOX360_STICK_LEFT_Y;
        }
        getButtonState(button) {
            return this.buttons[button].isDown;
        }
        getAxisState(axis) {
            let axisState = this.pad.axis(this.axes[axis]);
            if (!axisState)
                return 0;
            return axisState;
        }
        addOnButtonPress(button, callback, context) {
            this.buttons[button].onDown.add(callback, context);
        }
        removeOnButtonPress(button, callback, context) {
            this.buttons[button].onDown.remove(callback, context);
        }
        clear() {
            for (let i = 0; i < Scumbag.Button.nButtons; i++) {
                this.buttons[i].onDown.removeAll();
            }
        }
    }
    Scumbag.GamepadInputDevice = GamepadInputDevice;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    const N_INPUT_DEVICES = 1;
    var InputManager;
    (function (InputManager) {
        let inputDevices = Array(N_INPUT_DEVICES);
        function init(game) {
            let pad = game.input.gamepad.pad1;
            if (game.input.gamepad.supported && game.input.gamepad.active &&
                pad.connected) {
                console.log("using gamepad");
                inputDevices[0] = new Scumbag.GamepadInputDevice(pad);
            }
            else {
                console.log("using keyboard");
                inputDevices[0] = new Scumbag.KeyboardInputDevice(game);
            }
        }
        InputManager.init = init;
        function getInputDevice(id) {
            return inputDevices[id];
        }
        InputManager.getInputDevice = getInputDevice;
    })(InputManager = Scumbag.InputManager || (Scumbag.InputManager = {}));
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class KeyboardInputDevice extends Scumbag.InputDevice {
        constructor(game) {
            super();
            this.buttons = new Array(Scumbag.Button.nButtons);
            this.buttons[Scumbag.Button.Shoot] = game.input.keyboard.addKey(Phaser.KeyCode.Z);
            this.buttons[Scumbag.Button.Strafe] = game.input.keyboard.addKey(Phaser.KeyCode.SHIFT);
            this.buttons[Scumbag.Button.Bomb] = game.input.keyboard.addKey(Phaser.KeyCode.X);
            this.buttons[Scumbag.Button.Pause] = game.input.keyboard.addKey(Phaser.KeyCode.ESC);
            this.up = game.input.keyboard.addKey(Phaser.KeyCode.UP);
            this.down = game.input.keyboard.addKey(Phaser.KeyCode.DOWN);
            this.left = game.input.keyboard.addKey(Phaser.KeyCode.LEFT);
            this.right = game.input.keyboard.addKey(Phaser.KeyCode.RIGHT);
        }
        getButtonState(button) {
            return this.buttons[button].isDown;
        }
        getAxisState(axis) {
            if (axis == Scumbag.Axis.Horizontal) {
                if (this.left.isDown && this.right.isDown)
                    return 0;
                if (this.left.isDown)
                    return -1;
                if (this.right.isDown)
                    return 1;
                return 0;
            }
            if (axis == Scumbag.Axis.Vertical) {
                if (this.up.isDown && this.down.isDown)
                    return 0;
                if (this.up.isDown)
                    return -1;
                if (this.down.isDown)
                    return 1;
                return 0;
            }
        }
        addOnButtonPress(button, callback, context) {
            this.buttons[button].onDown.add(callback, context);
        }
        removeOnButtonPress(button, callback, context) {
            this.buttons[button].onDown.remove(callback, context);
        }
        clear() {
            for (let i = 0; i < Scumbag.Button.nButtons; i++) {
                this.buttons[i].onDown.removeAll();
            }
        }
    }
    Scumbag.KeyboardInputDevice = KeyboardInputDevice;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class Boot extends Phaser.State {
        preload() {
            this.load.image('preloadBar', 'images/preloadBar.png');
        }
        create() {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.game.stage.smoothed = false;
            Scumbag.MusicManager.init(this.game);
            this.game.input.gamepad.start();
            this.game.state.start('Preloader', true, false);
        }
    }
    Scumbag.Boot = Boot;
})(Scumbag || (Scumbag = {}));
``;
var Scumbag;
(function (Scumbag) {
    const headingFont = { font: "16px Serif", fontStyle: "bold", fill: "#ff0" };
    const questionFont = { font: "16px Serif", fontStyle: "bold", fill: "#f00" };
    const bodyFont = { font: "14px Serif", fill: "#ff6" };
    const N_SAVES = 3;
    function numberAsTime(time) {
        let hrs = ~~(time / 3600);
        let mins = ~~((time % 3600) / 60);
        let secs = time % 60;
        return hrs + ":" + mins + ":" + secs;
    }
    Scumbag.numberAsTime = numberAsTime;
    class GuiState extends Phaser.State {
        constructor(...args) {
            super(...args);
            this.gui = null;
        }
        create() {
            this.gui = null;
        }
        update() {
            if (this.gui == null || !this.gui.blocking) {
                this.postGuiUpdate();
            }
            if (this.gui != null) {
                let value = this.gui.update();
                if (value != 0) {
                    if (this.gui.blocking)
                        this.onGuiEnd();
                    this.gui.destroy();
                    this.gui = null;
                    Scumbag.Script.runScript(value);
                }
            }
        }
        buildTextbox(heading, content, chipKey) {
            let head = new Scumbag.TextElement(this.game, heading, headingFont);
            let text = new Scumbag.TextElement(this.game, content, bodyFont, true);
            let clicker = new Scumbag.ClickerElement(this.game, 'clicker');
            this.setGui(new Scumbag.Window(this.game, "window", new Array(head, text, clicker), chipKey));
        }
        buildQA(question, chipKey, ...answers) {
            let head = new Scumbag.TextElement(this.game, question, questionFont);
            let body = new Array(answers.length);
            for (let i = 0; i < body.length; i++) {
                body[i] = new Scumbag.TextElement(this.game, answers[i], bodyFont);
            }
            let selector = new Scumbag.SelectorElement(this.game, 'selector', body);
            this.setGui(new Scumbag.Window(this.game, "window", new Array(head, selector), chipKey));
        }
        buildPause(question, ...answers) {
            let head = new Scumbag.TextElement(this.game, question, questionFont);
            let body = new Array(answers.length);
            for (let i = 0; i < body.length; i++) {
                body[i] = new Scumbag.TextElement(this.game, answers[i], bodyFont);
            }
            let pics = [];
            for (let u = 0; u < Scumbag.StateOfGame.parameters.characters.length; u++) {
                pics[u] = new Scumbag.ImageElement(this.game, Scumbag.StateOfGame.parameters.characters[u]);
            }
            pics[Scumbag.StateOfGame.parameters.characters.length] = new Scumbag.SelectorElement(this.game, 'selector', body);
            let shelf = new Scumbag.ShelfElement(pics);
            this.setGui(new Scumbag.Window(this.game, "window", new Array(head, shelf)));
        }
        buildSlot(cancelFirst = false) {
            console.error("build");
            let children = [];
            for (let i = 0; i < N_SAVES; i++) {
                let head = new Scumbag.TextElement(this.game, "Slot " + (i + 1), headingFont);
                Scumbag.StateOfGame.load(i + 1);
                let pics = [];
                for (let u = 0; u < Scumbag.StateOfGame.parameters.characters.length; u++) {
                    pics[u] = new Scumbag.ImageElement(this.game, Scumbag.StateOfGame.parameters.characters[u]);
                }
                if (pics.length == 0) {
                    pics[0] = new Scumbag.ImageElement(this.game, "new");
                }
                let time = new Scumbag.TextElement(this.game, numberAsTime(Scumbag.StateOfGame.parameters.time), bodyFont);
                let details = new Scumbag.StackElement([time]);
                pics[pics.length] = details;
                let body = new Scumbag.ShelfElement(pics);
                children[i] = new Scumbag.StackElement([head, body]);
            }
            let cancelText = new Scumbag.TextElement(this.game, "Cancel", headingFont);
            let cancelPic = new Scumbag.ImageElement(this.game, "cancel");
            if (cancelFirst) {
                children = [new Scumbag.StackElement([cancelText, cancelPic])].concat(children);
            }
            else {
                children[N_SAVES] = new Scumbag.StackElement([cancelText, cancelPic]);
            }
            let slots = new Scumbag.SlotElement(this.game, "selector", children);
            this.setGui(new Scumbag.Window(this.game, "window", [slots]));
            Scumbag.StateOfGame.flush();
        }
        setGui(gui) {
            this.gui = gui;
            this.gui.addPosition(this.game.camera.x, this.game.camera.y);
            if (this.gui.blocking)
                this.onGuiStart();
        }
    }
    Scumbag.GuiState = GuiState;
})(Scumbag || (Scumbag = {}));
;
var Scumbag;
(function (Scumbag) {
    const PADDING = 40;
    let headingFont = { font: "50px Serif", fontStyle: "bold", fill: "#f00", stroke: "#00f", strokeThickness: 5 };
    let bodyFont = { font: "20px Serif", fill: "#ff6", align: "center", wordWrap: true, wordWrapWidth: 0 };
    let outside;
    let stop = false;
    function move(a) {
        a.y -= 0.6;
        if (a.y > 0)
            outside = false;
    }
    class Credits extends Phaser.State {
        create() {
            let data = this.game.cache.getJSON("credits");
            this.background = this.add.sprite(0, 0, data.background);
            Scumbag.MusicManager.stopSong(Scumbag.MusicChannel.Ambience);
            Scumbag.MusicManager.playSong(data.music, Scumbag.MusicChannel.Music);
            bodyFont.wordWrapWidth = this.game.width;
            this.items = this.game.add.group();
            let y = this.game.height;
            for (let i = 0; i < data.items.length; i++) {
                let item;
                if (data.items[i].type == "text") {
                    item = this.game.add.text(this.game.width / 2, y, data.items[i].content, bodyFont);
                }
                else if (data.items[i].type == "heading") {
                    item = this.game.add.text(this.game.width / 2, y, data.items[i].content, headingFont);
                    item.setShadow(0, 0, 'rgba(0,1,0,1)', 5);
                    item.update = function () {
                        this.strokeThickness = Math.random() * 36 + Math.sin(this.y / 8) * 20;
                    };
                }
                else if (data.items[i].type == "image") {
                    item = this.game.add.image(this.game.width / 2, y, data.items[i].content);
                }
                else if (data.items[i].type == "score") {
                    item = this.game.add.text(this.game.width / 2, y, "your score is " + Scumbag.StateOfGame.parameters.score, bodyFont);
                }
                item.anchor.setTo(0.5, 0);
                this.items.add(item);
                y += item.height + PADDING;
            }
        }
        update() {
            outside = true;
            this.items.forEach(move, null);
            if (outside && !stop) {
                let tween = this.add.tween(this.background).to({ alpha: 0 }, 2000, Phaser.Easing.Default, true);
                tween.onComplete.add(function () { this.game.state.start("MainMenu", true, false); }, this);
                stop = true;
            }
        }
    }
    Scumbag.Credits = Credits;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class Gameover extends Scumbag.GuiState {
        create() {
            this.game.camera.x = 0;
            this.game.camera.y = 0;
            this.background = this.add.sprite(0, 0, 'titlepage');
            this.background.alpha = 0;
            this.logo = this.add.sprite(this.game.width / 2, -300, 'dead');
            this.logo.anchor.setTo(0.5, 0.5);
            this.add.tween(this.background).to({ alpha: 1 }, 500, Phaser.Easing.Default, true);
            this.add.tween(this.logo).to({ y: this.game.height / 2 - this.logo.height / 2 }, 700, Phaser.Easing.Elastic.In, true, 500);
            Scumbag.MusicManager.playSong('deadMusic', Scumbag.MusicChannel.Music);
            Scumbag.Script.setScript(this.game.cache.getText("deadScript"));
        }
        postGuiUpdate() { }
        onGuiStart() { }
        onGuiEnd() { }
    }
    Scumbag.Gameover = Gameover;
})(Scumbag || (Scumbag = {}));
var Scumbag;
(function (Scumbag) {
    class MainMenu extends Scumbag.GuiState {
        create() {
            this.background = this.add.sprite(0, 0, "titlepage");
            this.background.alpha = 0;
            this.logo = this.add.sprite(this.game.width / 2, this.game.height / 2, 'logo');
            this.logo.anchor.setTo(0.5, 0.8);
            this.logo.animations.add("play", [0, 1, 2, 3], 7, true);
            this.logo.animations.play("play");
            this.logo.alpha = 0;
            this.add.tween(this.background).to({ alpha: 1 }, 500, Phaser.Easing.Default, true);
            this.add.tween(this.logo).to({ alpha: 1 }, 800, Phaser.Easing.Default, true, 500);
            Scumbag.MusicManager.stopSong(Scumbag.MusicChannel.Ambience);
            Scumbag.MusicManager.playSong("scumtime", Scumbag.MusicChannel.Music);
            Scumbag.InputManager.init(this.game);
            Scumbag.StateOfGame.flush();
            Scumbag.StateOfGame.stopTimer();
            Scumbag.Script.init(this.game);
            Scumbag.Script.setScript(this.game.cache.getText("menuScript"));
        }
        postGuiUpdate() { }
        onGuiStart() { }
        onGuiEnd() { }
    }
    Scumbag.MainMenu = MainMenu;
})(Scumbag || (Scumbag = {}));
;
var Scumbag;
(function (Scumbag) {
    function touches(a, b) {
        if (a == this.player) {
            if (b.fighting) {
                this.hurtPlayer();
            }
            else if (b.script != "" && this.collideCooldown <= 0) {
                this.player.body.immovable = false;
                this.collideCooldown = 1.0;
                Scumbag.Script.setScript(b.script, b);
            }
        }
        else if (b == this.player) {
            if (a.fighting) {
                this.hurtPlayer();
            }
            else if (a.script != "" && this.collideCooldown <= 0) {
                this.player.body.immovable = false;
                this.collideCooldown = 1.0;
                Scumbag.Script.setScript(a.script, a);
            }
        }
        return true;
    }
    function pause() {
        if (this.gui != null)
            return;
        Scumbag.Script.setScript(this.game.cache.getText("saveScript"));
    }
    function addPlayerAtRegion(game, region, key) {
        let playerData = {
            x: region.x + region.width / 2, y: region.y + region.height / 2, properties: { type: "player" }
        };
        return Scumbag.createActor(game, playerData);
    }
    class Overworld extends Scumbag.GuiState {
        constructor(...args) {
            super(...args);
            this.background = null;
            this.overlay = null;
            this.collideCooldown = 0.0;
            this.hitCooldown = 0.0;
        }
        init(map = null, playerRegion) {
            this.playerRegion = playerRegion;
            if (map == null) {
                this.map = Scumbag.StateOfGame.parameters.map;
                this.returning = true;
            }
            else {
                this.map = map;
                this.returning = false;
            }
        }
        preload() {
            if (!this.game.cache.checkTilemapKey(this.map)) {
                this.game.load.tilemap(this.map, "maps/" + this.map + ".json", null, Phaser.Tilemap.TILED_JSON);
            }
        }
        create() {
            super.create();
            Scumbag.StateOfGame.parameters.map = this.map;
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.tilemap = this.add.tilemap(this.map);
            for (let i in this.tilemap.tilesets) {
                this.tilemap.addTilesetImage(this.tilemap.tilesets[i].name, this.tilemap.tilesets[i].name);
            }
            this.collisionLayer = this.tilemap.createLayer("collisions");
            this.tilemap.setLayer(this.collisionLayer);
            this.tilemap.setCollisionBetween(0, 6569);
            this.collisionLayer.resizeWorld();
            this.collisionLayer.visible = false;
            let bottomLayer = this.tilemap.createLayer("background");
            this.tilemap.createLayer("things");
            this.regions = Scumbag.createRegions(this.tilemap.objects["regions"]);
            if (this.playerRegion == null) {
            }
            else {
                this.player = addPlayerAtRegion(this.game, this.regions[this.playerRegion], Scumbag.StateOfGame.parameters.playerKey);
            }
            this.actors = this.game.add.group();
            this.actors.add(this.player);
            let actors = this.tilemap.objects["actors"];
            for (let i in actors) {
                let x = actors[i].x + actors[i].width / 2;
                let y = actors[i].y + this.tilemap.tileHeight - actors[i].height / 2;
                let name = actors[i].name;
                let actor = Scumbag.createActor(this.game, actors[i]);
                this.actors.add(actor);
            }
            if (this.returning) {
                this.restoreActors();
            }
            this.tilemap.forEach(function (tile) {
                tile.blendeMode = PIXI.blendModes.MULTIPLY;
                if (tile.hasOwnProperty("properties")) {
                    if (tile.properties.hasOwnProperty("spawn")) {
                        var data = tile.properties.spawn.split("-");
                        var type = data[0];
                        var chance = parseFloat(data[1]);
                        if (Math.random() < chance) {
                            let object = new Phaser.Sprite(this.game, tile.x * tile.width + Math.random() * tile.width, (tile.y * tile.height - this.player.height) + Math.random() * tile.height, type);
                            let verticalAnchor = 1 - (object.height - this.player.height) / object.height;
                            object.anchor.set(0.5, verticalAnchor);
                            object.animations.add("stand", [0, 1, 2], 3 - Math.random() * 3, true);
                            object.animations.play("stand");
                            this.actors.add(object);
                        }
                    }
                }
            }, this, 0, 0, this.tilemap.width, this.tilemap.height, 0);
            this.bullets = this.game.add.group();
            this.tilemap.createLayer("overhead");
            this.game.camera.follow(this.player);
            this.game.camera.focusOnXY(this.player.position.x, this.player.position.y);
            if (this.tilemap.properties != null) {
                if (this.tilemap.properties.hasOwnProperty("music")) {
                    if (this.tilemap.properties.music == "none")
                        Scumbag.MusicManager.stopSong(Scumbag.MusicChannel.Music);
                    else
                        Scumbag.MusicManager.playSong(this.tilemap.properties.music, Scumbag.MusicChannel.Music);
                }
                if (this.tilemap.properties.hasOwnProperty("ambience")) {
                    if (this.tilemap.properties.ambience == "none")
                        Scumbag.MusicManager.stopSong(Scumbag.MusicChannel.Ambience);
                    else
                        Scumbag.MusicManager.playSong(this.tilemap.properties.ambience, Scumbag.MusicChannel.Ambience);
                }
                else {
                    Scumbag.MusicManager.stopSong(Scumbag.MusicChannel.Ambience);
                }
                if (this.tilemap.properties.hasOwnProperty("background")) {
                    if (this.tilemap.properties.background != "") {
                        this.background = new Scumbag.Background(this.tilemap.properties.background, this.tilemap.width * this.tilemap.tileWidth, this.tilemap.height * this.tilemap.tileHeight, this.game);
                        this.background.update(this.camera.x, this.camera.y);
                    }
                }
                if (this.tilemap.properties.hasOwnProperty("overlay")) {
                    let overlayData = this.tilemap.properties.overlay.split(",");
                    this.overlayDriftX = overlayData[1];
                    this.overlayDriftY = overlayData[2];
                    this.overlay = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, overlayData[0]);
                    this.overlay.fixedToCamera = true;
                    this.overlay.blendMode = PIXI.blendModes.MULTIPLY;
                }
            }
            this.lives = this.game.add.tileSprite(0, 0, 60, 20, "life");
            this.lives.fixedToCamera = true;
            let device = Scumbag.InputManager.getInputDevice(0);
            device.addOnButtonPress(Scumbag.Button.Pause, pause, this);
            Scumbag.StateOfGame.startTimer();
        }
        render() {
        }
        shutdown() {
            let device = Scumbag.InputManager.getInputDevice(0);
            device.clear();
        }
        postGuiUpdate() {
            this.actors.sort('y', Phaser.Group.SORT_ASCENDING);
            if (this.background != null) {
                this.background.update(this.camera.x, this.camera.y);
            }
            if (this.overlay != null && this.overlay.tilePosition != null) {
                this.overlay.tilePosition.x += this.overlayDriftX * this.game.time.elapsedMS;
                this.overlay.tilePosition.y += this.overlayDriftY * this.game.time.elapsedMS;
            }
            if (this.hitCooldown > 0) {
                this.hitCooldown -= this.game.time.elapsedMS;
                if (this.hitCooldown <= 0)
                    this.player.blendMode = PIXI.blendModes.NORMAL;
            }
            for (let child of this.bullets.children) {
                if (child instanceof Scumbag.BulletGroup) {
                    this.game.physics.arcade.collide(child, this.collisionLayer, function (bullet) { bullet.kill(); });
                    this.game.physics.arcade.overlap(child, this.actors, function (bullet, actor) {
                        if (actor == child.master ||
                            actor == this.player) {
                            return false;
                        }
                        actor.damage(1);
                        bullet.kill();
                    }, null, this);
                    if (child.master != this.player) {
                        this.game.physics.arcade.overlap(child, this.player.heart, function (a, b) {
                            if (a instanceof Scumbag.Bullet)
                                a.kill();
                            if (b instanceof Scumbag.Bullet)
                                b.kill();
                            this.hurtPlayer();
                        }, null, this);
                    }
                }
            }
            this.lives.width = 20 * Scumbag.StateOfGame.parameters.lives;
            this.game.physics.arcade.collide(this.actors, this.collisionLayer);
            this.collideCooldown -= this.game.time.elapsedMS / 1000;
            this.game.physics.arcade.collide(this.actors, this.actors, touches, null, this);
            for (let i in this.regions) {
                if (this.regions[i].script != null) {
                    if (this.player.x > this.regions[i].x &&
                        this.player.x < this.regions[i].x + this.regions[i].width &&
                        this.player.y > this.regions[i].y &&
                        this.player.y < this.regions[i].y + this.regions[i].height) {
                        Scumbag.Script.setScript(this.regions[i].script);
                    }
                }
            }
        }
        onGuiStart() {
            this.player.updating = false;
            this.actors.setAll('updating', false);
            this.bullets.forEach(function (group) {
                group.forEach(function (bullet) {
                    bullet.savedGX = bullet.body.gravity.x;
                    bullet.savedGY = bullet.body.gravity.y;
                    bullet.savedVX = bullet.body.velocity.x;
                    bullet.savedVY = bullet.body.velocity.y;
                    bullet.body.velocity.set(0);
                    bullet.body.gravity.set(0);
                }, this);
            }, this);
        }
        onGuiEnd() {
            this.player.updating = true;
            this.actors.setAll('updating', true);
            this.bullets.forEach(function (group) {
                group.forEach(function (bullet) {
                    bullet.body.gravity.x = bullet.savedGX;
                    bullet.body.gravity.y = bullet.savedGY;
                    bullet.body.velocity.x = bullet.savedVX;
                    bullet.body.velocity.y = bullet.savedVY;
                }, this);
            }, this);
        }
        getActorByName(name) {
            for (let i = 0; i < this.actors.length; i++) {
                if (this.actors.getAt(i).name == name) {
                    return this.actors.getAt(i);
                }
            }
            return null;
        }
        restoreActors() {
            for (let i = 0; i < Scumbag.StateOfGame.parameters.actors.length; i++) {
                let dude = this.getActorByName(Scumbag.StateOfGame.parameters.actors[i].name);
                dude.x = Scumbag.StateOfGame.parameters.actors[i].x;
                dude.y = Scumbag.StateOfGame.parameters.actors[i].y;
            }
        }
        hurtPlayer() {
            if (this.hitCooldown > 0)
                return;
            this.game.sound.play("die");
            this.hitCooldown = 1500;
            this.player.blendMode = PIXI.blendModes.MULTIPLY;
            Scumbag.StateOfGame.parameters.lives -= 1;
            if (Scumbag.StateOfGame.parameters.lives <= 0)
                this.game.state.start("Gameover");
        }
        createBulletGroup(master, speed, size, key, sound) {
            return new Scumbag.BulletGroup(this.game, this.bullets, master, speed, size, key, sound);
        }
        addEffect(x, y, key, nFrames, framerate) {
            let effect = this.game.add.sprite(x, y, key);
            effect.anchor.setTo(0.5);
            let frames = [];
            for (let i = 0; i < nFrames; i++)
                frames.push(i);
            effect.animations.add("animation", frames, framerate);
            effect.animations.play("animation");
            effect.animations.currentAnim.killOnComplete = true;
            return effect;
        }
        setOverlay(key, driftX, driftY, time = 1000) {
            if (this.overlay != null)
                this.overlay.destroy();
            this.overlay = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, key);
            this.overlay.fixedToCamera = true;
            this.overlay.blendMode = PIXI.blendModes.MULTIPLY;
            this.overlayDriftX = driftX;
            this.overlayDriftY = driftY;
            this.overlay.alpha = 0;
            this.add.tween(this.overlay).to({ alpha: 1 }, time, Phaser.Easing.Default, true);
        }
        removeOverlay(time = 1000) {
            if (this.overlay == null)
                return;
            let tween = this.add.tween(this.overlay).to({ alpha: 0 }, time, Phaser.Easing.Default, true);
            tween.onComplete.add(function () { this.overlay.destroy(); }, this);
        }
    }
    Scumbag.Overworld = Overworld;
})(Scumbag || (Scumbag = {}));
;
var Scumbag;
(function (Scumbag) {
    class Preloader extends Phaser.State {
        preload() {
            this.preloadBar = this.add.sprite(0, 0, 'preloadBar');
            this.load.setPreloadSprite(this.preloadBar);
            this.game.load.pack("main", "pack.json");
            this.game.load.pack("scripts", "scriptPack.json");
        }
        create() {
            var tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(this.startMainMenu, this);
        }
        startMainMenu() {
            this.game.state.start('MainMenu', true, false);
        }
    }
    Scumbag.Preloader = Preloader;
})(Scumbag || (Scumbag = {}));
//# sourceMappingURL=game.js.map