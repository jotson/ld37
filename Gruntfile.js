module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        "uglify": {
            options: {
                banner: '//! Copyright © 2016 John Watson <john@watson-net.com> All rights reserved\n// Build date: <%= grunt.template.today("yyyy-mm-dd") %>\n',
                mangle: {
                    toplevel: true
                }
            },
            build: {
                src: 'game/src/*.js',
                dest: 'build/game.min.js'
            }
        },

        "copy": {
            index: {
                src: 'game/index-build.html',
                dest: 'build/index.html'
            },
            nodewebkit: {
                src: 'game/package.json',
                dest: 'build/package.json'
            },
            icon: {
                src: 'game/assets/gfx/icon.png',
                dest: 'build/assets/gfx/icon.png'
            },
            gfx: {
                expand: true,
                cwd: 'game',
                src: 'assets/gfx/atlas/*',
                dest: 'build/'
            },
            sfx: {
                expand: true,
                cwd: 'game',
                src: ['assets/sfx/*.mp3', 'assets/sfx/*.ogg'],
                dest: 'build/'
            },
            fnt: {
                expand: true,
                cwd: 'game',
                src: 'assets/fnt/*',
                dest: 'build/'
            },
            css: {
                expand: true,
                cwd: 'game',
                src: 'assets/css/*',
                dest: 'build/'
            },
            phaser: {
                src: 'game/lib/phaser.min.js',
                dest: 'build/phaser.min.js'
            }
        },

        "zip": {
            "node-webkit": {
                cwd: 'build/',
                src: ['build/**'],
                dest: 'build/<%= pkg.name %>.zip'
            }
        },

        "connect": {
            server: {
                options: {
                    port: 8080,
                    open: 'http://localhost:8080/game/'
                }
            }
        },

        "sfx": {
            all: {
                options: {
                    src: "game/assets/sfx/*.wav"
                }
            }
        },

        "atlas": {
            sprites: {
                options: {
                    src: "game/assets/gfx/sprites/**/*.png",
                    name: "sprites",
                    path: "game/assets/gfx/atlas/",
                    format: "json",
                    powerOfTwo: true,
                    padding: 1,
                    scale: '100%',
                    trim: false
                }
            },
            preloader: {
                options: {
                    src: "game/assets/gfx/preloader/*.png",
                    name: "preloader",
                    path: "game/assets/gfx/atlas/",
                    format: "json",
                    powerOfTwo: true,
                    padding: 1,
                    scale: '100%',
                    trim: false
                }
            }
        },

        "watch": {
            "atlas": {
                files: ['**/assets/gfx/sprites/*.png', '**/assets/gfx/preloader/*.png'],
                tasks: ['atlas']
            },
            "scripts": {
                files: ['game/index.html', 'game/assets/css/**', 'game/src/**', 'game/assets/gfx/atlas/**'],
                options: {
                    livereload: true
                }
            },
            "sfx": {
                files: ['game/assets/sfx/*.wav'],
                tasks: ['sfx'],
                options: {
                    livereload: true
                }
            }
        },

        "clean": {
            build: ['build/', 'game/assets/gfx/atlas/']
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Task to run webserver and watch
    grunt.registerTask('run', ['connect', 'watch']);

    // Task to build a texture atlas (spritesheet-js)
    // https://github.com/krzysztof-o/spritesheet.js
    // https://www.npmjs.org/package/spritesheet-js
    grunt.task.registerMultiTask('atlas', 'Generate texture atlas', function () {
        var done = this.async(); // Force into async mode and return handle to done() function

        var options = this.options();

        // Build new atlas
        var spritesheet = require('spritesheet-js');
        spritesheet(options.src, options, function (err) {
            if (err) throw err;
            console.log("Generated " + options.name + ".json");
            done(); // Call done() when the async spritesheet generator is finished
        });
    });

    /**
     * Task to build mp3 and ogg format sfx resources from wav files
     */
    grunt.task.registerMultiTask('sfx', 'Create ogg files from mp3s', function () {
        var done = this.async();
        var glob = require("glob");

        var options = this.options();

        // Build sounds
        var fs = require('fs');
        var exec = require('child_process').exec;
        glob(options.src, {}, function (er, files) {
            for (var i = 0; i < files.length; i++) {
                var f = files[i];
                f = f.replace('.wav', '');
                var stat = fs.statSync(f + ".wav");

                var updateMp3 = false;
                var updateOgg = false;

                try {
                    var statmp3 = fs.statSync(f + ".mp3");
                    if (stat.mtime > statmp3.mtime) updateMp3 = true;
                } catch (ex) {
                    console.log(ex);
                    updateMp3 = true;
                }
                try {
                    var statogg = fs.statSync(f + ".ogg");
                    if (stat.mtime > statogg.mtime) updateOgg = true;
                } catch (ex) {
                    console.log(ex);
                    updateOgg = true;
                }

                var cmd;
                if (updateMp3) {
                    console.log("Updating " + f + ".mp3");
                    cmd = exec("ffmpeg -y -v quiet -i " + f + ".wav -acodec libmp3lame -ab 128k " + f + ".mp3");
                }
                if (updateOgg) {
                    console.log("Updating " + f + ".ogg");
                    cmd = exec("ffmpeg -y -v quiet -i " + f + ".wav -acodec libvorbis  -ab 128k " + f + ".ogg");
                }
            }
        });

        done();
    });

    // Default task(s).
    grunt.registerTask('default', ['clean:build', 'atlas', 'sfx', 'uglify', 'copy', 'zip']);
};
