'use strict';

module.exports = function(grunt) {

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Configurable paths
	var config = {
		source: 'docs',
		dist: 'dist'
	};

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		// Project settings
		config: config,

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			gruntfile: {
				files: ['Gruntfile.js']
			},
			sass: {
				files: ['<%= config.source %>/styles/{,*/}*.{scss,sass}', 'lib/{,*/}*.{scss,sass}'],
				tasks: ['sass:server']
			},
			styles: {
				files: ['<%= config.source %>/styles/{,*/}*.css'],
				tasks: ['newer:copy:styles']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= config.source %>/{,*/}*.html',
					'.tmp/styles/{,*/}*.css'
				]
			}
		},

		// The actual grunt server settings
		connect: {
			options: {
				port: 4567,
				open: true,
				livereload: 35729,
				hostname: 'localhost'
			},
			livereload: {
				options: {
					middleware: function(connect) {
						return [
							connect.static('.tmp'),
						 	connect.static(config.source)
						];
					}
				}
			},
			dist: {
				options: {
					base: '<%= config.dist %>',
					livereload: false
				}
			}
		},

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= config.dist %>/*',
						'!<%= config.dist %>/.git*'
					]
				}]
			},
			server: '.tmp'
		},

		// Compiles Sass to CSS and generates necessary files if requested
		sass: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.source %>/styles',
					src: ['*.{scss,sass}'],
					dest: '.tmp/styles',
					ext: '.css'
				}]
			},
			server: {
				files: [{
					expand: true,
					cwd: '<%= config.source %>/styles',
					src: ['*.{scss,sass}'],
					dest: '.tmp/styles',
					ext: '.css'
				}]
			}
		},

		// Renames files for browser caching purposes
		rev: {
			dist: {
				files: {
					src: [
						'<%= config.dist %>/styles/{,*/}*.css',
						'<%= config.dist %>/*.{ico,png}'
					]
				}
			}
		},

		// Reads HTML for usemin blocks
		useminPrepare: {
			options: {
				dest: '<%= config.dist %>'
			},
			html: '<%= config.source %>/index.html'
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			options: {
				assetsDirs: [
					'<%= config.dist %>',
					'<%= config.dist %>/styles'
				]
			},
			html: ['<%= config.dist %>/{,*/}*.html'],
			css: ['<%= config.dist %>/styles/{,*/}*.css']
		},

		htmlmin: {
			dist: {
				options: {
					collapseBooleanAttributes: true,
					collapseWhitespace: true,
					conservativeCollapse: true,
					removeAttributeQuotes: true,
					removeCommentsFromCDATA: true,
					removeEmptyAttributes: true,
					removeOptionalTags: true,
					removeRedundantAttributes: true,
					useShortDoctype: true
				},
				files: [{
					expand: true,
					cwd: '<%= config.dist %>',
					src: '{,*/}*.html',
					dest: '<%= config.dist %>'
				}]
			}
		},

		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.source %>',
					dest: '<%= config.dist %>',
					src: [
						'*.{ico,png,txt}',
						'{,*/}*.html',
					]
				}, {
					src: 'node_modules/apache-server-configs/dist/.htaccess',
					dest: '<%= config.dist %>/.htaccess'
				}]
			},
			styles: {
				expand: true,
				dot: true,
				cwd: '<%= config.source %>/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			}
		},

		// Run some tasks in parallel to speed up build process
		concurrent: {
			server: [
				'sass:server',
				'copy:styles'
			],
			dist: [
				'sass',
				'copy:styles'
			]
		},

		// Deploy documentation to github pages
		'gh-pages': {
			options: {
				base: 'dist'
			},
			src: ['**']
		}
	});

	grunt.registerTask('serve', 'start the server, --allow-remote for remote access', function (target) {
		if (grunt.option('allow-remote')) {
			grunt.config.set('connect.options.hostname', '0.0.0.0');
		}
		if (target === 'dist') {
			return grunt.task.run(['build', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
			'concurrent:server',
			'connect:livereload',
			'watch'
		]);
	});

	grunt.registerTask('build', [
		'clean:dist',
		'useminPrepare',
		'concurrent:dist',
		'concat',
		'cssmin',
		'copy:dist',
		'rev',
		'usemin',
		'htmlmin'
	]);

	grunt.registerTask('deploy', [
		'build',
		'gh-pages-clean',
		'gh-pages'
	]);

};