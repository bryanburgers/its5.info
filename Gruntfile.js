module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		browserify: {
			dist: {
				options: {
				},
				files: {
					'public/js/somewhere.js': ['client.js'],
				}
			}
		},

		sass: {
			options: {
				style: 'compressed',
				sourcemap: true
			},
			dist: {
				files: {
					'public/css/tmp/style.css': 'public/css/src/style.scss'
				}
			}
		},

		autoprefixer: {
			options: {
				map: true
			},
			dist: {
				options: {
					browsers: ['> 1%', 'last 2 version', 'ie 8', 'ie 9', 'android 2', 'android 4']
				},
				files: {
		  			'public/css/style.css': 'public/css/tmp/style.css',
				}
			}
		},

		watch: {
			options: {
				livereload: true,
			},
			js: {
				files: ['client.js'],
				tasks: ['browserify']
			},
			sass: {
				files: ['public/css/src/**/*.scss'],
				tasks: ['compilecss'],
				options: {
					livereload: false
				}
			},
			css: {
				files: ['public/css/*.css'],
				tasks: []
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('compilecss', ['sass:dist', 'autoprefixer:dist']);

	// Default task(s).
	grunt.registerTask('default', ['browserify', 'compilecss']);
	grunt.registerTask('dev', ['watch']);
};
