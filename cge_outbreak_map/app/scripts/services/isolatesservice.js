'use strict';

angular.module('mapVisualizationApp')
  .service('IsolatesService', function IsolatesService ($http, $resource, ENV) {
    // Service logic
    // ...

   var _getStaticData = function (path) {
     console.log(path);
     if (ENV.status === 'development'){
       path = 'json/' + path;
     }else{
       path = ENV.apiEndpoint + '/json/' +path;
     }
     console.log(path);
     var promise = $resource(path, {},
       {getJSON: {method:'GET', isArray: true}
     });
     return promise;
    };

    // Public API
    this.getDBData =  function () {
      // TODO: send isolate IDS of last upload
      var promise;
      var url = ENV.apiEndpoint + 'getIsolates.php';
      promise = $http({
        method: 'GET',
        url: url,
        //withCredentials: true,
        responseType: 'json'
       })
      //  .error(function (data, status) {
      //     //$activityIndicator.stopAnimating();
      //      if (status === 401) {
      //          console.log('User unauthorized');
      //      } else {
      //          console.log('Error: ' + status);
      //      }
      //  })
       ;
      return promise;
    };

    this.getDemoData =  function (file) {
      return _getStaticData(file);
    };

  });
