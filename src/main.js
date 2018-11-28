import Phaser from 'phaser';

class CompassKata extends Phaser.Scene {
  constructor() {
    super();

    this.platforms = null;
    this.player    = null;
    this.score     = null;
  }

  preload() {
    this.load.image('sky',        'src/assets/sky.png');
    this.load.image('ground',     'src/assets/platform.png');
    this.load.image('star',       'src/assets/star.png');
    this.load.image('bomb',       'src/assets/bomb.png');
    this.load.spritesheet('dude', 'src/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    this.platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    // The player and its settings
    this.player = this.physics.add.sprite(100, 450, 'dude');

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.compass = this.add.sprite(100,450, 'bomb');
    this.compass.setOrigin(0.5,0,5);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    //  Input Events
    this.cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.stars.children.iterate(function (child) {
      //  Give each star a slightly different bounce
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    //  The score
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

  }

  update() {

    this.pointCompassToClosestStar();

    if (this.cursors.left.isDown){
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    }
    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    }
    else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  collectStar (player, star) {
    star.disableBody(true, true);

    //  Add and update the score
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    if (this.stars.countActive(true) === 0) {
      //  A new batch of stars to collect
      this.stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      });
    }
  }

  pointCompassToClosestStar() {
    let playerCenter = this.player.getCenter();
    let playerX = playerCenter.x;
    let playerY = playerCenter.y;

    let nearestStar = this.stars.children[0];
    let shortestDistance = 99999;
    let distance;
    let radians;
    let radius = 50;

    this.stars.children.iterate(function (child) {
      if(child.active) {
        let childX = child.x;
        let childY = child.y;

        distance = Phaser.Math.Distance.Between(playerX, playerY, childX, childY);

        if(distance < shortestDistance) {
          shortestDistance = distance;
          nearestStar = child;
        }
      }
    });

    radians = Phaser.Math.Angle.Between(playerX, playerY, nearestStar.x, nearestStar.y);
    this.compass.x = playerX + (Math.cos(radians) * radius);
    this.compass.y = playerY + (Math.sin(radians) * radius);
  }
}

var config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  parent: 'game',
  scene: [ CompassKata ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
};

var game = new Phaser.Game(config);
