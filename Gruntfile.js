module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //deployfile: grunt.file.read('./server/conf/deploy.js'),
        webapp: {'path': __dirname},
        less:{
            options: {
                strictMath: true,
                sourceMap: true,
                outputSourceFiles: true,
                sourceMapURL: 'main.css.map',
                sourceMapFilename: '<%= webapp.path %>/css/main.css.map'
            },
            src: '<%= webapp.path %>/less/main.less',
            dest: '<%= webapp.path %>/css/main.css'
        }
    });
    require('load-grunt-tasks')(grunt);
    //grunt.registerTask('default1', ['less']);
}