var DEBUG_PRELOADER = false;
if (DEBUG_PRELOADER) {
    Phaser.Loader.prototype.originalNextFile = Phaser.Loader.prototype.nextFile;

    Phaser.Loader.prototype.nextFile = function(previousIndex, success) {
        var self = this;
        window.setTimeout(function() { Phaser.Loader.prototype.originalNextFile.call(self, previousIndex, success); }, 100);
    };
}

var PreloadState = function(game) {
};

PreloadState.prototype.preload = function() {
    // Show progress bar
    var preloadIcon = game.add.sprite(0, 0, 'preloader', 'preloader-icon.png');
    preloadIcon.y = game.height/2 - preloadIcon.height - 20;
    preloadIcon.x = game.width/2 - preloadIcon.width/2;

    var preloadBg = game.add.sprite(0, 0, 'preloader', 'preloader-bg.png');
    preloadBg.y = game.height/2 - preloadBg.height/2;
    preloadBg.x = game.width/2 - preloadBg.width/2;

    var preloadFg = game.add.sprite(0, 0, 'preloader', 'preloader-fg.png');
    preloadFg.y = game.height/2 - preloadFg.height/2;
    preloadFg.x = game.width/2 - preloadFg.width/2;

    game.load.setPreloadSprite(preloadFg);

    // Setup load callback
    game.load.onFileComplete.add(this.fileLoaded, this);

    // Load assets
    game.load.atlasJSONHash('sprites', 'assets/gfx/atlas/sprites.png', 'assets/gfx/atlas/sprites.json');

    game.load.audio('ekg', ['assets/sfx/ekg.ogg', 'assets/sfx/ekg.mp3']);
    game.load.audio('heartbeat', ['assets/sfx/heartbeat.ogg', 'assets/sfx/heartbeat.mp3']);
    game.load.audio('alarm', ['assets/sfx/alarm.ogg', 'assets/sfx/alarm.mp3']);
};

PreloadState.prototype.create = function() {
    // Setup sound effects
    G.sfx.ekg = game.add.sound('ekg', 0.8, false);
    G.sfx.heartbeat = game.add.sound('heartbeat', 0.8, false);
    G.sfx.alarm = game.add.sound('alarm', 0.8, false);
    // G.sfx.music = game.add.sound('music', 0.3, true);
    // G.sfx.music.play();

    game.stage.backgroundColor = G.backgroundColor;

    // Delay to allow web fonts to load
    game.add.text(10, 10, '...', { font: '6px ' + G.mainFont, fill: '#ffffff' });
    G.fadeOut(1000, G.backgroundColor);
    game.time.events.add(1000, function() { game.state.start('game'); }, this);
};

PreloadState.prototype.update = function() {
};

PreloadState.prototype.fileLoaded = function(progress, key, success, totalLoaded, totalFiles) {
};
