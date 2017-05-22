var GameStateHandler = { };
var game = new Phaser.Game(1024, 576, Phaser.AUTO);
var shadowObj;
var buttonpressed;
var text;
var style;
var prisoners;
var prisonerArray = [];
var showText;
var PLAYER_SPEED = 150;

class Player{
    constructor(x, y){
        //Creating the player sprite
        var player = game.add.sprite(x, y, 'player');
        //Setting up the sprite as a physical body in Arcade Physics Engine
        game.physics.arcade.enable(player);
        player.frame = 75;
        player.anchor.setTo(0.5,0.5);
        player.body.collideWorldBounds = true;
        player.animations.add('moving', Phaser.Animation.generateFrameNames('survivor-move_flashlight_', 0, 19), 60, true);
        this.sprite = player;
    }
    update(cursors){
        //make the player move
        this.sprite.body.velocity.x = 0;
        this.sprite.body.velocity.y = 0;
        if (cursors.left.isDown) {
            this.sprite.body.velocity.x = -PLAYER_SPEED;
            this.sprite.animations.play('moving');
        } else if (cursors.right.isDown) {
            this.sprite.body.velocity.x = PLAYER_SPEED;
            this.sprite.animations.play('moving');
        }
        if (cursors.up.isDown) {
            this.sprite.body.velocity.y = -PLAYER_SPEED;
            this.sprite.animations.play('moving');
            if (this.sprite.body.velocity.x != 0){
                this.sprite.body.velocity.x *= Math.sqrt(2)/2;
                this.sprite.body.velocity.y *= Math.sqrt(2)/2;
            }
        } else if (cursors.down.isDown) {
            this.sprite.body.velocity.y = PLAYER_SPEED;
            this.sprite.animations.play('moving');
            if (this.sprite.body.velocity.x != 0){
                this.sprite.body.velocity.x *= Math.sqrt(2)/2;
                this.sprite.body.velocity.y *= Math.sqrt(2)/2;
            }
        }
        if(this.sprite.body.velocity.x == 0 && this.sprite.body.velocity.y == 0){
            this.sprite.animations.stop();
        } else {
            this.sprite.angle = Math.atan(this.sprite.body.velocity.y / this.sprite.body.velocity.x)*180/Math.PI;
            if(this.sprite.body.velocity.x < 0) this.sprite.angle += 180;
        }
    }
}


class Prisoner{
    constructor(x, y, prisonerGroup){
        this.sprite = prisoners.create(x, y, 'prisoner');
        this.sprite.body.immovable = true;
        //scale to match player better
        this.sprite.scale.setTo(0.27);
        
        prisonerArray.push(this);
    }
}

class Shadows{
    constructor(){
        this.shadowTexture = game.add.bitmapData(game.width, game.height);
        this.lightSprite = game.add.image(game.camera.x, game.camera.y, this.shadowTexture);
        this.lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
    }
    update(playerSprite, cursors) {
        var radius = 130;
        var smallradius = 55;
        this.shadowTexture.context.fillStyle = 'rgb(0, 0, 0)';
        this.shadowTexture.context.fillRect(0, 0, game.width,game.height);
        heroX = playerSprite.x - game.camera.x + (playerSprite.body.velocity.x * radius / PLAYER_SPEED);
        heroY = playerSprite.y - game.camera.y + (playerSprite.body.velocity.y * radius / PLAYER_SPEED);

        var gradient = this.shadowTexture.context.createRadialGradient(heroX, heroY, radius * 0.5, heroX, heroY, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        this.shadowTexture.context.beginPath();
        this.shadowTexture.context.fillStyle = gradient;
        if(cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)
            this.shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI*radius, false);
        if(playerSprite.body.velocity.x == 0 && playerSprite.body.velocity.y == 0)
            this.shadowTexture.context.arc(heroX, heroY-10, smallradius, 0, Math.PI*smallradius, false);
        this.shadowTexture.context.fill();
        this.shadowTexture.dirty = true;
    }
}

function makeMap(){
    //creating the map (I feel like maybe this should go in its own class, but it might take more work than the other things)
    var m = game.add.tilemap('map'); 
    game.add.image(0,0, 'Background');
    game.world.setBounds(0,0,m.widthInPixels, m.heightInPixels);
    map.addTilesetImage('Tiles', 'tiles');
    groundLayer = map.createLayer('TileLayer'); //creating a layer
    groundLayer.resizeWorld();
    map.setCollisionBetween(0, 10000, true, groundLayer); //enabling collision for tiles used
}

GameStateHandler.Preloader = function() {};
GameStateHandler.Preloader.prototype = {
    preload: function() {
      console.log('Preloader: preload');
      //Loading into Asset cache
      this.load.path = 'assets/';
      //adding background
      this.load.image('Background', 'FloorBackground.png');
      this.load.image('prisoner', 'prisoner1.png');
      this.game.load.atlas('player', 'atlas.png', 'atlas.json');
      this.load.tilemap('map', 'GameMap.json', null, Phaser.Tilemap.TILED_JSON); //Loding the map with tiles

  },
  create: function() {
    console.log('Preloader: create');
    //Preventing the key to affect browser view
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
    Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.SPACEBAR]);

  },
  update: function() {
  this.state.start('Play');
 }
};
GameStateHandler.Play = function() {
  var player, map;
};
GameStateHandler.Play.prototype = {
    preload: function() {
        console.log('Play: preload');
        game.load.image('tiles', 'Tiles.png'); //loading tileset image
    },
    create: function() {
        console.log('Play: create');

        
        game.time.advancedTiming = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);

        map = makeMap();

        //creating prisoner(s)
        prisoners = game.add.group();
        prisoners.enableBody = true;
        new Prisoner(200, 100, prisoners);

        //text style for text popups
        style = {
            font: "12px Arial",
            wordWrap: true,
            wordWrapWidth: 300,
            align: "center",
            backgroundColor: "white"
        };

        player = new Player(game.camera.width / 2, game.camera.height / 2);

        shadowObj = new Shadows();

        game.camera.follow(player.sprite);

        cursors = game.input.keyboard.createCursorKeys();
    },
    update: function() {
        game.physics.arcade.collide(player.sprite, groundLayer);
        showText = game.physics.arcade.collide(player.sprite, prisoners);
        lightSprite.reset(game.camera.x, game.camera.y);
        shadowObj.update(player.sprite, cursors);
        if(showText) {
            var selected = Phaser.ArrayUtils.getRandomItem(prisonerArray, 0, prisonerArray.length-1);
            var ChildPicked = selected.sprite;
            text = game.add.text(0, 0, "Hey, I am stuck in this world, please give me my freedom back", style);
            text.anchor.set(0.5);
            text.x = Math.floor(ChildPicked.x + ChildPicked.width / 2);
            text.y = Math.floor(ChildPicked.y + ChildPicked.height / 2) - 50;
        }

        if(cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)
            game.world.remove(text);

        player.update(cursors);
   }
};


game.state.add('Preloader', GameStateHandler.Preloader);
game.state.add('Play', GameStateHandler.Play);
game.state.start('Preloader');
