const del = require("del");
const gulp = require("gulp");
const emu = require("gulp-emu");
const gls = require("gulp-live-server");
const spawn = require("child_process").spawn;

gulp.task("clean", () => del("docs/**/*"));

gulp.task("build", () => gulp
    .src(["spec/index.html"])
    .pipe(emu())
    .pipe(gulp.dest("docs")));

gulp.task("watch", () => gulp
    .watch(["spec/**/*"], ["build"]));

gulp.task("start", ["watch"], () => {
    const server = gls.static("docs", 8080);
    const promise = server.start();
    gulp.watch(["docs/**/*"], file => server.notify(file));
    return promise;
});

gulp.task("default", ["build"]);