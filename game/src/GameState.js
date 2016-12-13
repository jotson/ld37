var GameState = function(game) {
    this.name = 'game';
    this.baseHeartrate = G.STARTING_HEART_RATE;
    this.heartrate = G.STARTING_HEART_RATE;
    this.timeToNextHeartbeat = 0;
    this.crisis = {
        active: false,
        timeSinceLast: 0,
        count: 0
    };
    this.alive = true;
    this.gameover = false;
    this.keybash = {
        lastkey: Phaser.Keyboard.RIGHT,
        score: 0,
        timeSinceLast: 0
    };
    this.testFinalScene = true;
};

GameState.prototype.create = function() {
    G.setupStage();

    this.resetGame();

    // Start clouds
    this.clouds = game.add.tileSprite(0, 0, 600, 200, 'sprites', 'clouds.png');
    this.clouds.tilePosition.x = Math.random() * 600;
    this.clouds.alpha = 0.9;
    this.clouds2 = game.add.tileSprite(0, -80, 600, 200, 'sprites', 'clouds.png');
    this.clouds2.tilePosition.x = Math.random() * 600;
    this.clouds2.scale.setTo(2,2);
    this.clouds2.alpha = 0.5;

    // Add room background
    game.add.sprite(0, 0, 'sprites', 'room-background.png');

    // Setup chair and friend
    this.chair = game.add.sprite(20, 300, 'sprites', 'chair.png').anchor.setTo(0,1);
    this.friend = game.add.sprite(20, 110, 'sprites', 'friend0001.png');
    this.friend.animations.add('down', ['friend0001.png'], 1, true);
    this.friend.animations.add('blink-right', ['friend0002.png', 'friend0003.png', 'friend0002.png'], 10, false);
    this.friend.animations.add('blink-left', ['friend0004.png', 'friend0005.png', 'friend0004.png'], 10, false);
    this.friend.animations.add('ghost', ['friend0002.png', 'friend0004.png'], 2, true);
    this.friend.animations.play('down');

    // Setup ekg
    this.ekg = game.add.sprite(400, 0, 'sprites', 'ekg.png');
    this.heartratetext = game.make.text(12, 10, this.heartrate, { font: '28px ' + G.mainFont, fill: '#00ff00' });
    this.heart = game.make.sprite(50, 15, 'sprites', 'heart.png');
    this.ekg.addChild(this.heartratetext);
    this.ekg.addChild(this.heart);
    this.mask = game.add.graphics(406, 10);
    this.mask.beginFill(0xffffff);
    this.mask.drawRect(0, 0, 188, 116);
    G.ekgGroup = game.add.group();
    G.ekgGroup.x = 406;
    G.ekgGroup.y = 10;
    G.ekgGroup.mask = this.mask;

    // Setup machine
    this.machine = game.add.sprite(498, 140, 'sprites', 'machine.png');
    this.glow = game.make.sprite(48, 12, 'sprites', 'glow.png');
    game.time.events.loop(150, function() {
        game.add.tween(this.glow).to({ alpha: Math.random() * 0.6 + 0.3 }, 100).start();
    }, this);
    this.machine.addChild(this.glow);

    // Setup bed and patient
    this.bed = game.add.sprite(135, 100, 'sprites', 'bed.png');
    this.chest = game.add.sprite(166, 68, 'sprites', 'chest0000.png');
    this.chest.scale.setTo(0.7, 1);
    this.chest.animations.add('breathing', ['chest0000.png', 'chest0001.png', 'chest0002.png', 'chest0003.png', 'chest0004.png', 'chest0003.png', 'chest0002.png', 'chest0001.png', 'chest0000.png', 'chest0000.png'], 4, true);
    this.chest.animations.play('breathing');
    this.face = game.add.sprite(250, 45, 'sprites', 'face.png');
    this.bed.addChild(this.face);
    this.bed.addChild(this.chest);

    // Setup clock
    this.clock = game.add.sprite(320, 30, 'sprites', 'clock.png');
    this.clockhour = game.make.sprite(this.clock.width/2, this.clock.height/2, 'sprites', 'clock-hour.png');
    this.clockhour.anchor.setTo(0.5, 1);
    this.clockhour.angle = Math.random() * 360;
    this.clockminute = game.make.sprite(this.clock.width/2, this.clock.height/2, 'sprites', 'clock-minute.png');
    this.clockminute.anchor.setTo(0.5, 1);
    this.clockminute.angle = Math.random() * 360;
    this.clock.addChild(this.clockhour);
    this.clock.addChild(this.clockminute);

    // Setup keys
    this.keys = game.add.sprite(320, 180, 'sprites', 'key-all.png');
    this.keys.anchor.setTo(0.5, 0.5);
    this.keys.animations.add('struggle', ['key-left.png', 'key-right.png'], 10, true);
    this.keys.animations.add('all', ['key-all.png'], 1, true);
    this.keys.animations.play('struggle');
    this.keys.alpha = 0;

    // Setup ghost
    this.ghost = game.add.sprite(0, 0, 'sprites', 'ghost0001.png');
    this.ghost.animations.add('default', Phaser.Animation.generateFrameNames('ghost', 1, 8, '.png', 4), 8, true);
    this.ghost.animations.play('default');
    this.ghost.scale.setTo(2,2);
    this.ghost.anchor.setTo(0.5, 0.5);
    this.ghost.x = 320;
    this.ghost.y = 180;
    this.ghost.alpha = 0;
    this.timeWarp = 1;
    game.physics.arcade.enable(this.ghost);
};

GameState.prototype.resetGame = function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
};

GameState.prototype.update = function() {
    var totalElapsed = game.time.elapsed;
    var elapsed = game.time.physicsElapsed;

    // Clouds
    this.clouds.tilePosition.x -= 8 * elapsed;
    this.clouds2.tilePosition.x -= 1 * elapsed;

    // Clock
    this.clockhour.angle += 0.25 * elapsed * this.timeWarp;
    this.clockminute.angle += 0.25 * elapsed * 12 * this.timeWarp;

    // Animate friend
    if (Math.random() < 0.3 * elapsed) {
        if (Math.random() * 3 < 2) {
            this.friend.animations.play('blink-right');
        } else {
            this.friend.animations.play('blink-left');
        }
        if (Math.random() * 2 < 1) {
            this.friend.animations.play('down');
        }
    }

    if (this.alive) {
        if (this.crisis.active) {
            if (!G.sfx.heartbeat.isPlaying) {
                G.sfx.heartbeat.loopFull(0);
                game.add.tween(G.sfx.heartbeat).to({ volume: 0.6 }, 3000).start();
            }
            if (!G.sfx.alarm.isPlaying) {
                G.sfx.alarm.loopFull(0);
                game.add.tween(G.sfx.alarm).to({ volume: 0.5 }, 3000).start();
            }

            // Read keyboard input
            if (game.input.keyboard.downDuration(Phaser.Keyboard.LEFT, 10)) {
                if (this.keybash.lastkey == Phaser.Keyboard.RIGHT) {
                    this.keybash.score++;
                    this.keybash.timeSinceLast = 0;
                }
                this.keybash.lastkey = Phaser.Keyboard.LEFT;
            }
            if (game.input.keyboard.downDuration(Phaser.Keyboard.RIGHT, 10)) {
                if (this.keybash.lastkey == Phaser.Keyboard.LEFT) {
                    this.keybash.score++;
                    this.keybash.timeSinceLast = 0;
                }
                this.keybash.lastkey = Phaser.Keyboard.RIGHT;
            }
            this.keybash.score -= G.KEYBASH_DECREASE_RATE * elapsed;
            if (this.keybash.score < 0) this.keybash.score = 0;
            this.keybash.timeSinceLast += elapsed;

            // Play ominous heartbeat
            if (this.keybash.score < G.MIN_KEYBASH_SCORE) {
                G.sfx.heartbeat.volume = 0.6;
            } else {
                G.sfx.heartbeat.volume = 0.2;
            }

            if (this.testFinalScene) {
                this.keybash.score = 0;
                G.CRISIS_LENGTH = 0;
                G.sfx.heartbeat.stop();
                G.sfx.alarm.stop();
            }

            // End crisis
            if (this.crisis.timeSinceLast > G.CRISIS_LENGTH) {
                if (this.keybash.score > 0) {
                    console.log('crisis averted');
                    game.add.tween(this.keys).to({ alpha: 0 }, 500).start();
                    this.crisis.timeSinceLast = 0;
                    this.crisis.active = false;
                    this.baseHeartrate = G.STARTING_HEART_RATE;
                }

                if (this.keybash.score <= 0) {
                    console.log('...and death');
                    game.add.tween(this.keys).to({ alpha: 0.7, x: 70, y: 310 }, 1000, Phaser.Easing.Sinusoidal.InOut, false, 3000).start();
                    this.keys.animations.play('all');
                    this.alive = false;

                    // Fade out alarm sound
                    G.sfx.alarm.stop();

                    // Fade out heartbeat sound
                    game.add.tween(G.sfx.heartbeat).to({ volume: 0 }, 2000).start();

                    // Fade in ghost sound
                    G.sfx.ghost.loopFull(0);
                    game.add.tween(G.sfx.ghost).to({ volume: 0.5 }, 5000).start();

                    // Fade in ghost
                    game.add.tween(this.ghost).to({ alpha: 1 }, 5000).start();
                }
            }
        }

        if (!this.crisis.active) {
            G.sfx.heartbeat.stop();
            G.sfx.alarm.stop();

            // Heartrate
            if (this.timeToNextHeartbeat <= 0) {
                this.heartrate = Math.max(0, this.baseHeartrate + Math.floor(Math.random() * 3 - 2));

                if (this.heartrate > 0) {
                    // Draw ekg
                    G.sfx.ekg.play();

                    this.heart.alpha = 1;
                    game.add.tween(this.heart).to({ alpha: 0.3 }, 200).start();

                    this.timeToNextHeartbeat = 60 / this.heartrate;

                    var blip = Ekg.create();
                    blip.scale.x = Math.max(Math.min(1, 20/this.heartrate),0.25);
                    blip.x = 185;
                }

                if (this.crisis.timeSinceLast > G.NON_CRISIS_LENGTH || this.crisis.count >= 3 || this.testFinalScene) {
                    this.baseHeartrate -= G.HEART_RATE_CHANGE_RATE;

                    if (this.baseHeartrate < G.MIN_HEART_RATE || this.testFinalScene) {
                        console.log('crisis!');
                        game.add.tween(this.keys).to({ alpha: Math.max(0, 1 - this.crisis.count/5) }, 500).start();
                        this.keybash.score = G.MIN_KEYBASH_SCORE;
                        this.heartrate = 0;
                        this.crisis.active = true;
                        this.crisis.timeSinceLast = 0;
                        this.crisis.count++;
                    }
                }
            }
        }

        this.crisis.timeSinceLast += elapsed;
        this.heart.x = this.heartratetext.x + this.heartratetext.width + 5;
        this.timeToNextHeartbeat -= elapsed;
        this.heartratetext.text = this.heartrate;
    }

    if (!this.alive) {
        // Ghost input
        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.ghost.body.velocity.x = -60;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.ghost.body.velocity.x = 60;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            this.ghost.body.velocity.y = -60;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.ghost.body.velocity.y = 60;
        }

        // Out of bounds
        if (this.ghost.x < this.ghost.width/2) {
            this.ghost.x = this.ghost.width/2 + 1;
        }

        if (this.ghost.x > 640 - this.ghost.width/2) {
            this.ghost.x = 640 - this.ghost.width/2 - 1;
        }

        this.ghost.body.drag.setTo(30);

        // Ghost touching friend
        if (this.ghost.x < 140 && this.ghost.y > 60) {
            this.friend.animations.play('ghost');
        }

        // Ghost touching ekg
        this.heart.alpha = 0;
        if (this.ghost.x > 360 && this.ghost.y < 200) {
            this.heart.alpha = Math.random();
        }

        // Ghost touching clock
        this.timeWarp = 1;
        if (this.ghost.x > 290 && this.ghost.x < 400 && this.ghost.y < 140) {
            this.timeWarp = 500;
        }

        // TODO Ghost up or down fade and music swell

        // TODO Ghost off screen show "Again?"
    }
};
