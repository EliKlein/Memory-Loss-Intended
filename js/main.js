//Pragun Sharma
//psharma5

var GameStateHandler = { };

function CameraEnemy(xSpawn, ySpawn){
    this.sprite = game.add.sprite(xSpawn, ySpawn, "camera");
    this.sprite.anchor.setTo(0.5,0.5);
    this.face = function(direction){
        this.sprite.angle = (direction%45)-(45/2);
        this.sprite.frame = ((-Math.floor(direction/45))%8)+8;
    }
    return this;
}

GameStateHandler.Preloader = function() {};
GameStateHandler.Preloader.prototype = {
    preload: function() {
      console.log('Preloader: preload');
      this.load.path = 'assets/';
      //adding background
      this.load.image('Background', 'FloorBackground.png');
      //Loading into Asset cache
      this.load.spritesheet('player', 'Playersheet.png', 64, 64);
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
var shadowTexture, lightSprite;
var buttonpressed;
GameStateHandler.Play = function() {
  var player, map;
};
GameStateHandler.Play.prototype = {
  preload: function() {
    console.log('Play: preload');
    game.load.tilemap('map', 'GameMap.json', null, Phaser.Tilemap.TILED_JSON); //Loding the map with tiles
    game.load.image('tiles', 'Tiles.png'); //loading tileset image
    game.load.spritesheet('camera', 'camera V1.png', 32, 32, 8);
  },
  create: function() {
    console.log('Play: create');
    map = game.add.tilemap('map'); //creating the map
    this.add.image(0,0, 'Background');

    var game_width = map.widthInPixels;
    var game_height = map.heightInPixels;
    game.world.setBounds(0,0,game_width, game_height);
    map.addTilesetImage('Tiles', 'tiles');
    groundLayer = map.createLayer('TileLayer'); //creating a layer
    groundLayer.resizeWorld();
    game.time.advancedTiming = true;
    game.physics.startSystem(Phaser.Physics.ARCADE); //The type of physics system to start
    map.setCollisionBetween(0, 10000, true, groundLayer); //enabling collision for tiles used

    shadowTexture = game.add.bitmapData(game.width, game.height);
    lightSprite = game.add.image(game.camera.x, game.camera.y, shadowTexture);
    lightSprite.blendMode = Phaser.blendModes.MULTIPLY;


    //Creating the player sprite
    player = game.add.sprite(game.camera.width / 2, game.camera.height / 2, 'player');
    game.physics.arcade.enable(player);
    player.animations.add('up',[0,1,2,3,4,5,6,7,8],16);
    player.animations.add('left',[9,10,11,12,13,14,15,16,17],16);
    player.animations.add('down',[18,19,20,21,22,23,24,25,26],16);
    player.animations.add('right',[27,28,29,30,31,32,33,34,35],16);
    player.body.collideWorldBounds = true;
    //Setting up the sprite as a physical body in Arcade Physics Engine
    player.anchor.setTo(0.5,0.5);
    cursors = game.input.keyboard.createCursorKeys();
    game.camera.follow(player);

  },
  update: function() {
    game.physics.arcade.collide(player, groundLayer);
    lightSprite.reset(game.camera.x, game.camera.y);
    this.updateShadowTexture();
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    //make the player move
    //Key associated actions
    if (cursors.left.isDown) {
        player.scale.x = 1;
        player.body.velocity.x -= 200;
        player.animations.play('left');
    }
    else if(cursors.right.isDown) {
         player.body.velocity.x += 200;
         player.animations.play('right');
    }
    if(cursors.up.isDown) {
        player.body.velocity.y -= 200;
        if(player.body.velocity.x==0) player.animations.play('up');
    }
    else if(cursors.down.isDown) {
        player.body.velocity.y += 200;
        if(player.body.velocity.x==0) player.animations.play('down');
    }
    if(player.body.velocity.x != 0 && player.body.velocity.y != 0){
        player.body.velocity.x *= Math.sqrt(2)/2;
        player.body.velocity.y *= Math.sqrt(2)/2;
    }
    if(player.body.velocity.x == 0 && player.body.velocity.y == 0){
        player.animations.stop();
        player.frame = 9*(Math.floor(player.frame/9))
    }
 },
 updateShadowTexture: function() {
   shadowTexture.context.fillStyle = 'rgb(0, 0, 0)';
   shadowTexture.context.fillRect(0, 0, game.width,game.height);
   var radius = 130;
   heroY = player.y - game.camera.y;
   heroX = player.x - game.camera.x;
   if(cursors.left.isDown)
       heroX = player.x - 130 - game.camera.x;
   else if(cursors.right.isDown)
       heroX = player.x + 130 - game.camera.x;
   else if(cursors.down.isDown)
       heroY = player.y + 135 - game.camera.y;
   else if(cursors.up.isDown)
       heroY= player.y - 135 - game.camera.y;

   var gradient = shadowTexture.context.createRadialGradient(
            heroX, heroY, radius * 0.5, heroX, heroY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    shadowTexture.context.beginPath();
    shadowTexture.context.fillStyle = gradient;
    if(cursors.left.isDown||cursors.right.isDown||cursors.up.isDown||cursors.down.isDown)
        shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI*radius, false);
    shadowTexture.context.fill();
    shadowTexture.dirty = true;
  },
};


  var game = new Phaser.Game(1024, 576, Phaser.AUTO);
  game.state.add('Preloader', GameStateHandler.Preloader);
  game.state.add('Play', GameStateHandler.Play);
  game.state.start('Preloader');
