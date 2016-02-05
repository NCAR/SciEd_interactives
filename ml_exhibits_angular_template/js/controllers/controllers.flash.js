angular.module('edu.ucar.scied.controllers.flash', []).
controller('flashCtrl', function ($rootScope, $scope, $sce, $timeout,$routeParams, ContentData) {
    $rootScope.showFooter = true;
    $scope.backButton = false;
    $rootScope.bodylayout = 'flash';

    var flashId = $routeParams.flashId;

    ContentData('data/flash.json')
        .success(function (list) {
            $scope.menu_data = list["flash"];

            $.each($scope.menu_data, function (index, value) {
                if (value.id == flashId) {
                    $timeout(function () {
                        $scope.src = $sce.trustAsResourceUrl(value.sources);
                    }, 1000);
                    $scope.pageTitle = value.title;
                    return false;
                }
            });
        });
});