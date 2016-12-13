var EndState = function(game) {
    this.name = 'end';
};

EndState.prototype.create = function() {
    G.setupStage();

    game.stage.backgroundColor = "#ffffff";

    var t = game.add.text(0, 0, 'Again? Press [SPACE]', { font: '28px ' + G.mainFont, fill: '#000000' });
    t.x = game.width/2 - t.getBounds().width/2;
    t.y = game.height * 0.3;

    game.add.tween(t).to({ alpha: 0.5 }, 1000, Phaser.Easing.Sinusoidal.InOut, true, 0, 0, true).loop();

    game.input.onDown.add(this.restart, this);
};

EndState.prototype.update = function() {
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        this.restart();
    }
};

EndState.prototype.restart = function() {
    G.sfx.ghost.stop();
    game.state.start('game');
};
