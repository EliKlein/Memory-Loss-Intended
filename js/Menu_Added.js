//Pragun Sharma
//psharma5
//Updated Main 05/25/2017
var GameStateHandler = { };

GameStateHandler.Preloader = function() {};
GameStateHandler.Preloader.prototype = {
    preload: function() {
      console.log('Preloader: preload');
      //Loading into Asset cache
      this.load.path = 'assets/image/';
      //adding background
      this.load.image('Background', 'FloorBackgroundBigger.png');
      this.load.image('prisoner', 'prisoner1.png');
      this.game.load.atlas('guards', 'guard.png', 'guards.json');
      this.game.load.atlas('player', 'atlas.png', 'atlas.json');
      this.load.tilemap('map', 'GameMap.json', null, Phaser.Tilemap.TILED_JSON); //Loding the map with tiles
      this.load.image('Menu_Background', 'Menu_Background.png');
      this.load.image('button', 'grey_button.png');
  },
  create: function() {
    console.log('Preloader: create');
    //Preventing the key to affect browser view
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
    Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.ENTER]);

  },
  update: function() {
  this.state.start('Menu');
 }
};


GameStateHandler.Menu = function() {
  var button_play, button_options, textplay, textopt;
};
GameStateHandler.Menu.prototype = {
  preload: function() {},
  create: function() {
    var Menu_backGround = this.add.image(0,0, 'Menu_Background');
    Menu_backGround.alpha = 0.35;
    button_play = game.add.button(game.world.centerX - 95, 200, 'button', this.actionOnClickplay, this);
    textplay = game.add.text(button_play.centerX - 25, button_play.centerY - 12, 'PLAY', {fontSize: '20px', fill: 'black'});
    button_options = game.add.button(game.world.centerX - 95, 250, 'button', this.actionOnClickopt, this);
    textopt = game.add.text(button_options.centerX - 45, button_options.centerY - 12, 'OPTIONS', {fontSize: '20px', fill: 'black'});

  },
  update: function() {
    if(button_play.input.pointerOver()) {
      textplay.fill = 'green';
    } else {
      textplay.fill = 'black';
    }
    if(button_options.input.pointerOver()) {
      textopt.fill = 'green';
    } else {
      textopt.fill = 'black';
    }
  },
  actionOnClickplay: function() {
    this.state.start('Play');
  },
  actionOnClickopt: function() {
    this.state.start('Options_Screen');
  }
};

GameStateHandler.Options_Screen = function() {
  var button_back, text_back;
};
GameStateHandler.Options_Screen.prototype = {
    create: function() {
      var Menu_backGround = this.add.image(0,0, 'Menu_Background');
      Menu_backGround.alpha = 0.35;
      button_back = game.add.button(game.world.centerX - 95, 200, 'button', this.actionOnClickback, this);
      text_back = game.add.text(button_play.centerX - 28, button_play.centerY - 12, 'BACK', {fontSize: '20px', fill: 'black'});
      game.add.text(425, 100, 'Game Description', {fontSize: '20px', fill: 'white'});
    },
    update: function() {
      if(button_back.input.pointerOver()) {
        text_back.fill = 'green';
      } else {
        text_back.fill = 'black';
      }
    },
    actionOnClickback: function() {
       this.state.start('Menu');
    }

};


var shadowTexture, lightSprite, raycastTexture;
var buttonpressed;
var text;
var style;
var prisoners;
var prisonerIndexArray = [];
var showText;
var isTouching;
var ray;
var walls = [];
var enemiesGroup;
var enemiesIndexArray = [];
var enterKey;
var prisoner_obj1;

GameStateHandler.Play = function() {
  var player, map, camera;
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
    //Adding each tile to an array
    for(var x = 0; x < map.width; ++x) {
      for(var y = 0; y < map.height; ++y) {
        if(map.getTile(x,y) != null)
          walls.push(map.getTile(x,y));
      }
    }

    prisoners = game.add.group();
    prisoners.enableBody = true;
    prisoner_obj1 = prisoners.create(200,100, 'prisoner');
    game.physics.arcade.enable(prisoner_obj1);
    prisoner_obj1.body.immovable = true;
    prisoner_obj1.scale.setTo(0.27);
    prisonerIndexArray.push(prisoners.getChildIndex(prisoner_obj1));
    style = { font: "12px Arial", wordWrap: true,
    wordWrapWidth: 300, align: "center", backgroundColor: "white" };


    //////////////////////////////////////////////////////////////////////////////////////////////
    //ADDED
    enemiesGroup = game.add.group();

    var enemies = game.add.sprite(game.camera.width / 2 + 230, game.camera.height / 2 - 25, 'guards');
    enemies.frame = 0;
    game.physics.arcade.enable(enemies);
    enemies.body.collideWorldBounds = true;
    enemies.body.immovable = true;
    enemies.animations.add('movingdown', Phaser.Animation.generateFrameNames('sprite', 0, 3), 5, true);
    enemies.animations.add('movingup', Phaser.Animation.generateFrameNames('sprite', 13, 15), 5, true);
    enemiesGroup.add(enemies);
    enemies.animations.play('movingdown');
    enemies.body.velocity.y += 60;

    var enemies2 = game.add.sprite(game.camera.width / 2 + 600, game.camera.height / 2 - 25, 'guards');
    enemies2.frame = 0;
    game.physics.arcade.enable(enemies2);
    enemies2.body.collideWorldBounds = true;
    enemies2.body.immovable = true;
    enemies2.animations.add('movingdown', Phaser.Animation.generateFrameNames('sprite', 0, 3), 5, true);
    enemies2.animations.add('movingup', Phaser.Animation.generateFrameNames('sprite', 13, 15), 5, true);
    enemiesGroup.add(enemies2);
    enemies2.animations.play('movingdown');
    enemies2.body.velocity.y += 60;

    var enemies3 = game.add.sprite(game.camera.width / 2 + 700, game.camera.height / 2, 'guards');
    enemies3.frame = 10;
    game.physics.arcade.enable(enemies3);
    enemies3.body.collideWorldBounds = true;
    enemies3.body.immovable = true;
    enemies3.animations.add('movingleft', Phaser.Animation.generateFrameNames('sprite', 5, 7), 5, true);
    enemies3.animations.add('movingright', Phaser.Animation.generateFrameNames('sprite', 9, 11), 5, true);
    enemiesGroup.add(enemies3);
    enemies3.animations.play('movingright');
    enemies3.body.velocity.x += 60;

    var enemies4 = game.add.sprite(game.camera.width / 2 - 340, game.camera.height / 2 - 30, 'guards');
    enemies4.frame = 8;
    game.physics.arcade.enable(enemies4);
    enemies4.body.collideWorldBounds = true;
    enemies4.body.immovable = true;
    enemies4.animations.add('movingleft', Phaser.Animation.generateFrameNames('sprite', 5, 7), 5, true);
    enemies4.animations.add('movingright', Phaser.Animation.generateFrameNames('sprite', 9, 11), 5, true);
    enemiesGroup.add(enemies4);
    enemies4.animations.play('movingleft');
    enemies4.body.velocity.x -= 60;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    /*
    shadowTexture = game.add.bitmapData(game.width, game.height);
    lightSprite = game.add.image(game.camera.x, game.camera.y, shadowTexture);
    lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
    */

    raycastTexture = game.add.bitmapData(game.width, game.height);
    raycastTexture.context.fillStyle = 'rgb(255,255,255)';
    raycastTexture.context.strokeStyle = 'rgb(255,255,255)';
    game.add.image(0,0,raycastTexture);



    //Creating the player sprite
    player = game.add.sprite(game.camera.width / 2 - 440, game.camera.height / 2 + 190, 'player');
    //Setting up the sprite as a physical body in Arcade Physics Engine
    game.physics.arcade.enable(player);
    player.frame = 75;
    player.anchor.setTo(0.5,0.5);
    player.body.collideWorldBounds = true;
    player.animations.add('movingleft', Phaser.Animation.generateFrameNames('survivor-move_flashlight_', 0, 19), 60, true);
    cursors = game.input.keyboard.createCursorKeys();
    game.camera.follow(player);
    cursors = game.input.keyboard.createCursorKeys();
    enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

  },
  update: function() {
    game.physics.arcade.collide(player, groundLayer);
    showText = game.physics.arcade.collide(player, prisoners);
    game.physics.arcade.collide(prisoners, groundLayer);
    game.physics.arcade.collide(player, enemiesGroup, this.zeroVelocity, null, this); //ADDED
    game.physics.arcade.collide(enemiesGroup, groundLayer, this.changeAnimation, null, this); //ADDED
    raycastTexture.context.clearRect(0,0, game.width, game.height);

    for (var i = 0; i < enemiesGroup.children.length; i++) {
      var enemyChild = enemiesGroup.getChildAt(i);
      ray = new Phaser.Line(enemyChild.x, enemyChild.y, player.x, player.y);
      //Test if any walls intersect the ray
      var intersect = this.getWallIntersection(ray);
      this.createRay(enemiesGroup.getChildAt(i), intersect);
   }
    //lightSprite.reset(game.camera.x, game.camera.y);
    //this.updateShadowTexture();


    if(showText) {
      var indexForChild = Phaser.ArrayUtils.getRandomItem(prisonerIndexArray, 0, prisonerIndexArray.length-1);
      var ChildPicked = prisoners.getChildAt(indexForChild);
      text = game.add.text(0, 0, "Hey, I am stuck in this world, please give me my freedom back", style);
      text.anchor.set(0.5);
      text.x = Math.floor(ChildPicked.x + ChildPicked.width / 2);
      text.y = Math.floor(ChildPicked.y + ChildPicked.height / 2) - 50;
      isTouching = true;
  }

  if(enterKey.justPressed()) {
      game.world.remove(text);
      isTouching = false;
      game.physics.arcade.moveToXY(prisoner_obj1, player.x - 10, player.y);
   }


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
 //ADDED
 zeroVelocity: function(player, enemies) {
   enemies.body.velocity.y = 0;
   enemies.body.velocity.x = 0;
   enemies.animations.stop();
   if(enemies.animations.currentAnim.name == "movingdown") enemies.frame = 0;
   if(enemies.animations.currentAnim.name == "movingup") enemies.frame = 12;
   if(enemies.animations.currentAnim.name == "movingleft") enemies.frame = 8;
   if(enemies.animations.currentAnim.name == "movingright") enemies.frame = 9;

 },
 //ADDED
 changeAnimation: function(enemies, layer) {

   enemies.animations.stop();
     if(enemies.animations.currentAnim.name == "movingdown") {
       enemies.frame = 12;
       enemies.animations.play('movingup');
       enemies.body.velocity.y -= 60;
     }
     else if(enemies.animations.currentAnim.name == "movingup") {
       enemies.frame = 0;
       enemies.animations.play('movingdown');
       enemies.body.velocity.y += 60;
     }
     else if(enemies.animations.currentAnim.name == "movingright") {
       enemies.frame = 8;
       enemies.animations.play('movingleft');
       enemies.body.velocity.x -= 60;
     }
     else {
       enemies.frame = 10;
       enemies.animations.play('movingright');
       enemies.body.velocity.x += 60;
     }

 },
//ADDED
 createRay: function(enemyChild, intersect) {

 if(!intersect) {
     //Draw a line from the guard to the player
     raycastTexture.context.beginPath();
     raycastTexture.context.moveTo(enemyChild.x, enemyChild.y);
     raycastTexture.context.lineTo(player.x, player.y);
     raycastTexture.context.stroke();
     raycastTexture.dirty = true;
   } else {

     raycastTexture.context.beginPath();
     raycastTexture.context.moveTo(intersect.x, intersect.y);
     raycastTexture.context.lineTo(enemyChild.x, enemyChild.y);
     raycastTexture.context.stroke();
     raycastTexture.dirty = true;
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
    if(player.body.velocity.x == 0 && player.body.velocity.y == 0 && isTouching == true) {

      shadowTexture.context.arc(heroX, heroY-10, smallradius, 0, Math.PI*smallradius, false);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      shadowTexture.context.fillStyle = gradient;

    }
    shadowTexture.context.fill();
    shadowTexture.dirty = true;
  },

getWallIntersection: function(ray) {
  var distanceToWall = Number.POSITIVE_INFINITY;
  var closestIntersection = null;
  for(var k = 0; k < walls.length; k++) {

    // Create an array of lines that represent the four edges of each wall
    var lines = [
        new Phaser.Line(walls[k].x*32, walls[k].y*32, walls[k].x*32 + walls[k].width, walls[k].y*32),
        new Phaser.Line(walls[k].x*32, walls[k].y*32, walls[k].x*32, walls[k].y*32 + walls[k].height),
        new Phaser.Line(walls[k].x*32 + walls[k].width, walls[k].y*32,
          walls[k].x*32 + walls[k].width, walls[k].y*32 + walls[k].height),
        new Phaser.Line(walls[k].x*32, walls[k].y*32 + walls[k].height,
          walls[k].x*32 + walls[k].width, walls[k].y*32 + walls[k].height)
   ];

  //Test each of the edges in this wall against the ray.
  //If the ray intersects any of the edges then the wall must be in the way.
   for(var j = 0; j < lines.length; j++) {
     var intersect = Phaser.Line.intersects(ray, lines[j]);

        if (intersect) {
        // Find the closest intersection
        distance =
            this.game.math.distance(player.x, player.y, intersect.x, intersect.y);
            if (distance < distanceToWall) {
                distanceToWall = distance;
                closestIntersection = intersect;
        }
     }
   }
 }
  return closestIntersection;

 },
};


  var game = new Phaser.Game(1024, 576, Phaser.AUTO);
  game.state.add('Preloader', GameStateHandler.Preloader);
  game.state.add('Menu', GameStateHandler.Menu);
  game.state.add('Options_Screen', GameStateHandler.Options_Screen);
  game.state.add('Play', GameStateHandler.Play);
  game.state.start('Preloader');
