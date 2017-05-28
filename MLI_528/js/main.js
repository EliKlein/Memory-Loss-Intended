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
var hintStyle;
var prisoners;
var prisonerArray = [];
var enemiesGroup;
var enemiesArray = [];
var testCamera;
var player;
var PLAYER_SPEED = 150;
var randomX;
var randomY;
var prisonerStoryList;
var playerSeen = false;//becomes true when player is seen, changed in guards, camera
var playerScammed = false;//becomes true when player is scammed, changed in prisoner
var PlayerWon = false; //becomes true when playr wins, not changed anywere right now
//can't use game.world.centerX/Y as that changes when in play state
var MidX = 512;//mid x value for seeable screen
var MidY = 288;//mid y value for seeable screen
function findContainingObject(sprite, array){
    //finds a sprite in an array
    for(var i = 0; i < array.length; i++){
        if(array[i].sprite === sprite) return array[i];
    }
    return null;
}
class Player{
    constructor(x, y){
        //adds the light for the player
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
        player.body.onCollide = new Phaser.Signal();//sets up so player can interact with prisoners
        player.body.onCollide.add(showText, this);//adds the interaction, has to have pair in an update function
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
class Story{
    //story details for the prisoners
    constructor(message, truth, hint){
        this.message = message;
        this.truth = truth;
        this.hint = hint;
    }
}
class StoryList{
    //list of the stories
    constructor(){
        //setting global variable in a place where it makes sense, and near where it matters
        style = {
            font: "16px Ariel",
            strokeThickness:1.5,
            wordWrap: true,
            wordWrapWidth: 275,
            fill:"#1144CC",
            stroke:"rgba(80,60,20,0.4)",
            backgroundColor: "#88AACC"
        };
        hintStyle = {
            font: "12px Times New Roman",
            wordWrap: true,
            wordWrapWidth: 400,
            fill:"#000966",
            stroke:"rgba(255,255,255,0.25)",
            backgroundColor: "#808080"
        };
        this.list = [];
        this.reset();
    }
    reset(){
        this.list.push(new Story("I clicked on an interesting link on Facebook that a friend of mine posted. It gave my computer a virus. " +
        "It turns out their profile was hacked.", false,
        "-They describe that it was 'The 5 Most Interesting Things on the Internet'\n" +
        "-They show that they are friends with someone who has posted some suspicious things.")); //"www.facebook/link1356#1445/5-Most-interesting-things-on-Internet")); // I don't know if we should have an actual link to a supposed virus
        this.list.push(new Story("I got a call from the IRS. They asked me to give them my personal information. I verified the caller ID " +
        "online and it was actually their number. I guess my caller ID was compromised.", false,
        "-The number is actually from the IRS.\n" +
        "-They tell me the address they gave to the scammer. It's a real house."));
        this.list.push(new Story("I bought NBA playoff tickets off CraigList. The guy told me he was unable to attend becuase he was " +
        "assigned overtime all of a sudden that day. The tickets looked real but didn't scan. The contact information he provided was bogus", true,
        "-I see the tickets in their hand, and they look real.\n" +
        "-I called the number they provided, and it was disconnected."));
        this.list.push(new Story("I met a girl online. We wanted to meet but she said she did not have the money, " +
        "so I wired it to her. I never heard from her again.", true,
        "-The fake girl's dating website profile, and another profile by the same name on Facebook, were deleted shortly after the incident.\n" +
        "-They show me a bank statement on the bank's website, with the wire transfer on it."));
        this.list.push(new Story("I got a call in the middle of the day saying that my friend was kidnapped. " +
        "I tried to negotiate a price because I was scared for him. I wired them money, but later I found out " +
        "my friend was not in any sort of trouble.", true,
        "-They describe their friends visual appearance appropriately, and when I call them, they confirm the story.\n" +
        "-They show the bank statement showing the details of the transaction, on the bank's website."));
        this.list.push(new Story("I was told that I could make a lot of money working for a company if I paid an entry fee. " +
        "The only job I would need to do was recruit more people. In the end, it was just a pyramid scheme.", true,
        "-The scamming company has its website fully developed. This person has a page on that website.\n" +
        "-They have contact info for all the people they recruited before they dropped out because it was a scam. I picked a few random " + 
        "people on the list, and they all relayed similar stories and had pages on the website."));
    }
    getRandom(){
        return this.list.splice(Math.floor(Math.random()*this.list.length), 1)[0];
    }
}
class Prisoner{
    constructor(x, y, prisonerGroup, id) {
        this.sprite = prisoners.create(x, y, 'Prisoner', id);
        this.sprite.scale.setTo(0.4);// scale to match player
        this.sprite.body.immovable = true;
        this.story = prisonerStoryList.getRandom();//gives each one a random story, no repeats
        prisonerArray.push(this);
    }
    makeText(){
        //makes the text of their stories
        this.text = game.add.text(0, 0, this.story.message, style);
        this.text.anchor.setTo(0.5, 1);
        this.hint = game.add.text(this.text.x + (this.text.width/2), this.text.y, this.story.hint, hintStyle);
        this.hint.anchor.setTo(0, 1);
        this.buttonA = game.add.button(0, 0, "accept", this.accept, this, 0, 1, 2);
        this.buttonD = game.add.button(0, 0, "deny", this.deny, this, 0, 1, 2);
        this.buttonD.anchor.setTo(1, 0);
        this.stopText();
    }
    showText(){
        //shows the text
        if(!this.accepted){
            this.text.reset();
            this.hint.reset();
            this.buttonA.reset();
            this.buttonD.reset();
            this.text.x = Math.min(Math.max(Math.floor(this.sprite.x), this.text.width/2), game.world.width - (this.text.width/2));
            this.text.y = Math.min(Math.max(Math.floor(this.sprite.y - this.sprite.height - 10), this.text.height), game.world.height - this.buttonA.height);
            this.hint.x = this.text.x + (this.text.width/2);
            this.hint.y = this.text.y;
            if(this.hint.x + this.hint.width > game.world.width){
                this.hint.x = this.text.x - (this.text.width/2);
                this.hint.anchor.setTo(1,1);
            }
            this.buttonA.x = this.text.x - (this.text.width/2);
            this.buttonD.x = this.text.x + (this.text.width/2);
            this.buttonA.y = this.text.y;
            this.buttonD.y = this.text.y;
        }
    }
    stopText(){
        //get rid of the text
        this.text.kill();
        this.hint.kill();
        this.buttonA.kill();
        this.buttonD.kill();
    }
    accept(){
        game.world.remove(this.text);
        game.world.remove(this.hint);
        game.world.remove(this.buttonA);
        game.world.remove(this.buttonD);
        this.accepted = true;
        if (this.story.truth === false){
            console.log('scammed');
            playerScammed = true;
        }
    }
    deny(){
        this.stopText();
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
class Guard{
    constructor(x, y){
        this.name = "g"+enemiesArray.length;
        this.sprite = enemiesGroup.create(x, y, 'guard');
        this.sprite.anchor.set(0.5)
        this.dir = 0;
        game.physics.arcade.enable(this.sprite);
        this.sprite.body.collideWorldBounds = true;//does this for the tilemap, but not the real bounds
        this.sprite.body.immovable = true;
        //guard frames in the guard.json are out of order so the walk is odd, fixed in Guards_renamed.json
        this.sprite.animations.add('movingdown', Phaser.Animation.generateFrameNames('down', 1, 4), 5, true);
        this.sprite.animations.add('movingleft', Phaser.Animation.generateFrameNames('left', 1, 4), 5, true);
        this.sprite.animations.add('movingright', Phaser.Animation.generateFrameNames('right', 1, 4), 5, true);
        this.sprite.animations.add('movingup', Phaser.Animation.generateFrameNames('up', 1, 4), 5, true);
        enemiesGroup.add(this.sprite);
        enemiesArray.push(this);
        this.light = new LightSource(this, 225, 50);

        this.psSprite = game.add.sprite(0, 0, "seen");
        this.psSprite.anchor.set(0.5);
        this.psSprite.scale.setTo(0.5, 0.5);
        this.psSprite.kill();
    }
    update(){
        //does this if guard can see player
        if(this.light.visible(player)){
            this.psSprite.reset(this.sprite.x, this.sprite.y-40);
            console.log('seen by guard');
            playerSeen = true;
        } else this.psSprite.kill();
    }
    down(){
        this.dir = 90;
        this.sprite.frame = 0;
        this.sprite.animations.play('movingdown');
        this.sprite.body.velocity.y = 60;
    }
    left(){
        this.dir = 180;
        this.sprite.frame = 8;
        this.sprite.animations.play('movingleft');
        this.sprite.body.velocity.x = -60;
    }
    right(){
        this.dir = 0;
        this.sprite.frame = 10;
        this.sprite.animations.play('movingright');
        this.sprite.body.velocity.x = 60;
    }
    up(){
        this.dir = -90;
        this.sprite.frame = 12;
        this.sprite.animations.play('movingup');
        this.sprite.body.velocity.y = -60;
    }
    getX(){
        return this.sprite.x;
    }
    getY(){
        return this.sprite.y;
    }
    getAngle(){
        return this.dir;
    }
}
class CameraEnemy{
    constructor(xSpawn, ySpawn, arcStart, arcEnd){
        this.light = new LightSource(this, 225, 40);
        this.sprite = game.add.sprite(xSpawn, ySpawn, "camera");
        this.sprite.anchor.set(0.5);
        this.direction = this.sprite.angle;
        this.state = (arcEnd - arcStart)/120;
        this.arcStart = arcStart;
        this.arcEnd = arcEnd;
        this.timer = 0;
    }
    update(){
        if(this.state == 0){
            this.timer += 1;
            if(this.timer > 60){
                this.timer = 0;
                if(this.sprite.angle < this.arcStart) this.state = (this.arcEnd - this.arcStart)/120;
                else this.state = (this.arcStart - this.arcEnd)/120;
                this.sprite.angle += this.state;
            }
        } else {
            this.sprite.angle += this.state;
            if(this.sprite.angle < this.arcStart || this.sprite.angle > this.arcEnd) this.state = 0;
        }
        if(this.light.visible(player)){
            //does this if camera can see player
            console.log("seen by camera");
            playerSeen = true;
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
        var handLength = (this.source.sprite.width + this.source.sprite.height)/4;
        sX += Math.cos(this.source.getAngle()*Math.PI/180)*handLength;
        sY += Math.sin(this.source.getAngle()*Math.PI/180)*handLength;
        var points = [];
        var startAngle = this.source.getAngle() - (this.arcWidth/2);
        var endAngle = startAngle + this.arcWidth;
        for(var currentAngle = startAngle; currentAngle <= endAngle; currentAngle += this.arcWidth / 30){
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
        lightTexture.context.strokeStyle = 'rgba(255,255,255,0.0)'
        lightTexture.context.moveTo(sX, sY);
        for(var i = 0; i < points.length; i++){
            lightTexture.context.lineTo(points[i].x, points[i].y);
        }
        lightTexture.context.lineTo(sX, sY);
        lightTexture.context.stroke();
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
            d = Math.PI/2;
            if(source.getY() > y) d = -(Math.PI/2);
        }else{
            d = Math.atan((source.getY()-y)/(source.getX()-x));
        }
        d *= 180/Math.PI;
        if(source.getX() > x) return d + 180;
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
    findContainingObject(prisoner, prisonerArray).showText();
    /*for(var i = 0; i < prisonerArray.length; i++){
        if(prisonerArray[i].sprite === prisoner){
            prisonerArray[i].showText();
            break;
        }
    }*/
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
function changeAnimation(enemySprite, wall){
    var enemy = findContainingObject(enemySprite, enemiesArray);
    if(enemySprite.animations.currentAnim.name == "movingdown") enemy.up();
    else if(enemySprite.animations.currentAnim.name == "movingup") enemy.down();
    else if(enemySprite.animations.currentAnim.name == "movingright") enemy.left();
    else enemy.right();
}
function stopAnimation(enemySprite, player){
    enemySprite.body.velocity.x = 0;
    enemySprite.body.velocity.y = 0;
    enemySprite.animations.stop();
    if(enemySprite.animations.currentAnim.name == "movingdown") enemySprite.frame = 0;
    if(enemySprite.animations.currentAnim.name == "movingup") enemySprite.frame = 12;
    if(enemySprite.animations.currentAnim.name == "movingleft") enemySprite.frame = 8;
    if(enemySprite.animations.currentAnim.name == "movingright") enemySprite.frame = 9;
}
GameStateHandler.Preloader = function() {};
GameStateHandler.Preloader.prototype = {
    preload: function() {
        console.log('Preloader: preload');
        //Loading into Asset cache
        this.load.path = 'assets/';
        //load all assets from folder
        this.load.image('Background', 'FloorBackgroundBigger.png');
        this.load.image('prisoner', 'prisoner1.png');
        this.load.image('seen', 'Seen.png');
        this.load.spritesheet('accept', 'acceptBtn.png', 125, 50);
        this.load.spritesheet('deny', 'denyBtn.png', 125, 50);
        this.load.atlas('player', 'atlas.png', 'atlas.json');
        this.load.atlas('guard', 'guard.png', 'Guards_renamed.json');
        this.load.image('camera', 'Camera.png');
        this.load.tilemap('map', 'GameMap.json', null, Phaser.Tilemap.TILED_JSON); //Loding the map with tiles
        this.load.atlas('Prisoner', 'PTest.png', 'PTest.json');
        this.load.image('Menu_Background', 'Menu_Background.png');
        this.load.image('button', 'grey_button.png');
        prisonerStoryList = new StoryList();
  },
  create: function() {
    console.log('Preloader: create');
    //Preventing the key to affect browser view
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.SPACEBAR]);
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
    button_play = game.add.button(MidX- 95, 200, 'button', this.actionOnClickplay, this);
    textplay = game.add.text(button_play.centerX - 25, button_play.centerY - 12, 'PLAY', {fontSize: '20px', fill: 'black'});
    button_options = game.add.button(MidX - 95, 250, 'button', this.actionOnClickopt, this);
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
      button_back = game.add.button(MidX - 95, 200, 'button', this.actionOnClickback, this);
      text_back = game.add.text(button_back.centerX - 28, button_back.centerY - 12, 'BACK', {fontSize: '20px', fill: 'black'});
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
GameStateHandler.Play = function() {
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
        //creating guards
        enemiesGroup = game.add.group();
        new Guard(740, 265).down();
        new Guard(1110, 260).down();
        new Guard(1210, 260).right();//changed for a bit of fariness
        new Guard(170, 320).left();//changed for a bit of fairness
        //create a camera
        testCamera = new CameraEnemy(510, 60, 0, 90);
        //creating prisoners
        prisoners = game.add.group();
        prisoners.enableBody = true;
        new Prisoner(250, 115, prisoners, 'Prisoner1');
        new Prisoner(80, 475, prisoners, 'Prisoner2');
        new Prisoner(1100, 465, prisoners, 'Prisoner3');
        new Prisoner(1385, 110, prisoners, 'Prisoner4');
        new Prisoner(1935, 140, prisoners, 'Prisoner5');
        new Prisoner(1950, 480, prisoners, 'Prisoner6');
        //lighting details
        lightTexture = game.add.bitmapData(map.widthInPixels, map.heightInPixels);
        lightSprite = game.add.image(0, 0, lightTexture);
        lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
        player = new Player(7*32, 7*32);
        game.camera.follow(player.sprite);
        map.addTilesetImage('Tiles', 'tiles');
        groundLayer = map.createLayer('TileLayer'); //creating a layer
        groundLayer.resizeWorld();
        map.setCollisionBetween(0, 10000, true, groundLayer); //enabling collision for tiles used
        //prisoner stories added to array
        for(var i = 0; i < prisonerArray.length; i++){
            prisonerArray[i].makeText();
        }
        game.input.addMoveCallback(function(pointer, x, y){
            if(player.sprite.body.velocity.x == 0 && player.sprite.body.velocity.y == 0) player.pointTo(x + game.camera.x, y + game.camera.y);
        }, game);
        //cursor movemnt stuff
        cursors = game.input.keyboard.createCursorKeys();
    },
    update: function() {
        game.physics.arcade.collide(player.sprite, groundLayer);
        game.physics.arcade.collide(player.sprite, testCamera.sprite);
        game.physics.arcade.collide(player.sprite, prisoners);
        game.physics.arcade.collide(enemiesGroup, groundLayer, changeAnimation); //ADDED
        game.physics.arcade.collide(enemiesGroup, player, stopAnimation); //ADDED
        //testCamera.pointTo(player.sprite.x, player.sprite.y);
        testCamera.update();
        lightTexture.context.clearRect(game.camera.x, game.camera.y, game.width, game.height);
        doLights([player, testCamera]);
        //shadowObj.update(player.sprite, cursors);
        for(var i = 0; i < enemiesArray.length; i++){
            enemiesArray[i].update();
        }
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown){
            for(var i = 0; i < prisonerArray.length; i++){
                prisonerArray[i].stopText();
            }
        }
        player.update(cursors);
        if (playerSeen){
            this.state.start('Game_Over_Seen');
        }
        if (playerScammed){
            this.state.start('Game_Over_Scam');
        }
   }
};
GameStateHandler.Game_Over_Seen = function() {
    var button_menu, text_menu;
};
GameStateHandler.Game_Over_Seen.prototype = {
    preload: function() {},
    create: function() {
        var Menu_backGround = this.add.image(0,0, 'Menu_Background');
        Menu_backGround.alpha = 0.35;
        button_menu = game.add.button(MidX - 95, 200, 'button', this.actionOnClickmenu, this);
        text_menu = game.add.text(button_menu.centerX - 28, button_menu.centerY - 12, 'Menu', {fontSize: '20px', fill: 'black'});
        game.add.text(425,100, 'Game Over:\nYou were seen!', {fontSize: '20px', fill: 'white'});
    },
    update: function() {
        if(button_menu.input.pointerOver()) {
            text_menu.fill = 'green';
        } else {
            text_menu.fill = 'black';
        }   
    },
    actionOnClickmenu: function() {
        playerSeen = false;
        this.state.start('Preloader');//have to go to preloader to reset everything, otherwise it breaks
    }
};
GameStateHandler.Game_Over_Scam = function() {
    var button_menu, text_menu;
};
GameStateHandler.Game_Over_Scam.prototype = {
    preload: function() {},
    create: function() {
        var Menu_backGround = this.add.image(0,0, 'Menu_Background');
        Menu_backGround.alpha = 0.35;
        button_menu = game.add.button(MidX - 95, 200, 'button', this.actionOnClickmenu, this);
        text_menu = game.add.text(button_menu.centerX - 28, button_menu.centerY - 12, 'Menu', {fontSize: '20px', fill: 'black'});
        game.add.text(425,100, 'Game Over:\nYou were scammed!', {fontSize: '20px', fill: 'white'});
    },
    update: function() {
        if(button_menu.input.pointerOver()) {
            text_menu.fill = 'green';
        } else {
            text_menu.fill = 'black';
        }   
    },
    actionOnClickmenu: function() {
        playerScammed = false;
        this.state.start('Preloader');//have to go to preloader to reset everything, otherwise it breaks
    }
};
GameStateHandler.Game_Won = function() {
    var button_menu, text_menu;
};
GameStateHandler.Game_Won.prototype = {
    preload: function() {},
    create: function() {
        var Menu_backGround = this.add.image(0,0, 'Menu_Background');
        Menu_backGround.alpha = 0.35;
        button_menu = game.add.button(MidX - 95, 200, 'button', this.actionOnClickmenu, this);
        text_menu = game.add.text(button_menu.centerX - 28, button_menu.centerY - 12, 'Menu', {fontSize: '20px', fill: 'black'});
        game.add.text(425,100, 'Game Over:\nYou won!', {fontSize: '20px', fill: 'white'});
    },
    update: function() {
        if(button_menu.input.pointerOver()) {
            text_menu.fill = 'green';
        } else {
            text_menu.fill = 'black';
        }   
    },
    actionOnClickmenu: function() {
        this.state.start('Preloader');//if allow restart, go from preloader, otherwise it breaks as things are not loaded correctly
    }
};
var spcbar;//no sure why this is here
game.state.add('Preloader', GameStateHandler.Preloader);//load everything
game.state.add('Menu', GameStateHandler.Menu);//main menu
game.state.add('Options_Screen', GameStateHandler.Options_Screen);//background of game and controls
game.state.add('Play', GameStateHandler.Play);//play the game
game.state.add('Game_Over_Seen', GameStateHandler.Game_Over_Seen);//get seen by guards or camera
game.state.add('Game_Over_Scam', GameStateHandler.Game_Over_Scam);//get scammed by fake prisoners
game.state.add('Game_Won', GameStateHandler.Game_Won);//win the game, not connected to anything yet
game.state.start('Preloader');