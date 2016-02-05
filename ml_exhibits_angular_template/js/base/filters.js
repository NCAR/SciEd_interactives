angular.module('edu.ucar.scied.filters', ['ngSanitize']).
filter('unsafe', ['$sce',function($sce) {
  return function(val) {
        return $sce.trustAsHtml(val);
    };
}]);