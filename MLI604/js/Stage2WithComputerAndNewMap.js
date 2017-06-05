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
      this.load.image('BackgroundStage2', 'FloorBackgroundVertical.png');
      this.load.image('Pathway', 'FloorBackground.png');
      this.load.image('prisoner', 'prisoner1.png');
      this.game.load.atlas('guards', 'guard.png', 'guards.json');
      this.game.load.atlas('player', 'atlas.png', 'atlas.json');
      this.load.tilemap('map', 'GameMap.json', null, Phaser.Tilemap.TILED_JSON); //Loding the map with tiles
      this.load.image('Menu_Background', 'Menu_Background.png');
      this.load.image('button', 'grey_button.png');
      this.load.bitmapFont('font_game', "font_game.png", "font_game.fnt")
  },
  create: function() {
    console.log('Preloader: create');
    //Preventing the key to affect browser view
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
    Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.ENTER, Phaser.Keyboard.SPACEBAR]);

  },
  update: function() {
  this.state.start('Menu');
 }
};


GameStateHandler.Menu = function() {
  var button_play, button_, textplay, textopt;
};
GameStateHandler.Menu.prototype = {
  preload: function() {},
  create: function() {
    var Menu_backGround = this.add.image(0,0, 'Menu_Background');
    Menu_backGround.alpha = 0.35;

    button_play = game.add.button(game.world.centerX - 95, 200, 'button', this.actionOnClickplay, this);
    textplay = game.add.bitmapText(button_play.centerX - 25, button_play.centerY - 12, 'font_game', 'PLAY', 20);
    button_ = game.add.button(game.world.centerX - 95, 250, 'button', this.actionOnClickopt, this);
    textopt = game.add.bitmapText(button_.centerX - 25, button_.centerY - 12, 'font_game', 'HELP', 20);

  },
  actionOnClickplay: function() {
    this.state.start('Play');
  },
  actionOnClickopt: function() {
    this.state.start('Options_Screen');
  }
};

GameStateHandler.Options_Screen = function() {
  var button_back, text_back, game_description, game_controls;
};
GameStateHandler.Options_Screen.prototype = {
    create: function() {
      var Menu_backGround = this.add.image(0,0, 'Menu_Background');
      Menu_backGround.alpha = 0.35;
      game_controls = "Use Arrow keys to move. Use your mouse to rotate the direction of the light. "
      game_description = "You were scammed and you ended up being in the cyber world where everybody who \n has been" +
      "scammed in the past is glued to the ground. " +
      "Your friends are stuck here waiting \n for you to rescue them. However, there are imposters disguised as your friends. " +
      "Look out \n for their stories before you believe them."
      button_back = game.add.button(game.world.centerX - 95, 400, 'button', this.actionOnClickback, this);
      text_back = game.add.bitmapText(button_back.centerX - 28, button_back.centerY - 12, 'font_game', 'BACK', 20);
      var controlstext = game.add.bitmapText(80, 350, 'font_game', game_controls, 20);
      controlstext.align = 'center';
      var descp_text = game.add.bitmapText(50, 150, 'font_game', game_description, 20,);
      descp_text.align = 'center';

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
var changeLevelKey;
var prisoner_obj1;
var groupText;
var currPlayerX;
var currPlayerY;

var emptySpaces = {
  'x': [],
  'y': []
};

GameStateHandler.Level2 = function() {
  var computers;
};
GameStateHandler.Level2.prototype = {
  preload: function() {
    console.log('Level2: preload');
    this.load.tilemap('map2', 'GameMapStage2.json', null, Phaser.Tilemap.TILED_JSON); //Loding the map with tiles
    game.load.image('tiles', 'Tiles.png'); //loading tileset image
    this.load.image('computer' , 'computer.png');

  },
  create: function() {
    console.log('Play: create');
    map2 = game.add.tilemap('map2'); //creating the map
    this.add.image(0,0, 'BackgroundStage2');
    var game_width = map2.widthInPixels;
    var game_height = map2.heightInPixels;
    game.world.setBounds(0,0,game_width, game_height);
    map2.addTilesetImage('TileSet', 'tiles');
    groundLayer = map2.createLayer('TileLayer'); //creating a layer
    groundLayer.resizeWorld();
    game.time.advancedTiming = true;
    game.physics.startSystem(Phaser.Physics.ARCADE); //The type of physics system to start
    map2.setCollisionBetween(0, 10000, true, groundLayer); //enabling collision for tiles used
    groupText = game.add.group();
    //Adding each tile to an array
    for(var x = 0; x < map2.width; ++x) {
      for(var y = 0; y < map2.height; ++y) {
        if(map2.getTile(x,y) != null)
          walls.push(map2.getTile(x,y));
      }
    }


    computers = game.add.group();
    computer_obj1 = game.add.sprite(128, 320, 'computer');
    game.physics.arcade.enable(computer_obj1);
    computer_obj1.body.immovable = true;
    computers.add(computer_obj1);
    computer_obj2 = game.add.sprite(128, 640, 'computer');
    game.physics.arcade.enable(computer_obj2);
    computer_obj2.body.immovable = true;
    computers.add(computer_obj2);
    computer_obj3 = game.add.sprite(512, 320, 'computer');
    game.physics.arcade.enable(computer_obj3);
    computer_obj3.body.immovable = true;
    computers.add(computer_obj3);
    computer_obj4 = game.add.sprite(608, 864, 'computer');
    game.physics.arcade.enable(computer_obj4);
    computer_obj4.body.immovable = true;
    computers.add(computer_obj4);
    computer_obj5 = game.add.sprite(1568, 320, 'computer');
    game.physics.arcade.enable(computer_obj5);
    computer_obj5.body.immovable = true;
    computers.add(computer_obj5);
    computer_obj6 = game.add.sprite(1760, 992, 'computer');
    game.physics.arcade.enable(computer_obj6);
    computer_obj6.body.immovable = true;
    computers.add(computer_obj6);

    /*
    shadowTexture = game.add.bitmapData(game.width, game.height);
    lightSprite = game.add.image(game.camera.x, game.camera.y, shadowTexture);
    lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
    */



    //Creating the player sprite
    player = game.add.sprite(game.camera.width / 2 - 440, 480, 'player');
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
    game.physics.arcade.collide(player, computers);
    //lightSprite.reset(game.camera.x, game.camera.y);
    //this.updateShadowTexture();
   if(showText) console.log("Show Text");
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
};

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
    groupText = game.add.group();
    //Adding each tile to an array
    for(var x = 0; x < map.width; ++x) {
      for(var y = 0; y < map.height; ++y) {
        if(map.getTile(x,y) != null)
          walls.push(map.getTile(x,y));
      }
    }
    prisoners = game.add.group();
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
    changeLevelKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  },
  update: function() {
    game.physics.arcade.collide(player, groundLayer);
    game.physics.arcade.collide(player, prisoners, this.showText, null, this);
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
  if(cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)
  groupText.removeAll(true);

  if(enterKey.isDown && isTouching == true) {
      //function to make the prisoner follow the player
      this.followPlayer(prisoner_obj1, text);
   } else {
     prisoners.setAll('body.velocity.x', 0);
     prisoners.setAll('body.velocity.y', 0);
   }
    currPlayerX = Math.floor(player.x/32);
    currPlayerY = Math.floor(player.y/32);
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
    //if changeLevelKey is pressed then load stage 2
    if(changeLevelKey.isDown) {
      console.log("Go to Stage 2");
      this.state.start('Level2');
    }


 },
//ADDED
 showText: function() {
       console.log("called");
       var indexForChild = Phaser.ArrayUtils.getRandomItem(prisonerIndexArray, 0, prisonerIndexArray.length-1);
       var ChildPicked = prisoners.getChildAt(indexForChild);
       text = game.add.text(0, 0, "Hey, I am stuck in this world, please give me my freedom back", style);
       text.anchor.set(0.5);
       text.x = Math.floor(ChildPicked.x + ChildPicked.width / 2);
       text.y = Math.floor(ChildPicked.y + ChildPicked.height / 2) - 50;
       groupText.add(text);
       isTouching = true;

   },
//ADDED
 followPlayer: function(prisoner, text) {
   console.log("Follow the player");
   isTouching = false;
   var posX = Math.floor(prisoner.x/32);
   var posY = Math.floor(prisoner.y/32);
   //Check adjascent Squares
   if(!map.getTile(posX - 1, posY)) {
     emptySpaces.x.push(posX-1);
     emptySpaces.y.push(posY);
     game.physics.arcade.moveToXY(prisoner, posX - 1, posY);

   }

  console.log(emptySpaces.x + "  " + emptySpaces.y);
  console.log("Player " + currPlayerX, currPlayerY);
  console.log("Prisoner " + prisoner.x, prisoner.y);

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
   ///////////////////////////////////////////////////////////////////////////////
   //CHANGE THIS PART
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
    /////////////////////////////////////////////////////////////////////////////////////

    //When the player stops the draw a cricle of light around the player so that prisoner is visible
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

GameStateHandler.GameOver = function() {
  var button_restart, text_restart;
};
GameStateHandler.GameOver.prototype = {
  create: function() {
    var Menu_backGround = this.add.image(0,0, 'Menu_Background');
    Menu_backGround.alpha = 0.35;
    button_restart = game.add.button(game.world.centerX - 95, 200, 'button', this.actionOnClickrestart, this);
    text_restart = game.add.bitmapText(button_play.centerX - 58, button_play.centerY - 12, 'font_game', 'PLAY AGAIN', 20);
    game.add.bitmapText(425, 100, 'font_game', 'FeedBack on the wrong story that was picked', 20);
  },
  actionOnClickrestart: function() {
    this.state.start('Menu');
  }
};


  var game = new Phaser.Game(1024, 576, Phaser.AUTO);
  game.state.add('Preloader', GameStateHandler.Preloader);
  game.state.add('Menu', GameStateHandler.Menu);
  game.state.add('Options_Screen', GameStateHandler.Options_Screen);
  game.state.add('Play', GameStateHandler.Play);
  game.state.add('GameOver', GameStateHandler.GameOver);
  game.state.add('Level2', GameStateHandler.Level2);
  game.state.start('Preloader');
