'use strict';

angular.module('mapVisualizationApp')
  .service('Isolaterunsservice', function Isolaterunsservice($http, ENV, $resource) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var _getStaticService = function (){
      var path = '';
      if (ENV.status === 'development'){
        path = '/static/services.json';
      }else{
        path = ENV.apiEndpoint + 'services.json';
      }
      console.log(path);
      var promise = $resource(path, {},
        {getJSON: {method:'GET', isArray: false}
      });
      return promise;
    };

    var _getStaticDataRuns = function () {
      var path = '';
      if (ENV.status === 'development'){
        path = '/static/runs.js';
      }else{
        path = ENV.apiEndpoint + 'runs.js';
      }
      var promise = $resource(path, {},
        {getJSON: {method:'GET', isArray: false}
      });
      return promise;
     };

     var _getStaticDataPipeline = function () {
       var path = '';
       if (ENV.status === 'development'){
         path = '/static/pipeline.json';
       }else{
         path = ENV.apiEndpoint + 'pipeline.js';
       }
       var promise = $resource(path, {},
         {getJSON: {method:'GET', isArray: false}
       });
       return promise;
      };

    // Public API
    this.getAllDataRuns =  function () {
      console.log('enter');
      if (ENV.status === 'development'){
        return _getStaticDataRuns();
      }else{
        // TODO: send isolate IDS of last upload
        var promise;
        var url = ENV.apiEndpoint + 'getIsolateServices.php';
        promise = $http({
          method: 'GET',
          url: url,
          cache: true,
          responseType: 'json'
         });

        return promise;
      }
    };

    // Public API
    this.getAllDataPipeline =  function (isolateID) {
      console.log('enter');
      if (ENV.status === 'development'){
        return _getStaticDataPipeline();
      }else{
        console.log(isolateID);
        // TODO: send isolate IDS of last upload
        var promise;
        var url = ENV.apiEndpoint + 'getPipelineResultsFromDB.php';
        console.log(url, isolateID);
        promise = $http({
          url: url,
          method: 'GET',
          params: {
            'IID' : isolateID,
          },
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          responseType: 'json'
         });

        return promise;
      }
    };


        this.deleteRun =  function (id) {
          // TODO: Implement...
          console.log('deleting run...', id);
          if (ENV.status === 'development'){
            return _getStaticData();
          }else{
            // TODO: send isolate IDS of last upload
            var promise;
            var url = 'https://cge.cbs.dtu.dk/cge/user/isolate/php/get_data_all.php';
            promise = $http({
              method: 'GET',
              url: url,
              cache: true,
              //withCredentials: true,
              responseType: 'json'
             });
            return promise;
          }

        };

        this.getServiceResult = function (isolateID, runID, date, service){
          var promise;
          var url = '';
          if (ENV.status === 'development'){
            return _getStaticService();
          }else{
            url = ENV.apiEndpoint + 'showServiceResult.php';
            //service = service.split('-');
            promise = $http({
              url: url,
              // params: {
              //   'IID' : isolateID,
              //   'SID' : runID,
              //   'DATE' : date,
              //   'SERVICE': service[0],
              //   'VERSION': service[1]
              // },
              method: 'GET',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              //withCredentials: true,
             });
            return promise;
          }

        };

  });
