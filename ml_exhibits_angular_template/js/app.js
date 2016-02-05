angular.module("edu.ucar.scied.template", [
    "edu.ucar.scied.controllers", 
    "edu.ucar.scied.controllers.flash",
    "edu.ucar.scied.controllers.page",
    "edu.ucar.scied.controllers.videos",
    "edu.ucar.scied.controllers.template.drag_drop",
    "edu.ucar.scied.services",
    "edu.ucar.scied.directives",
    "edu.ucar.scied.directives.flash",
    "edu.ucar.scied.directives.modal",
    "edu.ucar.scied.directives.drag_drop",
    "edu.ucar.scied.filters",
    "ngRoute",  
    "ngMaterial",        
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls",
    "com.2fdevs.videogular.plugins.overlayplay",
    "com.2fdevs.videogular.plugins.poster",
    "angulartics", 
    "angulartics.google.analytics"
]).
config(["$routeProvider", function ($routeProvider) {
    $routeProvider.
    when("/", {
        templateUrl: "templates/menu_grid.html",
        controller: "homeCtrl",
        cols: 2
    }).
    when("/flash/:flashId", {
        templateUrl: "templates/flash.html",
        controller: "flashCtrl"
    }).
    when("/videos", {
        templateUrl: "templates/menu_grid.html",
        controller: "videosCtrl",
        cols: 2
    }).
    when("/videos/:videoId", {
        templateUrl: "templates/video_player.html",
        controller: "videoPlayerCtrl"
    }).
    when("/apps/drag-drop/:levelId", {
        templateUrl: "templates/drag_drop.html",
        controller: "dragDropCtrl"
    }).
    when("/page/:menuId/:contentId", {
        templateUrl: "templates/page.html",
        controller: "pageCtrl",
        backUrl: "#/"
    }).
    otherwise({
        redirectTo: '/'
    });
}]);