require.config({
    paths: {
        jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
        underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.2/underscore-min',
        templates: '../js-templates'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['jquery', 'underscore'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        }
    }
});

require(['app'], function(App) {
    App.initialize();
});
//compile when ready
//name = the name of the app
//out = the name of the optimized app
//baseUrl = the app dir.
//optimize = none to not compress
//node ./build/r.js -o name=main-app out=main-app.min.js baseUrl=. optimize=none