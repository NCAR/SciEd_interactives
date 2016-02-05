angular.module('edu.ucar.scied.services', [])
    .factory('ContentData', function ContentDataFactory($http) {
        return getUrl = function (url) {
            return $http.get(url);
        };
    })
    .factory('Redirect', function RedirectFactory() {
        var Redirect = {};

        Redirect.goToPage = function (page) {
            window.location.href = page;
        };
        Redirect.returnHome = function () {
            Redirect.goToPage("#/");
        };

        return Redirect;

    })
    .factory('ManipulateMath', [function () {
        var ManipulateMath = {}

        ManipulateMath.randomFromRange = function (min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }

        return ManipulateMath;

}])
    .factory('ManipulateData', [function () {
        var ManipulateData = {};

        ManipulateData.shuffle = function (data) {
            var counter = data.length;

            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                var index = Math.floor(Math.random() * counter);

                // Decrease counter by 1
                counter--;

                // And swap the last element with it
                var temp = data[counter];
                data[counter] = data[index];
                data[index] = temp;
            }

            return data;
        };

        ManipulateData.getKeys = function (data) {
            var arr = new Array();
            for (var key in data) {
                arr.push(key);
            }
            return arr;
        };

        //http://blog.corrlabs.com/2011/02/shuffling-object-properties-in.html
        ManipulateData.shuffleObj = function (data) {

            var new_obj = {};
            var keys = ManipulateData.getKeys(data);
            ManipulateData.shuffle(keys);
            for (var key in keys) {
                if (key == "shuffle") continue; // skip our prototype method
                new_obj[keys[key]] = data[keys[key]];
            }
            return new_obj;
        };

        return ManipulateData;
    }]);;