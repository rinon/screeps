'use strict';

const clean = require('gulp-clean');
const gulp = require('gulp');
const webpack = require('webpack-stream');
// const path = require('path');
const gulpInsert = require('gulp-insert');
const gulpDotFlatten = require('./libs/gulp-dot-flatten.js');
const gulpJasmine = require('gulp-jasmine');
const ts = require('gulp-typescript');

gulp.task('clean', function () {
    return gulp.src(['dist/tmp/', 'dist/'], { read: false, allowEmpty: true })
        .pipe(clean());
});

gulp.task('unit-test', function() {
    return gulp.src('./spec/unit_tests/**/*[sS]pec.js')
        .pipe(gulpJasmine());
});

gulp.task('integ-test', function() {
    return gulp.src('./spec/integ_tests/**/*[sS]pec.js')
        .pipe(gulpJasmine({reporter: {
            fails: 0,
            successes: 0,
            specDone: function(result) {
                console.log("--------------------------------");
                console.log('\x1b[36mSpec: ' + result.description + ' was ' + result.status + "\x1b[0m");
                for(var i = 0; i < result.failedExpectations.length; i++) {
                    console.log('Failure: ' + result.failedExpectations[i].message);
                    console.log(result.failedExpectations[i].stack);
                }
                if (result.status == "passed") {
                    this.successes++;
                } else {
                    this.fails++;
                }
            },
            jasmineDone: function() {
                console.log("================================");
                console.log("\x1b[36mSuccess: " + this.successes + ", Fails: " + this.fails + "\x1b[0m");
                process.exit();
            }
            }}));
});

gulp.task('compile-flattened', function() {
    return gulp.src('src/**/*.ts')
        .pipe(ts({removeComments: true, module: 'commonjs', isolatedModules: true, target: 'ES6'}))
        .pipe(gulpDotFlatten(0))
        .pipe(gulp.dest('dist/'));
});

gulp.task('compile-integ', function() {
    return gulp.src('./dist/main.js')
        .pipe(webpack({
            mode: 'development',
            // mode: 'production', Minifying it makes it unreadable my the mock server
            watch: false,
            output: {
                filename: 'main.js'
            }
        }))
        .pipe(gulpInsert.prepend('module.exports='))
        .pipe(gulp.dest('./integTest'));
});

gulp.task('compile', gulp.series('clean', 'compile-flattened', 'compile-integ'));

gulp.task('watchLocal', function () {
    gulp.watch('src/**/*.ts', gulp.series('compile'));
});
gulp.task('default', gulp.series('compile', 'watchLocal'));