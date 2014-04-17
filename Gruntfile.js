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
		watch: {
			options: {
				livereload: true,
			},
			js: {
				files: ['client.js'],
				tasks: ['browserify']
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['browserify']);
	grunt.registerTask('dev', ['watch']);
};
