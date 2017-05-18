//Pragun Sharma
//psharma5

var GameStateHandler = { };

GameStateHandler.Preloader = function() {};
GameStateHandler.Preloader.prototype = {
    preload: function() {
      console.log('Preloader: preload');
      //Loading into Asset cache
      this.load.path = 'assets/image/';
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
var shadowTexture, lightSprite;
var buttonpressed;
var text;
var style;
var prisoners;
var childIndexArray = [];
var showText;
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
    prisoners = game.add.group();
    prisoners.enableBody = true;
    var prisoner_obj1 = prisoners.create(200,100, 'prisoner');
    prisoner_obj1.body.immovable = true;
    prisoner_obj1.scale.setTo(0.27);
    childIndexArray.push(prisoners.getChildIndex(prisoner_obj1));
    style = { font: "12px Arial", wordWrap: true,
    wordWrapWidth: 300, align: "center", backgroundColor: "white" };


    shadowTexture = game.add.bitmapData(game.width, game.height);
    lightSprite = game.add.image(game.camera.x, game.camera.y, shadowTexture);
    lightSprite.blendMode = Phaser.blendModes.MULTIPLY;


    //Creating the player sprite
    player = game.add.sprite(game.camera.width / 2, game.camera.height / 2, 'player');
    //Setting up the sprite as a physical body in Arcade Physics Engine
    game.physics.arcade.enable(player);
    player.frame = 75;
    player.anchor.setTo(0.5,0.5);
    player.body.collideWorldBounds = true;
    player.animations.add('movingleft', Phaser.Animation.generateFrameNames('survivor-move_flashlight_', 0, 19), 60, true);

    cursors = game.input.keyboard.createCursorKeys();
    game.camera.follow(player);
    cursors = game.input.keyboard.createCursorKeys();

  },
  update: function() {
    game.physics.arcade.collide(player, groundLayer);
    showText = game.physics.arcade.collide(player, prisoners);
    lightSprite.reset(game.camera.x, game.camera.y);
    this.updateShadowTexture();
    if(showText) {
      var indexForChild = Phaser.ArrayUtils.getRandomItem(childIndexArray, 0, childIndexArray.length-1);
      var ChildPicked = prisoners.getChildAt(indexForChild);
      text = game.add.text(0, 0, "Hey, I am stuck in this world, please give me my freedom back", style);
      text.anchor.set(0.5);
      text.x = Math.floor(ChildPicked.x + ChildPicked.width / 2);
      text.y = Math.floor(ChildPicked.y + ChildPicked.height / 2) - 50;
    }

    if(cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)
    game.world.remove(text);

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    //make the player move
    //Key associated actions
    if (cursors.left.isDown) {
        player.scale.x = -1;
        player.angle = 0;
        player.body.velocity.x -= 155;
        player.animations.play('movingleft');
    }
    else if(cursors.right.isDown) {
        player.scale.x = 1;
         player.angle = 0;
         player.body.velocity.x += 155;
         player.animations.play('movingleft');
    }
    else if(cursors.up.isDown) {
      if(player.scale.x == 1)
      player.angle = -90;
      if(player.scale.x == -1)
      player.angle = 90;
      player.body.velocity.y -= 150;
      player.animations.play('movingleft');

    }
    else if(cursors.down.isDown) {
      if(player.scale.x == -1)
      player.angle = -90;
      if(player.scale.x == 1)
      player.angle = 90;
      player.body.velocity.y += 150;
      player.animations.play('movingleft');


    }
    else {
      player.animations.stop();

    }
 },

 updateShadowTexture: function() {
   shadowTexture.context.fillStyle = 'rgb(0, 0, 0)';
   shadowTexture.context.fillRect(0, 0, game.width,game.height);
   var radius = 130;
   var smallradius = 55;
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
    if(cursors.left.isDown)
    shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI*radius, false);
    if(cursors.right.isDown)
    shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI*radius, false);
    if(cursors.up.isDown)
    shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI*radius, false);
    if(cursors.down.isDown)
    shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI*radius, false);
    if(player.body.velocity.x == 0 && player.body.velocity.y == 0)
    shadowTexture.context.arc(heroX, heroY-10, smallradius, 0, Math.PI*smallradius, false);
    shadowTexture.context.fill();
    shadowTexture.dirty = true;
  },


};


  var game = new Phaser.Game(1024, 576, Phaser.AUTO);
  game.state.add('Preloader', GameStateHandler.Preloader);
  game.state.add('Play', GameStateHandler.Play);
  game.state.start('Preloader');
