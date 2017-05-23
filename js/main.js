var GameStateHandler = {};
var game = new Phaser.Game(1024, 576, Phaser.AUTO);
var map;
var walls;
var shadowObj;
var lightTexture;
var buttonpressed;
var text;
var style;
var prisoners;
var prisonerArray = [];
var testCamera;
var showText;
var player;
var PLAYER_SPEED = 150;

class Player {
    constructor(x, y) {
        this.light = new LightSource(this, 175, 45);
        //Creating the player sprite
        var player = game.add.sprite(x, y, 'player');
        //Setting up the sprite as a physical body in Arcade Physics Engine
        game.physics.arcade.enable(player);
        player.frame = 75;
        player.anchor.setTo(0.5, 0.5);
        player.body.collideWorldBounds = true;
        player.animations.add('moving', Phaser.Animation.generateFrameNames('survivor-move_flashlight_', 0, 19), 60, true);
        this.sprite = player;
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


class Prisoner {
    constructor(x, y, prisonerGroup) {
        this.sprite = prisoners.create(x, y, 'prisoner');
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
        this.sprite = game.add.sprite(xSpawn, ySpawn, "camera");
        this.sprite.anchor.setTo(0.5,0.35);
        this.direction = this.sprite.angle;
    }
    face(dir){
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
    }
    getX(){
        return this.sprite.x;
    }
    getY(){
        return this.sprite.y;
    }
    getAngle(){
        return this.direction ;
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

        for(var currentAngle = startAngle; currentAngle < endAngle; currentAngle += this.arcWidth / 60){
            var currentLine = new Phaser.Line(sX, sY, sX + Math.cos(currentAngle*Math.PI/180)*this.strength, sY + Math.sin(currentAngle*Math.PI/180)*this.strength);
            var currentInt = getWallIntersection(walls, currentLine);
            if(currentInt){
                points.push({x:currentInt.x, y:currentInt.y});
            }else{
                points.push({x:currentLine.end.x, y:currentLine.end.y});
            }
        }
        lightTexture.context.beginPath();
        lightTexture.context.moveTo(sX, sY);
        for(var i = 0; i < points.length; i++){
            lightTexture.context.lineTo(points[i].x, points[i].y);
        }
        lightTexture.context.lineTo(sX, sY);
        lightTexture.context.stroke();
        lightTexture.dirty = true;
    }
    visible(target){
        var sX = this.source.getX();
        var sY = this.source.getY();
        var tX = target.getX();
        var tY = target.getY();

        if(Math.sqrt((sX-tX)*(sX-tX)+(sY-tY)*(sY-tY)) > this.strength) return false;

        //crazy math because I don't know what angles are going to be rounded where and I just thought of spaghetti logic that should work
        //(just starting with the actual atan to find the angle to start with)
        var angleDiff = Math.atan((sY-tY)/(sX-tX))*180/Math.PI;
        var portAng = this.source.getAngle() - (this.arcWidth/2);
        while(portAng < 0){
            portAng += 360;
        }
        var starboardAng = portAng + this.arcWidth;
        portAng = portAng % 90;
        starboardAng = starboardAng % 90;
        angleDiff = (angleDiff + 360) % 90;
        if(portAng > starboardAng){
            if(angleDiff >= portAng) angleDiff -= 90;
            portAng -= 90;
            if(true){}
        }
        if(angleDiff < portAng || angleDiff > starboardAng) return false;
        var intersect = getWallIntersection(walls, new Phaser.Line(sX, sY, tX, tY));
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
    m.addTilesetImage('Tiles', 'tiles');
    groundLayer = m.createLayer('TileLayer'); //creating a layer
    groundLayer.resizeWorld();
    m.setCollisionBetween(0, 10000, true, groundLayer); //enabling collision for tiles used
    return m;
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
GameStateHandler.Preloader = function () { };
GameStateHandler.Preloader.prototype = {
    preload: function () {
        console.log('Preloader: preload');
        //Loading into Asset cache
        this.load.path = 'assets/';
        //adding background
        this.load.image('Background', 'FloorBackground.png');
        this.load.image('prisoner', 'prisoner1.png');
        this.load.atlas('player', 'atlas.png', 'atlas.json');
        this.load.spritesheet('camera', 'Camera.png', 32, 32, 8);
        this.load.tilemap('map', 'GameMap.json', null, Phaser.Tilemap.TILED_JSON); //Loding the map with tiles
        
    },
    create: function () {
        console.log('Preloader: create');
        //Preventing the key to affect browser view
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.SPACEBAR]);
        
    },
    update: function () {
        this.state.start('Play');
    }
};
GameStateHandler.Play = function () {
    var player, map;
};
GameStateHandler.Play.prototype = {
    preload: function () {
        console.log('Play: preload');
        game.load.image('tiles', 'Tiles.png'); //loading tileset image
    },
    create: function () {
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
        new Prisoner(200, 100, prisoners);

        testCamera = new CameraEnemy(460, 95)
        
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
        lightTexture = game.add.bitmapData(game.width, game.height);
        lightTexture.context.fillStyle = 'rgb(255,255,255)';
        lightTexture.context.strokeStyle = 'rgb(255,255,255)';
        game.add.image(0,0,lightTexture);
        
        game.camera.follow(player.sprite);
        
        cursors = game.input.keyboard.createCursorKeys();
    },
    update: function () {
        game.physics.arcade.collide(player.sprite, groundLayer);
        game.physics.arcade.collide(player.sprite, testCamera.sprite);
        showText = game.physics.arcade.collide(player.sprite, prisoners);
        testCamera.pointTo(player.sprite.x, player.sprite.y);

        lightTexture.context.clearRect(0, 0, game.width, game.height);

        player.light.draw();
        
        var intersect = getWallIntersection(walls, new Phaser.Line(testCamera.sprite.x, testCamera.sprite.y, player.sprite.x, player.sprite.y));
        if (!intersect) {
            //Draw a line from the camera to the player
            lightTexture.context.beginPath();
            lightTexture.context.moveTo(player.sprite.x, player.sprite.y);
            lightTexture.context.lineTo(testCamera.sprite.x, testCamera.sprite.y);
            lightTexture.context.stroke();
            lightTexture.dirty = true;
        } else {
            lightTexture.context.beginPath();
            lightTexture.context.moveTo(intersect.x, intersect.y);
            lightTexture.context.lineTo(testCamera.sprite.x, testCamera.sprite.y);
            lightTexture.context.stroke();
            lightTexture.dirty = true;
        }

        //shadowObj.update(player.sprite, cursors);
        if (showText) {
            var selected = Phaser.ArrayUtils.getRandomItem(prisonerArray, 0, prisonerArray.length - 1);
            var ChildPicked = selected.sprite;
            text = game.add.text(0, 0, "Hey, I am stuck in this world, please give me my freedom back", style);
            text.anchor.set(0.5);
            text.x = Math.floor(ChildPicked.x + ChildPicked.width / 2);
            text.y = Math.floor(ChildPicked.y + ChildPicked.height / 2) - 50;
        }
        
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)
        game.world.remove(text);
        
        player.update(cursors);
    }
};


game.state.add('Preloader', GameStateHandler.Preloader);
game.state.add('Play', GameStateHandler.Play);
game.state.start('Preloader');
