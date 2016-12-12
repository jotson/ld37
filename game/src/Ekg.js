var Ekg = function(x, y) {
    Phaser.Sprite.call(this, game, x, y, 'sprites', 'ekg0001.png');

    this.width = 40;
    this.height = 80;
    this.anchor.setTo(0, 0.5);
};

Ekg.prototype = Object.create(Phaser.Sprite.prototype);
Ekg.prototype.constructor = Ekg;

Ekg.prototype.update = function() {
    if (!this.alive) return;

    this.x -= 20 * game.time.physicsElapsed;

    if (this.x < -40) this.kill();
};

Ekg.create = function() {
    var blip = G.ekgGroup.getFirstDead();
    if (blip === null) {
        blip = G.ekgGroup.add(new Ekg(180, 70));
    }

    var n = Math.floor(Math.random() * 4) + 1;
    blip.frameName = 'ekg000' + n + '.png';

    blip.revive();

    return blip;
};