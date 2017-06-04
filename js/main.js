var GameStateHandler = {};
var game = new Phaser.Game(1024, 576, Phaser.AUTO);
var map;
var walls;
var lightTexture;
var lightSprite;
var buttonpressed;
var text;
var style;
var hintStyle;
var prisoners;
var prisonerArray;
var names = ["Prisoner"];
var enemiesGroup;
var enemiesArray;
var testCamera;
var player;
var PLAYER_SPEED = 150;
var randomX;
var randomY;
var prisonerStoryList;
var gameOverTip = "";
var enterKey, spacebarKey;

function findContainingObject(sprite, array){
    for(var i = 0; i < array.length; i++){
        if(array[i].sprite === sprite) return array[i];
    }
    return null;
}

class Player{
    constructor(x, y){
        this.light = new LightSource(this, 225, 55, 26);
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
    constructor(message, truth, hint, gameOverMessage){
        this.message = message;
        this.truth = truth;
        this.hint = hint;
        this.GOM = gameOverMessage;
    }
}

class StoryList{
    constructor(){
        //setting global variable in a place where it makes sense, and near where it matters
        style = {
            font: "16px Helvetica",
            strokeThickness:1.5,
            wordWrap: true,
            wordWrapWidth: 300,
            fill:"rgba(17, 68, 294, 0.9)",
            stroke:"rgba(80,60,20,0.35)",
        };
        hintStyle = {
            font: "12px Times New Roman",
            wordWrap: true,
            wordWrapWidth: 300,
            fill:"rgba(220, 220, 220, 0.9)",
            stroke:"rgba(255,255,255,0.2)",
        };
    }
    reset(){
        this.list = [];
        this.list.push(new Story("I clicked on an interesting link on Facebook that a friend of mine posted. It gave my computer a virus. " +
                                "It turns out their profile was hacked.", false,
                                "-They describe that it was 'The 5 Most Interesting Things on the Internet'\n" +
                                "-They tell you that the virus erased all of the files on their hard drive.",
                                "Look for information that really verifies the story someone tells you. Most anyone could think of a fake " +
                                "title, and they only even *told* you that their hard drive was erased. If either was true, they'd be able " +
                                "to show you a screwed-up hard drive and probably a real link to a virus from their profile. " +
                                "Try to trust people who have things that are much harder to fabricate before you trust someone like this!")); //"www.facebook/link1356#1445/5-Most-interesting-things-on-Internet")); // I don't know if we should have an actual link to a supposed virus
        this.list.push(new Story("I got a call from the IRS. They asked me to give them my personal information. I verified the caller ID " +
                                "online and it was actually their number. They must have found a way around my caller ID, since it didn't turn " + 
                                "out they were really the IRS.", false,
                                "-The number is actually from the IRS.\n" +
                                "-They tell me the address they gave to the scammer. It's a real house.",
                                "Does it actually confirm their story to find that they know the IRS's phone number, or that they know an address of a house?\n" +
                                "Anyone can look up the IRS's phone number online, and anyone can find a random house in a similar fashion. " +
                                "Try to trust people who have things that are much harder to fabricate before you trust someone like this!"));
        this.list.push(new Story("I bought NBA playoff tickets off CraigList. The guy told me he was unable to attend becuase he was " +
                                "assigned overtime all of the sudden that day. The tickets looked real but didn't scan. The contact information he provided was bogus", true,
                                "-I see the tickets in their hand, and they look real.\n" +
                                "-I called the number they provided, and it was disconnected. I verified with the a phone company that it has been disconnected since around " +
                                "the correct time.",
                                "This is not supposed to have led you to a game over. Sorry, it's a bug."));
        this.list.push(new Story("I met a girl online. We wanted to meet but she said she did not have the money, " +
                                "so I wired it to her. I never heard from her again.", true,
                                "-The fake girl's dating website profile, and another profile by the same name on Facebook, were deleted shortly after the incident.\n" +
                                "-They show me a bank statement on the bank's website, with the wire transfer on it.",
                                "This is not supposed to have led you to a game over. Sorry, it's a bug."));
        this.list.push(new Story("I got a call in the middle of the day saying that my friend was kidnapped. " +
                                "I tried to negotiate a price because I was scared for him. I wired them money, but later I found out " +
                                "my friend was not in any sort of trouble.", true,
                                "-They describe their friends visual appearance appropriately, and when I call them, they confirm the story.\n" +
                                "-They show the bank statement showing the details of the transaction, on the bank's website.",
                                "This is not supposed to have led you to a game over. Sorry, it's a bug."));
        this.list.push(new Story("I was told that I could make a lot of money working for a company if I paid an entry fee. " +
                                "The only job I would need to do was recruit more people. In the end, it was just a pyramid scheme.", true,
                                "-The company has a full website. This person has a page on that website.\n" +
                                "-There's contact info for everyone they recruited before dropping out. I contacted some of them at random. " + 
                                "They relayed similar stories, and provided their name when asked.",
                                "This is not supposed to have led you to a game over. Sorry, it's a bug."));
    }
    getRandom(){
        return this.list.splice(Math.floor(Math.random()*this.list.length), 1)[0];
    }
}

class Prisoner{
    constructor(x, y) {
        this.sprite = prisoners.create(x, y, 'Prisoner');
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.body.immovable = true;
        this.story = prisonerStoryList.getRandom();
        this.name = names[Math.floor(Math.random()*names.length)]
        //scale to match player better
        this.sprite.scale.setTo(0.45);
        this.roundCornerRadius = 7;
        prisonerArray.push(this);
    }
    makeText(){
        this.TEMPTHING = game.add.graphics();

        this.background = game.add.graphics();

        this.text = game.add.text(0, 0, this.story.message, style);
        this.text.anchor.setTo(1, 1);
        
        this.hint = game.add.text(0, 0, "Hint:\n" + this.story.hint, hintStyle);
        this.hint.anchor.setTo(1, 1);
        
        this.buttonA = game.add.button(0, 0, "accept", this.accept, this, 0, 1, 2);
        this.buttonD = game.add.button(0, 0, "deny", this.deny, this, 0, 1, 2);
        this.buttonD.anchor.setTo(1, 0);
        this.buttonA.alpha = 0.9;
        this.buttonD.alpha = 0.9;

        this.background.width = this.text.width + this.hint.width + 4*this.roundCornerRadius;
        this.background.alpha = 0.9;

        this.stopText();
    }
    showText(){
        if(!this.accepted){
            this.background.reset();
            this.text.reset();
            this.hint.reset();
            this.buttonA.reset();
            this.buttonD.reset();

            this.text.x = Math.floor(Math.min(Math.max(this.sprite.x + (this.text.width/2), this.roundCornerRadius + this.text.width), game.world.width - this.roundCornerRadius));
            this.text.y = Math.floor(Math.min(Math.max(this.sprite.y - this.sprite.height - this.buttonA.height - this.roundCornerRadius - 15, this.text.height + this.roundCornerRadius), game.world.height - this.buttonA.height - this.roundCornerRadius));

            this.hint.x = this.text.x + this.hint.width + (this.roundCornerRadius*2);
            this.hint.y = this.text.y;
            //place hint box on the left if it doesn't fit on the right
            if(this.hint.x + this.roundCornerRadius > game.width + game.camera.x){
                this.hint.x = this.text.x - this.text.width - (this.roundCornerRadius*2);
            }

            this.background.x = Math.min(this.text.x - this.text.width, this.hint.x - this.hint.width) - this.roundCornerRadius;
            this.background.y = Math.min(this.text.y - this.text.height, this.hint.y - this.hint.height) - this.roundCornerRadius;

            this.background.clear();
            //rect around text box
            this.background.beginFill(0x88AACC);
            this.background.drawRoundedRect(Math.max(0, (this.text.x - this.text.width) - (this.hint.x - this.hint.width)), Math.max(0, this.hint.height - this.text.height),
                this.text.width + (this.roundCornerRadius*2),
                this.text.height + (this.roundCornerRadius*2),
                this.roundCornerRadius);
            this.background.endFill();

            //rect around hint box
            this.background.beginFill(0x102940);
            this.background.drawRoundedRect(Math.max(0, (this.hint.x - this.hint.width) - (this.text.x - this.text.width)), Math.max(0, this.text.height - this.hint.height),
                this.hint.width + (this.roundCornerRadius*2),
                this.hint.height + (this.roundCornerRadius*2),
                this.roundCornerRadius);
            this.background.endFill();

            this.buttonA.x = this.text.x - this.text.width;
            this.buttonD.x = this.text.x;
            this.buttonA.y = this.text.y + this.roundCornerRadius;
            this.buttonD.y = this.text.y + this.roundCornerRadius;
        }
    }
    stopText(){
        this.background.kill();
        this.text.kill();
        this.hint.kill();
        this.buttonA.kill();
        this.buttonD.kill();
    }
    accept(){
        game.world.remove(this.background);
        game.world.remove(this.text);
        game.world.remove(this.hint);
        game.world.remove(this.buttonA);
        game.world.remove(this.buttonD);
        this.accepted = true;
        if(!this.story.truth){
            gameOverTip = this.story.GOM;
            game.state.start("GameOver");
        }
    }
    deny(){
        this.stopText();
    }
    followPlayer(){
        if(this.accepted){
            //game.physics.arcade.moveToXY(this.sprite, player.getX(), player.getY());
        }
        var path = findPath(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y, map);
        if(path){
            this.TEMPTHING.reset();
            this.TEMPTHING.clear();
            this.TEMPTHING.beginFill(0xFFFFFF);
            for(var i = 0; i < path.length; i++){
                this.TEMPTHING.drawCircle(16+path[i].x*32, 16+path[i].y*32, 13);
            }
        } else {
            this.TEMPTHING.kill();
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
class Guard{
    constructor(x, y){
        this.sprite = enemiesGroup.create(x, y, 'guard');
        this.sprite.anchor.setTo(0.5, 0.5);
        this.dir = 0;
        game.physics.arcade.enable(this.sprite);
        this.sprite.body.collideWorldBounds = true;
        this.sprite.body.immovable = true;
        this.sprite.animations.add('movingdown', Phaser.Animation.generateFrameNames('down', 1, 4), 5, true);
        this.sprite.animations.add('movingleft', Phaser.Animation.generateFrameNames('left', 1, 4), 5, true);
        this.sprite.animations.add('movingright', Phaser.Animation.generateFrameNames('right', 1, 4), 5, true);
        this.sprite.animations.add('movingup', Phaser.Animation.generateFrameNames('up', 1, 4), 5, true);
        enemiesArray.push(this);

        this.light = new LightSource(this, 225, 50, 8);

        this.psSprite = game.add.sprite(0, 0, "seen");
        this.psSprite.anchor.setTo(0.5, 0.5);
        this.psSprite.scale.setTo(0.5, 0.5);
        this.psSprite.kill();
    }
    update(){
        if(this.light.visible(player)){
            this.psSprite.reset(this.sprite.x, this.sprite.y-40);
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
        this.light = new LightSource(this, 225, 40, 8);
        this.sprite = game.add.sprite(xSpawn, ySpawn, "camera");
        this.sprite.anchor.setTo(0.5, 0.5);
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
            //console.log("seen by camera");
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
    constructor(emittingObj, lightStrength, spread, resolution){
        this.source = emittingObj;
        this.arcWidth = spread;
        this.strength = lightStrength;
        this.resolution = resolution;
    }
    draw(){
        //prototype I guess
        var sX = this.source.getX();
        var sY = this.source.getY();
        var handLength = (this.source.sprite.width + this.source.sprite.height)/5;
        sX += Math.cos(this.source.getAngle()*Math.PI/180)*handLength;
        sY += Math.sin(this.source.getAngle()*Math.PI/180)*handLength;

        if(map.getTile(Math.floor(sX/32), Math.floor(sY/32))) return;

        var points = [];
        var startAngle = this.source.getAngle() - (this.arcWidth/2);
        var endAngle = startAngle + this.arcWidth;

        for(var currentAngle = startAngle; currentAngle <= endAngle; currentAngle += this.arcWidth / this.resolution){
            var currentLine = new Phaser.Line(sX, sY, sX + Math.cos(currentAngle*Math.PI/180)*this.strength, sY + Math.sin(currentAngle*Math.PI/180)*this.strength);
            var currentInt = getWallIntersection(currentLine);
            if(currentInt){
                points.push({x:currentInt.x, y:currentInt.y});
            }else{
                points.push({x:currentLine.end.x, y:currentLine.end.y});
            }
        }
        var g = lightTexture.context.createRadialGradient(sX, sY, this.strength * 0.5, sX, sY, this.strength);
        g.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        g.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        lightTexture.context.fillStyle = g;
        
        lightTexture.context.beginPath();
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

        if(distance(sX, sY, tX, tY) > this.strength) return false;

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
        var intersect = getWallIntersection(new Phaser.Line(sX, sY, tX, tY));
        if(intersect)return false;
        return true;
    }
}

function doLights(objectsWithLights){
    lightTexture.context.fillStyle = "rgba(0, 0, 0, 0.85)";
    lightTexture.context.strokeStyle = 'rgba(255, 255, 255, 0.0)'
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
function distance(x1, y1, x2, y2){
    return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

function getWallIntersection(ray) {
    var distanceToWall = Number.POSITIVE_INFINITY;
    var closestIntersection = null;
    //vertical lines
    var loopEnds = {x:Math.ceil(Math.max(ray.start.x, ray.end.x) / 32), y:Math.ceil(Math.max(ray.start.y, ray.end.y) / 32)};
    if(ray.end.x - ray.start.x != 0){
        var slope = (ray.end.y - ray.start.y) / (ray.end.x - ray.start.x);
        for (var i = Math.ceil(Math.min(ray.start.x, ray.end.x) / 32); i < loopEnds.x; i++) {
            var intersectY = slope * ((i*32) - ray.start.x) + ray.start.y;
            var yTile = Math.floor(intersectY / 32);
            if (intersectY >= 0 && yTile < map.height && (map.getTile(i, yTile) != null || map.getTile(Math.max(i-1, 0), yTile) != null)) {
                dist = distance(ray.start.x, ray.start.y, i*32, intersectY);
                if (dist < distanceToWall) {
                    distanceToWall = dist;
                    closestIntersection = {x:i*32, y:intersectY};
                }
            }
        }
    }
    //horizontal lines
    if(ray.end.y - ray.start.y != 0){
        var slope = (ray.end.x - ray.start.x) / (ray.end.y - ray.start.y);
        for (var i = Math.ceil(Math.min(ray.start.y, ray.end.y) / 32); i < loopEnds.y; i++) {
            var intersectX = slope * ((i*32) - ray.start.y) + ray.start.x;
            var xTile = Math.floor(intersectX / 32);
            if (intersectX >= 0 && xTile < map.width && (map.getTile(xTile, i) != null || map.getTile(xTile, Math.max(i-1, 0)) != null)) {
                dist = distance(ray.start.x, ray.start.y,  intersectX, i*32);
                if (dist < distanceToWall) {
                    distanceToWall = dist;
                    closestIntersection = {x:intersectX, y:i*32};
                }
            }
        }
    }
    return closestIntersection;
    
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

function showText(player, prisoner){
    findContainingObject(prisoner, prisonerArray).showText();
}

function findPath(worldSX, worldSY, worldEX, worldEY, map){
    var start = worldPosToTilePos(worldSX, worldSY, map);
    start.gScore = 0;
    start.from = {x:start.x, y:start.y};

    var end = worldPosToTilePos(worldEX, worldEY, map);

    var explored = [];
    for(var i = 0; i < map.height; i++){
        explored.push([]);
        for(var j = 0; j < map.width; j++){
            explored[i].push(null);
        }
    }
    var exploring = [start];
    var curr, from, adj;
    while(exploring.length > 0){
        curr = exploring.shift();
        explored[curr.y][curr.x] = {x:curr.from.x, y:curr.from.y};
        if(curr.x == end.x && curr.y == end.y){
            var path = [explored[end.y][end.x]];
            //I know this is really unclear, but I like how it fits in one line
            while(path[0].x != start.x || path[0].y != start.y) path.unshift(explored[path[0].y][path[0].x]);
            path.shift();
            return path;
        }
        adj = adjacentTiles(curr, map, explored);
        for(var i = 0; i < adj.length; i++){
            var insert = true;
            for(var j = 0; j < exploring.length; j++){
                if(exploring[j].x == adj[i].x && exploring[j].y == adj[i].y){
                    insert = adj[i].gScore < exploring[j].gScore;
                    if(insert){
                        exploring.splice(j, 1);
                    }
                    break;
                }
            }
            if(insert){
                adj[i].from = {x:curr.x, y:curr.y};
                adj[i].fScore = Math.abs(end.x - adj[i].x) + Math.abs(end.y - adj[i].y) + adj[i].gScore;
                for(var j = 0; j <= exploring.length; j++){
                    if(j == exploring.length){
                        exploring.push(adj[i]);
                        break;
                    }
                    if(exploring[j].fScore > adj[i].fScore){
                        exploring.splice(j, 0, adj[i]);
                        break
                    }
                }
            }
        }
    }
    return null;
}

function adjacentTiles(tile, map, explored){
    var ret = [];
    //make sure each adjacent tile is within the bounds of the map, not a wall, and hasn't been explored, before adding it to return values
    if(tile.x + 1 < map.width && map.getTile(tile.x+1, tile.y) == null && explored[tile.y][tile.x+1] == null)
        ret.push({gScore:tile.gScore+1, x:tile.x+1, y:tile.y});
    if(tile.y + 1 < map.height && map.getTile(tile.x, tile.y+1) == null && explored[tile.y+1][tile.x] == null)
        ret.push({gScore:tile.gScore+1, x:tile.x, y:tile.y+1});
    if(tile.x - 1 >= 0 && map.getTile(tile.x-1, tile.y) == null && explored[tile.y][tile.x-1] == null)
        ret.push({gScore:tile.gScore+1, x:tile.x-1, y:tile.y});
    if(tile.y - 1 >= 0 && map.getTile(tile.x, tile.y-1) == null && explored[tile.y-1][tile.x] == null)
        ret.push({gScore:tile.gScore+1, x:tile.x, y:tile.y-1});
    //diagonals
    if(tile.x - 1 >= 0 && tile.y - 1 >=0 && map.getTile(tile.x-1, tile.y-1) == null && explored[tile.y-1][tile.x-1] == null)
        ret.push({gScore:tile.gScore+Math.sqrt(2), x:tile.x-1, y:tile.y-1});
    if(tile.x - 1 >= 0 && tile.y + 1 < map.height && map.getTile(tile.x-1, tile.y+1) == null && explored[tile.y+1][tile.x-1] == null)
        ret.push({gScore:tile.gScore+Math.sqrt(2), x:tile.x-1, y:tile.y+1});
    if(tile.x + 1 < map.width && tile.y - 1 >=0 && map.getTile(tile.x+1, tile.y-1) == null && explored[tile.y-1][tile.x+1] == null)
        ret.push({gScore:tile.gScore+Math.sqrt(2), x:tile.x+1, y:tile.y-1});
    if(tile.x + 1 < map.width && tile.y + 1 < map.height && map.getTile(tile.x+1, tile.y+1) == null && explored[tile.y+1][tile.x+1] == null)
        ret.push({gScore:tile.gScore+Math.sqrt(2), x:tile.x+1, y:tile.y+1});
    return ret;
}

function worldPosToTilePos(worldX, worldY, map){
    //needs work (get actual tile width/height from the object instead of just knowing it's 32)
    return {x:Math.floor(worldX / 32), y:Math.floor(worldY / 32)}
}

function changeAnimation(enemySprite, wall){
    var enemy = findContainingObject(enemySprite, enemiesArray);

    if(enemySprite.animations.currentAnim.name == "movingdown") enemy.up();
    else if(enemySprite.animations.currentAnim.name == "movingup") enemy.down();
    else if(enemySprite.animations.currentAnim.name == "movingright") enemy.left();
    else enemy.right();
}

function stopAnimation(player, enemySprite){
    enemySprite.body.velocity.x = 0;
    enemySprite.body.velocity.y = 0;
    enemySprite.animations.stop();
    if(enemySprite.animations.currentAnim.name == "movingdown") enemySprite.frame = 0;
    if(enemySprite.animations.currentAnim.name == "movingup") enemySprite.frame = 12;
    if(enemySprite.animations.currentAnim.name == "movingleft") enemySprite.frame = 8;
    if(enemySprite.animations.currentAnim.name == "movingright") enemySprite.frame = 9;
}

function stageComplete(){
    var numAccountedFor = 0;
    for(var i = 0; i < prisonerArray.length; i++){
        if(!prisonerArray[i].story.truth || prisonerArray[i].accepted){
            numAccountedFor++;
            if(!prisonerArray[i].story.truth && prisonerArray[i].accepted){
                return false;
            }
        }
    }
    return numAccountedFor == prisonerArray.length;
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
        this.load.image('seen', 'Seen.png');
        this.load.spritesheet('accept', 'acceptBtn.png', 125, 50);
        this.load.spritesheet('deny', 'denyBtn.png', 125, 50);
        this.load.atlas('player', 'atlas.png', 'atlas.json');
        this.load.atlas('guard', 'guard.png', 'guards.json');
        this.load.image('camera', 'Camera.png');
        this.load.tilemap('map', 'GameMap.json', null, Phaser.Tilemap.TILED_JSON); //Loding the map with tiles
        this.load.atlas('Prisoner', 'PTest.png', 'PTest.json');
        this.load.image('Menu_Background', 'Menu_Background.png');
        this.load.image('button', 'grey_button.png');
        this.load.bitmapFont('font_game', "font_game.png", "font_game.fnt")

        prisonerStoryList = new StoryList();
    },
    create: function() {
        console.log('Preloader: create');
        //Preventing the key to affect browser view
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN,
                                           Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.ENTER,
                                           Phaser.Keyboard.W, Phaser.Keyboard.A, Phaser.Keyboard.S, Phaser.Keyboard.D]);
    },
    update: function() {
        this.state.start('Menu');
    }
};


function wordWrapBitmapText(text, size, wrapWidth){
    if(text.length == 0){
        return text;
    }
    var maxChars = Math.floor(wrapWidth / size);
    var subs = text.split("\n");
    var ret = "";
    if(subs.length > 1){
        for(var i = 0; i < subs.length; i++){
            ret += wordWrapBitmapText(subs[i], size, wrapWidth);
            ret += "\n";
        }
        return ret;
    }
    subs = text.split(" ");
    for(var i = 0; i < subs.length; i++){
        if(subs[i].length > maxChars){
            subs.splice(i, 1, subs[i].substr(0, maxChars), subs[i].substr(maxChars));
        }
    }
    var lineLength = subs[0].length;
    ret += subs[0];
    for(var i = 1; i < subs.length; i++){
        if(lineLength + subs[i].length > maxChars){
            ret += "\n";
            lineLength = subs[i].length + 1;
        } else {
            ret += " ";
            lineLength += subs[i].length + 1;
        }
        ret += subs[i];
    }
    return ret;
}

GameStateHandler.Menu = function() {
    var button_play, button_options, textplay, textopt;
};
GameStateHandler.Menu.prototype = {
    preload: function() {},
    create: function() {
        var Menu_backGround = this.add.image(0,0, 'Menu_Background');
        Menu_backGround.alpha = 0.35;
        button_play = game.add.button(game.width/2, 200, 'button', this.actionOnClickplay, this);
        button_play.anchor.setTo(0.5, 0.5);
        textplay = game.add.bitmapText(button_play.x, button_play.y, "font_game", 'PLAY', 20);
        textplay.anchor.setTo(0.5, 0.5);
        button_options = game.add.button(game.width/2, 250, 'button',  this.actionOnClickopt, this);
        button_options.anchor.setTo(0.5, 0.5);
        textopt = game.add.bitmapText(button_options.x, button_options.y, "font_game", 'HELP', 20);
        textopt.anchor.setTo(0.5, 0.5);

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
  var button_back, text_back, game_description, game_controls;
};
GameStateHandler.Options_Screen.prototype = {
    create: function() {
        var Menu_backGround = this.add.image(0,0, 'Menu_Background');
        Menu_backGround.alpha = 0.35;
        game_controls = "Controls:\n\tUse the ARROW KEYS to move.\n\tWhile standing still, use the MOUSE to aim your flashlight.\n\t" +
                        "Walk into prisoners to talk to them.\n\tAfter a prisoner or two is with you, press ENTER to call them over.";
        game_description = "Info:\n\tYou're trapped in a strange cyber prison where nobody can tell who's who. You know some of your friends are trapped here too, but " +
                           "there are also disguised cyber guards who are impersonating them! You need to find out who's a guard and who's a friend, doing your best to " +
                           "verify which people truly did get scammed and sent here, and which are making their stories up. Oh, and be careful of cameras and guards-- " +
                           "if you or a prisoner gets seen walking around, you're dead meat!";
        //game_controls = wordWrapBitmapText(game_controls, 9, 700);
        game_description = wordWrapBitmapText(game_description, 9, 700);

        button_back = game.add.button(game.width/2, game.height - 60, 'button', this.actionOnClickback, this);
        text_back = game.add.bitmapText(button_back.x, button_back.y, 'font_game', 'BACK', 20);
        button_back.anchor.setTo(0.5, 0.5);
        text_back.anchor.setTo(0.5, 0.5);

        var title_text = game.add.bitmapText(game.width/2, 40, 'font_game', "Controls and Information", 28)
        var controls_text = game.add.bitmapText(game.width/2, 80, 'font_game', game_controls, 20);
        var descp_text = game.add.bitmapText(controls_text.x, controls_text.y + controls_text.height + 40, 'font_game', game_description, 20);
        controls_text.x -= descp_text.width/2;
        title_text.anchor.setTo(0.5, 0.5);
        descp_text.anchor.setTo(0.5, 0);

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
        prisonerStoryList.reset();
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

        enemiesArray = [];
        prisonerArray = [];

        //creating guards
        enemiesGroup = game.add.group();
        enemiesGroup.enableBody = true;
        new Guard(740, 265).down();
        new Guard(1110, 260).down();
        new Guard(1210, 290).right();
        new Guard(170, 260).left();

        testCamera = new CameraEnemy(510, 60, 0, 90);

        //creating prisoner(s)
        prisoners = game.add.group();
        prisoners.enableBody = true;
        new Prisoner(250, 115);
        new Prisoner(80, 475);
        new Prisoner(1100, 465);
        new Prisoner(1385, 110);
        new Prisoner(1935, 140);
        new Prisoner(1950, 480);

        lightTexture = game.add.bitmapData(map.widthInPixels, map.heightInPixels);
        lightSprite = game.add.image(0, 0, lightTexture);
        lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
        player = new Player(7*32, 7*32);
        game.camera.follow(player.sprite);
        map.addTilesetImage('Tiles', 'tiles');
        groundLayer = map.createLayer('TileLayer'); //creating a layer
        groundLayer.resizeWorld();
        map.setCollisionBetween(0, 10000, true, groundLayer); //enabling collision for tiles used

        for(var i = 0; i < prisonerArray.length; i++){
            prisonerArray[i].makeText();
        }
        
        game.input.addMoveCallback(function(pointer, x, y){
            if(player.sprite.body.velocity.x == 0 && player.sprite.body.velocity.y == 0) player.pointTo(x + game.camera.x, y + game.camera.y);
        }, game);

        cursors = game.input.keyboard.createCursorKeys();
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        spacebarKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },
    update: function() {
        if(stageComplete()){
            console.log("congrats!");
            gameOverTip = "We don't have a win screen or a stage 2 so you get this instead."
            game.state.start("GameOver");
        }

        game.physics.arcade.collide(player.sprite, groundLayer);
        game.physics.arcade.collide(player.sprite, testCamera.sprite);
        game.physics.arcade.collide(player.sprite, prisoners, showText);
        game.physics.arcade.collide(enemiesGroup, groundLayer, changeAnimation);
        game.physics.arcade.collide(player.sprite, enemiesGroup, stopAnimation);

        testCamera.update();

        lightTexture.context.clearRect(game.camera.x, game.camera.y, game.width, game.height);

        doLights([player, testCamera]);
        
        for(var i = 0; i < enemiesArray.length; i++){
            enemiesArray[i].update();
        }

        if(enterKey.justPressed()){
            for(var i = 0; i < prisonerArray.length; i++){
                prisonerArray[i].followPlayer();
            }
        }

        if(spacebarKey.justPressed()){
            for(var i = 0; i < prisonerArray.length; i++){
                prisonerArray[i].TEMPTHING.kill();
            }
        }

        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown){
            for(var i = 0; i < prisonerArray.length; i++){
                prisonerArray[i].stopText();
            }
        }
        player.update(cursors);
   }
};
GameStateHandler.GameOver = function() {
    var button_restart, text_restart;
};
GameStateHandler.GameOver.prototype = {
    create: function() {
        var menu_background = this.add.image(0,0, 'Menu_Background');
        menu_background.alpha = 0.35;
        button_restart = game.add.button(game.width/2, game.height - 60, 'button', this.actionOnClickrestart, this);
        button_restart.anchor.setTo(0.5, 0.5);
        text_restart = game.add.bitmapText(button_restart.x, button_restart.y, 'font_game', 'PLAY AGAIN', 20);
        text_restart.anchor.setTo(0.5, 0.5);
        
        gameOverTip = wordWrapBitmapText(gameOverTip, 10, 550);
        game.add.bitmapText(game.width/2, 100, 'font_game', gameOverTip, 20).anchor.setTo(0.5, 0);
    },
    update: function() {
        if(button_restart.input.pointerOver()) {
            text_restart.fill = 'green';
        } else {
            text_restart.fill = 'black';
        }
    },
    actionOnClickrestart: function() {
        this.state.start('Menu');
    }
};
game.state.add('Preloader', GameStateHandler.Preloader);
game.state.add('Menu', GameStateHandler.Menu);
game.state.add('Options_Screen', GameStateHandler.Options_Screen);
game.state.add('Play', GameStateHandler.Play);
game.state.add('GameOver', GameStateHandler.GameOver);
game.state.start('Preloader');
