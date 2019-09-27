var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();

function css(callback) {

  gulp.src('./public/styles/*.less')
    .pipe(less())
    .pipe(gulp.dest('./public/styles'));

  browserSync.reload();

  if (callback) {
    callback();
  }

}

function html(callback) {

  browserSync.reload();

  if (callback) {
    callback();
  }

}

function watch(callback) {

  browserSync.init({
    ui: false,
    server: {
      baseDir: './public/',
      routes: {
        '/node_modules': './node_modules'
      }
    }
  });

  gulp.watch('./public/styles/*.less', css);
  gulp.watch('./public/*.html', html);
  gulp.watch('./public/*.js', html);

  if (callback) {
    callback();
  }

}

exports.default = gulp.series(css, watch);
