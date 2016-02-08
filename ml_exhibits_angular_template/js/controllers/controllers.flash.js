angular.module('edu.ucar.scied.controllers.flash', []).
controller('flashCtrl', function ($rootScope, $scope, $sce, $timeout,$routeParams, ContentData) {
    $rootScope.showFooter = true;
    $rootScope.bodylayout = 'flash';
    if($routeParams.menuId){
        $scope.backButton = true;
        $scope.backButtonText = "Back";
        $scope.backPage = '#/'+$routeParams.menuId;
    } else {        
        $scope.backButton = false;
    }

    var flashId = $routeParams.contentId;
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