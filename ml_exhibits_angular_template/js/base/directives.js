angular.module('edu.ucar.scied.directives', [])
    .directive("mlExhibitsFooterMenu", function (Redirect) {
        return {
            restrict: 'E',
            templateUrl: 'templates/footer.html',
            scope: {
                title: "=",
                backButtonText: "=",
                backButton: "=",
                backPage: "="
            },
            controller: function ($scope, $rootScope) {
                $scope.returnToHome = function () {
                    Redirect.returnHome();
                }
                $scope.goBack = function () {
                    Redirect.goToPage($scope.backPage);
                }
            }
        };
    });