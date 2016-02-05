angular.module('edu.ucar.scied.controllers.videos', []).
controller('videosCtrl', function ($rootScope, $scope, ContentData) {
    $rootScope.showFooter = true;
    $rootScope.bodylayout = 'videos';
    $rootScope.menulist = 'videos';
    $scope.pageTitle = "Videos";
    $scope.header_class = "larger";
}).
controller('videoPlayerCtrl', function ($rootScope, $scope, $routeParams, ContentData) {
    $rootScope.showFooter = true;
    $rootScope.bodylayout = 'video-player';
    $scope.videoId = $routeParams.videoId;

    ContentData('data/videos.json')
        .success(function (list) {
        console.log(list);
            $scope.menu_data = list["videos"];

            $.each($scope.menu_data, function (index, value) {
                if (value.id == $scope.videoId) {
                    $scope.pageTitle = value.title;
                    return false;
                }
            });
        });

    $scope.show = function (item) {
        return (item.active === true);
    };
    $scope.chosenVideo = function (item) {
        return (item.id === $scope.videoId);
    };

    $scope.backButton = true;
    $scope.backButtonText = "Videos";
    $scope.backPage = "#/videos";

});