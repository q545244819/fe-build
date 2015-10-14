'use strict';

var gulp = require('gulp'),
	ejs = require('gulp-ejs'),
	less = require('gulp-less'),
	babel = require('gulp-babel'),
	concat = require('gulp-concat'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	inject = require('gulp-inject'),
	uglify = require('gulp-uglify'),
	minifyCss = require('gulp-minify-css'),
	browserSync = require('browser-sync').create();

gulp.task('compile', function () {
	// 编译 ejs
	gulp.src('src/html/*.ejs')
		.pipe(ejs())
		.pipe(gulp.dest('src'))
		.pipe(browserSync.stream());

	// 编译 less
	gulp.src('src/less/*.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('src/css'))
		.pipe(browserSync.stream());

	// 编译 es6
	gulp.src('src/script/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('src/js'))
		.pipe(browserSync.stream());
});

gulp.task('uglify', function () {
	// 合并压缩 css
	gulp.src('src/css/*.css')
		.pipe(sourcemaps.init())
		.pipe(concat('aio.css'))
		.pipe(autoprefixer())
		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(sourcemaps.write('../map'))
		.pipe(gulp.dest('dist/css'));

	// 合并压缩 js，默认不包括库文件
	gulp.src('src/js/*.js')
		.pipe(sourcemaps.init())
		.pipe(concat('aio.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('../map'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('inject', function () {
	// 自动添加 link 和 script 标签
	gulp.src('src/*.html')
		.pipe(inject(gulp.src(['dist/js/*.js', 'dist/css/*.css'], {read: false}), {relative: true}))
		.pipe(gulp.dest('dist'));
});

gulp.task('copy-images', function () {
	gulp.src('src/images')
		.pipe(gulp.dest('dist'));
});

gulp.task('server', function () {
	// browserSync 调试
	browserSync.init({
        server: {
            baseDir: "src"
        }
    });

	// 监听文件变化
	gulp.watch([
		'src/html/*.ejs',
		'src/less/*.less',
		'src/script/**/*.js'
	], ['compile']);
});

// 默认运行本地开发环境
gulp.task('default', ['server']);
// 发布压缩版本
gulp.task('release', ['uglify', 'inject', 'copy-images']);