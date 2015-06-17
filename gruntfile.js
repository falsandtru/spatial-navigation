module.exports = function(grunt) {
  const srcTypeScript = '{typings/*.d.ts,src/ts/**/{?,??,???,????,*[^.]????}.ts}',
        tstTypeScript = 'src/ts/**/*.test.ts',
        tmpTypeScriptDir = 'temp/ts/',
        tmpTypeScript = 'temp/<%= filename %>.js',
        dstTypeScript = 'dist/raw/<%= filename %>.js';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    filename: '<%= pkg.name %>',

    tslint: {
      source: {
        options: {
          configuration: grunt.file.readJSON("tslint.json")
        },
        files: {
          src: srcTypeScript
        }
      },
      test: {
        options: {
          configuration: grunt.file.readJSON("tslint.test.json")
        },
        files: {
          src: tstTypeScript
        }
      }
    },

    browserify: {
      options: {
        transform: ['strictify'],
        browserifyOptions: {
          extensions: ['.js']
        }
      },
      ts: {
        src: tmpTypeScriptDir + '**/*.js',
        dest: tmpTypeScript
      }
    },

    typescript: {
      options: {
        target: 'ES5',
        module: 'commonjs',
        sourceMap: false,
        comments: true
      },
      build: {
        src: [srcTypeScript, tstTypeScript],
        dest: tmpTypeScriptDir
      },
      dist: {
        src: [srcTypeScript],
        dest: tmpTypeScriptDir
      },
      watch: {
        options: {
          watch: {
            before: ['tslint'],
            after:['browserify', 'concat'],
            atBegin: true
          }
        },
        src: [srcTypeScript, tstTypeScript],
        dest: tmpTypeScriptDir
      }
    },

    concat: {
      ts: {
        options: {
          banner: [
            '/**',
            ' * ',
            ' * <%= pkg.name %>',
            ' * ',
            ' * @name <%= pkg.name %>',
            ' * @version <%= pkg.version %>',
            ' * ---',
            ' * @author <%= pkg.author %> <%= pkg.homepage %>',
            ' * @copyright 2015, <%= pkg.author %>',
            ' * @license <%= pkg.license %>',
            ' * ',
            ' */',
            '',
            '!new function(NAME, VERSION) {',
            '"use strict";',
            ''
          ].join('\n'),
          footer: [
            '}("<%= pkg.name %>", "<%= pkg.version %>");',
            ''
          ].join('\n'),
          separator: ''
        },
        src: tmpTypeScript,
        dest: dstTypeScript
      }
    },

    copy: {
      build: {
        files: [
          { expand: false, src: ['node_modules/lazychain/dist/raw/lazychain.d.ts'], dest: 'src/ts/.d/lazychain.d.ts' }
        ]
      },
      dist: {
        files: [
          { expand: true, cwd: 'src/ts/.d/', src: ['<%= filename %>.d.ts'], dest: 'dist/raw/' }
        ]
      }
    },

    compress: {
      options : {
        archive : 'dist/<%= filename %>.zip'
      },
      dist: {
        files: [
          { src: 'manifest.json' },
          { src: 'dist/raw/content-script.js' },
          { src: dstTypeScript }
        ]
      }
    },

    clean: {
      temp: ['temp'],
      dest: ['dist']
    },

    watch: {
      options: {
        livereload: true
      }
    },

    shell: {
      options: {
        async: false,
        stdout: true,
        stderr: true
      },
      dev: {
        options: { async: true },
        command: 'grunt typescript:watch'
      }
    },

    karma: {
      options: {
        configFile: 'karma.conf.js',
      },
      dev: {
        browsers: ['Chrome'],
        singleRun: false
      },
      test: {
        browsers: ['Chrome'],
        singleRun: true
      },
      ci: {
        reporters: process.env.deploy ? ['progress', 'coverage', 'coveralls'] : ['progress', 'coverage'],
        browsers: ['Chrome'],
        flags: ['--no-sandbox'],
        singleRun: true
      }
    },

    coveralls: process.env.deploy ? {
      options: {
        debug: true,
        coverage_dir: 'coverage',
        dryRun: true,
        force: true,
        recursive: true
      }
    } : undefined,
  });


  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-karma-coveralls');
  grunt.loadNpmTasks('grunt-shell-spawn');

  grunt.registerTask('build', ['tslint', 'typescript:build', 'browserify', 'concat', 'copy']);
  grunt.registerTask('dev', ['build', 'shell:dev', 'karma:dev']);
  grunt.registerTask('test', ['build', 'karma:test']);
  grunt.registerTask('dist', ['clean', 'tslint', 'typescript:dist', 'browserify', 'concat', 'copy', 'compress:dist', 'clean:temp']);
};
