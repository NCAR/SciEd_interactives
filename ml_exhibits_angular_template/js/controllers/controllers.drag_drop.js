angular.module('edu.ucar.scied.controllers.template.drag_drop', []).
controller('dragDropCtrl', function ($rootScope, $scope, $routeParams, ContentData, ManipulateData, Redirect,$route, $animate) {
    $rootScope.bodylayout = 'dragDrop';
    $rootScope.pageTitle = "Drag and Drop";
    $rootScope.showFooter = true;
    $scope.backButton = false;
    $scope.last_level = "LEVEL3";
    $scope.showCompleteModal = false;
    $('.modal-backdrop').remove();
    if ($rootScope.score) {
        $scope.score = $rootScope.score;
    } else {
        $scope.score = 0;
    }

    $scope.level = $routeParams.levelId;
    $scope.total_draggables = 0;

    $scope.shuffle = function (data) {

        return ManipulateData.shuffleObj(data);
    }

    // TODO: clear the score when click home button or when leave the app

    // check if completed with level
    var checkIfDone = function () {
            if ($scope.total_draggables == 0) {
                document.getElementById('complete').play();
                //provide modal to next page
                $scope.toggleCompleteModal();
            }

        }
        // current progress percentage
    switch ($scope.level) {
    case 'LEVEL1':
        $scope.progressPercent = "33%";
        break;
    case 'LEVEL2':
        $scope.progressPercent = "66%";
        break;
    case 'LEVEL3':
        $scope.progressPercent = "100%";
        break;
    }

    // goto level
    $scope.gotoLevel = function (btnId) {
        // set rootscope of current score
        Redirect.score = $scope.score;
        Redirect.goToPage('#/apps/drag-drop/' + btnId);
    }
    $scope.nextLevel = function () {
        $scope.showCompleteModal = false;
        switch ($scope.level) {
        case 'LEVEL1':
            $scope.gotoLevel('LEVEL2');
            break;
        case 'LEVEL2':

            $scope.gotoLevel('LEVEL3');
            break;
        case 'LEVEL3':

            $scope.gotoLevel('LEVEL1');
            break;
        }
    }

    // handle credits modal
    $scope.showModal = false;
    $scope.toggleCreditsModal = function (btnId) {
        $scope.showCreditsModal = !$scope.showCreditsModal;
    };
    $scope.toggleCompleteModal = function (btnId) {
        $scope.showCompleteModal = !$scope.showCompleteModal;
    };
    $scope.restartGame = function () {
        $scope.score = 0;
        $scope.gotoLevel('LEVEL1');
    }

    // handle the drop
    $scope.handleDrop = function (item, bin) {
        // TODO: fix issue where shrunk tile still occupies the same space
        // update response
        $('#response_title').html($scope.data.DRAGGABLES[item][$scope.level].response[bin].title);
        $('#response_body').html($scope.data.DRAGGABLES[item][$scope.level].response[bin].body);

        // check if item belongs in this bin
        if ($scope.data.DRAGGABLES[item][$scope.level].correctDiv == bin) {
            $('.response').addClass('correct');
            $('.response').removeClass('incorrect');
            $animate.addClass($('.response'), 'shakeHori').then(function() {
                $animate.removeClass($('.response'), 'shakeHori');
              });
            document.getElementById('correct').play();
            $scope.total_draggables--;
            $scope.score += 25;
            checkIfDone();
            return true;
        } else {
            $('.response').addClass('incorrect');
            $('.response').removeClass('correct');
            $animate.addClass($('.response'), 'shakeVert').then(function() {
                console.log('test');
                $animate.removeClass($('.response'), 'shakeVert');
              });
            document.getElementById('incorrect').play();
            $scope.score -= 5;
            return false;
        }

        return false;
    }

    // retrieve data for content
    ContentData('data/drag-drop/drag-drop.json')
        .success(function (list) {
            $scope.data = list['data'];

            // get total number of draggables for this level
            $.each($scope.data.DRAGGABLES, function (index, value) {
                if (value[$scope.level]) {
                    $scope.total_draggables++;
                }

            });

        });
    $scope.$on('$routeChangeStart', function (event, next, current) {
        if(next.$$route.originalPath != '/apps/drag-drop/:levelId'){
            $rootScope.score = 0;   
        }
        
    });
});