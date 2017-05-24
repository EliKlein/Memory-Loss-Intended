var GameStateHandler = {};
var game = new Phaser.Game(1024, 576, Phaser.AUTO);
var map;
var walls;
var shadowObj;
var lightTexture;
var lightSprite;
var buttonpressed;
var text;
var style;
var prisoners;
var prisonerArray = [];
var testCamera;
var showText;
var player;
var PLAYER_SPEED = 150;
var randomX;
var randomY;

class Player{
    constructor(x, y){
        this.light = new LightSource(this, 225, 55);
        //Creating the player sprite
        var player = game.add.sprite(x, y, 'player');
        //Setting up the sprite as a physical body in Arcade Physics Engine
        game.physics.arcade.enable(player);
        player.frame = 75;
        player.anchor.setTo(0.5, 0.5);
        player.body.collideWorldBounds = true;
        player.animations.add('moving', Phaser.Animation.generateFrameNames('survivor-move_flashlight_', 0, 19), 60, true);
        this.sprite = player;
        player.body.onCollide = new Phaser.Signal();//might want to move this to prisoner class
        player.body.onCollide.add(showText, this);
    }
    update(cursors) {
        
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
            if (this.sprite.body.velocity.x != 0) {
                this.sprite.body.velocity.x *= Math.sqrt(2) / 2;
                this.sprite.body.velocity.y *= Math.sqrt(2) / 2;
            }
        } else if (cursors.down.isDown) {
            this.sprite.body.velocity.y = PLAYER_SPEED;
            this.sprite.animations.play('moving');
            if (this.sprite.body.velocity.x != 0) {
                this.sprite.body.velocity.x *= Math.sqrt(2) / 2;
                this.sprite.body.velocity.y *= Math.sqrt(2) / 2;
            }
        }
        if (this.sprite.body.velocity.x == 0 && this.sprite.body.velocity.y == 0) {
            this.sprite.animations.stop();
        } else {
            this.sprite.angle = Math.atan(this.sprite.body.velocity.y / this.sprite.body.velocity.x) * 180 / Math.PI;
            if (this.sprite.body.velocity.x < 0) this.sprite.angle += 180;
        }

        
    }
    pointTo(x,y){
        this.sprite.angle = directionTo(this, x, y);
    }
    getX(){
        return this.sprite.x;
    }
    getY(){
        return this.sprite.y;
    }
    getAngle(){
        return this.sprite.angle;
    }
}

class Prisoner{
    constructor(x, y, prisonerGroup) {
        this.sprite = prisoners.create(x, y, 'Prisoner', 'F1');
        this.sprite.body.immovable = true;
        //scale to match player better
        this.sprite.scale.setTo(0.27);
        prisonerArray.push(this);
    }
    getX(){
        return this.sprite.x;
    }
    getY(){
        return this.sprite.y;
    }
    getAngle(){
        return this.sprite.angle;
    }
}

class CameraEnemy{
    constructor(xSpawn, ySpawn){
        this.light = new LightSource(this, 225, 55);
        this.sprite = game.add.sprite(xSpawn, ySpawn, "camera");
        this.sprite.anchor.setTo(0.5,0.35);
        this.direction = this.sprite.angle;
    }
    pointTo(x,y){
        this.sprite.angle = directionTo(this, x, y);
    }
    /*face(dir){
        while(dir < 0){//js doesn't do negative modulo correctly. it's dumb.
            dir += 360;
        }
        this.direction = dir%360;
        dir = this.direction + 45/2;
        this.sprite.angle = (dir%45)-(45/2);
        this.sprite.frame = ((-Math.floor(dir/45))%8)+8;
        if(this.direction > 180)
            this.direction -= 180;
        else
            this.direction -= 540;
    }
    pointTo(x, y){
        var d;
        if(this.sprite.x == x){
            d = 0
        }else{
            d = Math.atan((this.sprite.y-y)/(this.sprite.x-x));
        }
        d *= 180/Math.PI;
        if(this.sprite.x < x) d += 180;
        this.face(d);
    }*/
    getX(){
        return this.sprite.x;
    }
    getY(){
        return this.sprite.y;
    }
    getAngle(){
        return this.sprite.angle;
    }
}

class Shadows {
    constructor() {
        this.shadowTexture = game.add.bitmapData(game.width, game.height);
        this.lightSprite = game.add.image(game.camera.x, game.camera.y, this.shadowTexture);
        this.lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
    }
    update(playerSprite, cursors) {
        var radius = 130;
        var smallradius = 55;
        this.lightSprite.reset(game.camera.x, game.camera.y);
        this.shadowTexture.context.fillStyle = 'rgb(0, 0, 0)';
        this.shadowTexture.context.fillRect(0, 0, game.width, game.height);
        var heroX = playerSprite.x - game.camera.x + (playerSprite.body.velocity.x * radius / PLAYER_SPEED);
        var heroY = playerSprite.y - game.camera.y + (playerSprite.body.velocity.y * radius / PLAYER_SPEED);
        
        var gradient = this.shadowTexture.context.createRadialGradient(heroX, heroY, radius * 0.5, heroX, heroY, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        this.shadowTexture.context.beginPath();
        this.shadowTexture.context.fillStyle = gradient;
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)
            this.shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI * radius, false);
        else
            this.shadowTexture.context.arc(heroX, heroY - 10, smallradius, 0, Math.PI * smallradius, false);
        this.shadowTexture.context.fill();
        this.shadowTexture.dirty = true;
    }
}

class LightSource{
    constructor(emittingObj, lightStrength, spread){
        this.source = emittingObj;
        this.arcWidth = spread;
        this.strength = lightStrength
    }
    draw(){
        //prototype I guess
        var sX = this.source.getX();
        var sY = this.source.getY();
        var points = [];
        var startAngle = this.source.getAngle() - (this.arcWidth/2);
        var endAngle = startAngle + this.arcWidth;

        for(var currentAngle = startAngle; currentAngle <= endAngle; currentAngle += this.arcWidth / 60){
            var currentLine = new Phaser.Line(sX, sY, sX + Math.cos(currentAngle*Math.PI/180)*this.strength, sY + Math.sin(currentAngle*Math.PI/180)*this.strength);
            var currentInt = getWallIntersection(walls, currentLine);
            if(currentInt){
                points.push({x:currentInt.x, y:currentInt.y});
            }else{
                points.push({x:currentLine.end.x, y:currentLine.end.y});
            }
        }
        var g = lightTexture.context.createRadialGradient(sX, sY, this.strength * 0.5, sX, sY, this.strength);
        g.addColorStop(0, 'rgba(255,255,255,1.0)');
        g.addColorStop(1, 'rgba(255,255,255,0.0)');
        lightTexture.context.beginPath();
        lightTexture.context.fillStyle = g;
        lightTexture.context.moveTo(sX, sY);
        for(var i = 0; i < points.length; i++){
            lightTexture.context.lineTo(points[i].x, points[i].y);
        }
        lightTexture.context.lineTo(sX, sY);
        lightTexture.context.stroke();
        //lightTexture.context.arc(sX, sY, this.strength, startAngle, endAngle, false);
        lightTexture.context.fill();
        lightTexture.dirty = true;
    }
    visible(target){
        //I think with reeeeeally big arc widths, this might screw up occasionally? don't think it matters since we're never going to use numbers >180 degrees
        function correctAngle(angle){
            if(angle > 0)return angle - 180;
            return angle + 180;
        }
        var sX = this.source.getX();
        var sY = this.source.getY();
        var tX = target.getX();
        var tY = target.getY();

        if(Math.sqrt((sX-tX)*(sX-tX)+(sY-tY)*(sY-tY)) > this.strength) return false;

        var angleDiff;
        if(sX == tX){
            if(sY == tY)return true;
            if(sY > tY) angleDiff = -90;
            else angleDiff = 90
        } else{
            angleDiff = Math.atan((sY-tY)/(sX-tX))*180/Math.PI;
        }

        var portAng = this.source.getAngle() - (this.arcWidth/2);
        var starboardAng = portAng + this.arcWidth;
        if(sX > tX){
            portAng = correctAngle(portAng);
            starboardAng = correctAngle(starboardAng);
        }
        if(angleDiff < portAng || angleDiff > starboardAng) return false;
        var intersect = getWallIntersection(walls, new Phaser.Line(sX, sY, tX, tY));
        if(intersect)return false;
        return true;
    }
}

function doLights(objectsWithLights){
    lightTexture.context.fillStyle = "rgba(0,0,0, 0.8)";
    lightTexture.context.fillRect(game.camera.x, game.camera.y, game.width, game.height);
    for(var i = 0; i < objectsWithLights.length; i++){
        objectsWithLights[i].light.draw();
    }
}

class WallTile{
    constructor(mapTile){
        this.x1 = mapTile.x * mapTile.width;
        this.y1 = mapTile.y * mapTile.height;
        this.x2 = this.x1 + mapTile.width;
        this.y2 = this.y1 + mapTile.height;
    }
    getLines(){
        // Create an array of lines that represent the four edges of the wall tile
        return [
            new Phaser.Line(this.x1, this.y1, this.x2, this.y1),
            new Phaser.Line(this.x1, this.y1, this.x1, this.y2),
            new Phaser.Line(this.x2, this.y1, this.x2, this.y2),
            new Phaser.Line(this.x1, this.y2, this.x2, this.y2)
        ];
    }
}

function makeMap() {
    //creating the map (I feel like maybe this should go in its own class, but it might take more work than the other things)
    var m = game.add.tilemap('map');
    game.add.image(0, 0, 'Background');
    game.world.setBounds(0, 0, m.widthInPixels, m.heightInPixels);
    return m;
}

function directionTo(source, x, y){
        var d;
        if(source.getX() == x){
            d = 0
        }else{
            d = Math.atan((source.getY()-y)/(source.getX()-x));
        }
        d *= 180/Math.PI;
        if(source.getX() < x) return d + 180;
        return d;
}

function getWallIntersection(walls, ray) {
    var distanceToWall = Number.POSITIVE_INFINITY;
    var closestIntersection = null;
    for (var i = 0; i < walls.length; i++) {
        var lines = walls[i].getLines();
        
        //Test each of the edges in this wall against the ray.
        //If the ray intersects any of the edges then the wall must be in the way.
        for (var j = 0; j < lines.length; j++) {
            var intersect = Phaser.Line.intersects(ray, lines[j]);
            
            if (intersect) {
                // Find the closest intersection
                distance = this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
                if (distance < distanceToWall) {
                    distanceToWall = distance;
                    closestIntersection = intersect;
                }
            }
        }
    }
    return closestIntersection;
    
}

function showText(player, prisoner){
    //var selected = Phaser.ArrayUtils.getRandomItem(prisonerArray, 0, prisonerArray.length-1);//picks random prisoner to speak
    var ChildPicked = prisoner;
    text = game.add.text(0, 0, "Hey, I am stuck in this world, please give me my freedom back", style);
    text.anchor.set(0.5);
    text.x = Math.floor(ChildPicked.x + ChildPicked.width / 2);//overlap works but now undefined here
    text.y = Math.floor(ChildPicked.y + ChildPicked.height / 2) - 50;
}

function getRandomCoordinates(){            
    var randX = Math.floor((Math.random() * game.world.width) + 1);            
    var randY = Math.floor((Math.random() * game.world.height) + 1);            
    if(map.getTile(randX, randY) != null){                
        getRandomCoordinates();            
    }else{                
        randomX = randX;                
        randomY = randY;                
        return;            
    }        
}

GameStateHandler.Preloader = function() {};
GameStateHandler.Preloader.prototype = {
    preload: function() {
        console.log('Preloader: preload');
        //Loading into Asset cache
        this.load.path = 'assets/';
        //adding background
        this.load.image('Background', 'FloorBackgroundBigger.png');
        this.load.image('prisoner', 'prisoner1.png');
        this.load.atlas('player', 'atlas.png', 'atlas.json');
        this.load.image('camera', 'Camera.png');
        this.load.tilemap('map', 'GameMap.json', null, Phaser.Tilemap.TILED_JSON); //Loding the map with tiles
        this.game.load.atlas('Prisoner', 'PTest.png', 'PTest.json');
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
        walls = [];
        //Adding each tile to an array
        for (var x = 0; x < map.width; ++x) {
            for (var y = 0; y < map.height; ++y) {
                if (map.getTile(x, y) != null)
                    walls.push(new WallTile(map.getTile(x, y)));
            }
        }
        //creating prisoner(s)
        prisoners = game.add.group();
        prisoners.enableBody = true;
        for(var i = 0; i < 7; i++){
            getRandomCoordinates();
            new Prisoner(randomX, randomY, prisoners);//testing making multiple prisoners
        }
        testCamera = new CameraEnemy(600, 95)
        //text style for text popups
        style = {
            font: "12px Arial",
            wordWrap: true,
            wordWrapWidth: 300,
            align: "center",
            backgroundColor: "white"
        };
        shadowObj = new Shadows();
        lightTexture = game.add.bitmapData(map.widthInPixels, map.heightInPixels);
        lightSprite = game.add.image(0, 0, lightTexture);
        lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
        player = new Player(game.camera.width / 2, game.camera.height / 2);
        game.camera.follow(player.sprite);
        map.addTilesetImage('Tiles', 'tiles');
        groundLayer = map.createLayer('TileLayer'); //creating a layer
        groundLayer.resizeWorld();
        map.setCollisionBetween(0, 10000, true, groundLayer); //enabling collision for tiles used
<<<<<<< HEAD
        
        game.input.addMoveCallback(function(pointer, x, y){
            if(player.body.velocity.x != 0 || player.body.velocity.y != 0) player.pointTo(x + game.camera.x, y + game.camera.y);
        }, game);

=======
>>>>>>> 597b7c61672baf454b5c3a4bce310ce7dd4d18a5
        cursors = game.input.keyboard.createCursorKeys();
    },
    update: function() {
        game.physics.arcade.collide(player.sprite, groundLayer);
        game.physics.arcade.collide(player.sprite, testCamera.sprite);
        showText = game.physics.arcade.collide(player.sprite, prisoners);
<<<<<<< HEAD
        //testCamera.pointTo(player.sprite.x, player.sprite.y);
        testCamera.sprite.angle++;

        lightTexture.context.clearRect(game.camera.x, game.camera.y, game.width, game.height);

        doLights([player, testCamera]);

        if(testCamera.light.visible(player)){
            console.log("I SEE YOU");
        }

=======
        testCamera.pointTo(player.sprite.x, player.sprite.y);
        lightTexture.context.clearRect(game.camera.x, game.camera.y, game.width, game.height);
        doLights([player]);
>>>>>>> 597b7c61672baf454b5c3a4bce310ce7dd4d18a5
        //shadowObj.update(player.sprite, cursors);
    
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown){
            game.world.remove(text);
        }
        player.update(cursors);
   }
};

game.state.add('Preloader', GameStateHandler.Preloader);
game.state.add('Play', GameStateHandler.Play);
game.state.start('Preloader');