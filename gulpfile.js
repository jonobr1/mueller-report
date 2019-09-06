var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();

function css(callback) {

  gulp.src('./styles/*.less')
    .pipe(less())
    .pipe(gulp.dest('./styles'));

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
      baseDir: './'
    }
  });

  gulp.watch('./styles/*.less', css);
  gulp.watch('./*.html', html);

  if (callback) {
    callback();
  }

}

exports.default = gulp.series(css, watch);
