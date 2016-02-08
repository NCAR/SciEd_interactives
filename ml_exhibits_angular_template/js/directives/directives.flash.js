angular.module('edu.ucar.scied.directives.flash', [])
    .directive("mlExhibitsFlashObject", function () {
        return {
            restrict: 'E',
            templateUrl: '/core/templates/flash_object.html',
        };
    });
