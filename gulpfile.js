'use strict';

const gutil = require('gulp-util');
const runSequence = require('run-sequence');
const clean = require('gulp-clean');
const gulp = require('gulp');
const gulpDotFlatten = require('./libs/gulp-dot-flatten.js');
const gulpRename = require('gulp-rename');
const path = require('path');
const PluginError = require('gulp-util').PluginError;
const buildTarget = "";

/*********/
/* TASKS */
/*********/

gulp.task('clean', function () {
    return gulp.src(['dist/tmp/', 'dist/' + buildTarget], { read: false, allowEmpty: true })
        .pipe(clean());
});

gulp.task('compile-flattened', function() {
    return gulp.src('src/**/*.js')
        .pipe(gulpDotFlatten(0))
        .pipe(gulp.dest('dist/'));
});

gulp.task('compile', function() {
    runSequence('clean', 'compile-flattened', function() {
        //
    });
});

gulp.task('watchLocal', function () {
    gulp.watch('src/**/*.js', ['compile'])
        .on('all', function(event, path, stats) {
            console.log('');
            gutil.log(gutil.colors.green('File ' + path + ' was ' + event + 'ed, running tasks...'));
        })
        .on('error', function () {
            gutil.log(gutil.colors.green('Error during build tasks: aborting'));
        });
});

gulp.task('build', function buildDone(done) {
    gutil.log(gutil.colors.green('Build done'));
    return done();
});
gulp.task('default', ['compile', 'watchLocal']);