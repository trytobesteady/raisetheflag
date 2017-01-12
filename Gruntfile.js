module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            css: {
                files: ['scss/*.scss'],
                tasks: ['css'],
                options: {
                    interrupt: true
                }
            },
            js: {
                files: ['js-src/**/*.js'],
                tasks: ['js'],
                options: {
                    interrupt: true
                }
            }
        },

        compass: {
            desktop: {
                options: {
                    sassDir: 'scss',
                    cssDir: 'css',
                    outputStyle: 'compressed'
                }
            }
        },

        cssmin: {
            target: {
                files: [{
                    expand:true,
                    cwd: 'css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'css',
                    ext: '.min.css'
                }]
            }
        },

        concat: {
            options: { separator: ';' },
            all: {
                src: [
                    'js-src/**/*.js'
                ],
                dest: 'js/scripts.js'
            }
        },

        uglify: {
            options: {
                compress: false,
                wrap: true,
                reserveDOMProperties: true
            },
            all: {
                files: {
                    'js/scripts.js': ['js/scripts.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('css', ['compass', 'cssmin']);
    grunt.registerTask('js', ['concat', 'uglify']);
    grunt.registerTask('default', ['watch']);
};
