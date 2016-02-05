angular.module('edu.ucar.scied.controllers.page', []).
controller('pageCtrl', function ($rootScope, $scope, $routeParams, $route, ContentData) {
    $rootScope.showFooter = true;
    $rootScope.bodylayout = 'home';
    $scope.backButton = true;
    if ($routeParams.menuId) {
        $scope.backButtonText = "Back";
        $scope.backPage = $route.current.$$route.backUrl + $routeParams.menuId;
    }
    if ($routeParams.contentId) {
        contentId = $routeParams.contentId;
    }
    ContentData('data/content.json')
        .success(function (list) {
            $scope.data = list[contentId];
            $scope.pageTitle = $scope.data.title;
        });
});