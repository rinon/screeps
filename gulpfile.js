'use strict';

const runSequence = require('run-sequence');
const clean = require('gulp-clean');
const gulp = require('gulp');
const webpack = require('webpack-stream');
// const path = require('path');
const gulpInsert = require('gulp-insert');
const gulpDotFlatten = require('./libs/gulp-dot-flatten.js');

gulp.task('clean', function () {
    return gulp.src(['dist/tmp/', 'dist/'], { read: false, allowEmpty: true })
        .pipe(clean());
});

gulp.task('compile-flattened', function() {
    gulp.src('./src/main.js')
        .pipe(webpack({
            mode: 'production',
            watch: false,
            output: {
                filename: 'main.js'
            }
        }))
        .pipe(gulpInsert.prepend('module.exports='))
        .pipe(gulp.dest('./integTest'));
    return gulp.src('src/**/*.js')
        .pipe(gulpDotFlatten(0))
        .pipe(gulp.dest('dist/'));
});

gulp.task('compile', function() {
    runSequence('clean', 'compile-flattened');
});

gulp.task('watchLocal', function () {
    gulp.watch('src/**/*.js', ['compile']);
});
gulp.task('default', ['compile', 'watchLocal']);