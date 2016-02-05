angular.module('edu.ucar.scied.controllers', []).
controller('webAppCtrl', function ($rootScope, $scope, Redirect) {
    $rootScope.showFooter = false;
    $scope.returnToHome = function () {
        Redirect.goToPage("#/");
    }
    $scope.goToPage = function (page) {
        Redirect.goToPage(page);
    }
}).
controller('homeCtrl', function ($rootScope, $scope) {
    $rootScope.showFooter = false;
    $rootScope.bodylayout = 'home';
    $rootScope.menulist = 'home';
}).
controller('menuListCtrl', function ($rootScope, $scope, $route,ContentData) {
    $scope.cols = $route.current.$$route.cols;
    $rootScope.bodylayout = 'home';
    
    ContentData('data/menu_main.json')
     .success(function (list) {
         var data = list[$rootScope.menulist];
         $scope.menu_data = Array();
         $scope.menu_data[0] = Array();

         var col_counter = 0;
         var row_counter = 0;
         $.each(data, function (index, value) {

             if (value.active == true) {
                 if (col_counter >= $scope.cols) {
                     col_counter = 0;
                     row_counter++;
                     $scope.menu_data[row_counter] = Array();

                 }
                 $scope.menu_data[row_counter].push(value);
                 col_counter++;
             }

         });
        $scope.row_height_style = "row_"+(row_counter+1);
     });
});