var EndState = function(game) {
    this.name = 'end';
};

EndState.prototype.create = function() {
    G.setupStage();

    game.stage.backgroundColor = "#ffffff";

    var t = game.add.text(0, 0, 'Again? Press [SPACE]', { font: '48px ' + G.mainFont, fill: '#000000' });
    t.x = game.width/2 - t.getBounds().width/2;
    t.y = game.height * 0.3;

    game.add.tween(t).to({ y: t.y + 10 }, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, Number.POSITIVE_INFINITY, true);

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
