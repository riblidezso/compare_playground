'use strict';

angular.module('mapVisualizationApp')
  .service('LocationGroupingService', function Locationgroupingservice(GeoLocationService, $q) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var self = this;

    self.isolatesToLocate = [];
    self.isolates = [];
    var locationsToFind = 0;

    this.newIsolate = function(isolate){


      if (isolate.longitude === '' || isolate.latitude === ''){
        locationsToFind+=1;
        self.isolatesToLocate.push(isolate);
      }else{
        self.isolates.push(isolate);
      }
    };

    this.createMap = function (excelErrors){
      var deferred = $q.defer();
      var promise = deferred.promise;
      var locationMap = {};
      var locationPromises = [];
      var metadata = {};
      var fileNames = [];

      console.log('Creating Location Mapping...', self.isolatesToLocate, self.isolates);
      if (self.isolatesToLocate.length !== 0){

        locationMap = d3.nest()
          .key(function(isolate){
            if (isolate.region !== '') {
               return isolate.city + ', ' + isolate.region + ', ' + isolate.country;
            }else{
               return isolate.city + ', ' + isolate.country;
            }
          })
          .map(self.isolatesToLocate, d3.map);

        var keys = locationMap.keys();
        keys.forEach(function(location){
          locationPromises.push(
             GeoLocationService.getLatLngFromString(location, excelErrors)
          );
        });
        console.log(locationPromises);
        $q.all(locationPromises).then(function(locations){

          var isolateLine = 0;
          locations.forEach(function(answer){
            var errors = answer.errors;
            locationMap.get(answer.location).forEach(function(isolate){
              if (answer.success){
                isolate.longitude = answer.coordinates.longitude;
                isolate.latitude = answer.coordinates.latitude;
                metadata[isolateLine] = isolate;
                fileNames.push(isolateLine);
                isolateLine+=1;
              }else{
                console.log(excelErrors);
                //excelErrors.errors.push(isolate.errors);
                angular.extend(excelErrors.messages, errors.messages);
                excelErrors.nErrors += errors.nErrors;
              }
            });
          });

          self.isolates.forEach(function(isolate, i){
            metadata[fileNames.length + i + 1] = isolate;
            fileNames.push(fileNames.length + i + 1);
          });

          self.isolatesToLocate = [];
          self.isolates = [];

          // Catch later by then. TODO: implement deferred.reject for errors
          deferred.resolve({
             'metadata': metadata,
             'files': fileNames,
             'errors': excelErrors
          });

        });

        console.log('Promises resolved...');
      }else{
        console.log('No isolates to locate...');
        self.isolates.forEach(function(isolate, i){
          metadata[i] = isolate;
          fileNames.push(i);
        });
        self.isolates = [];
        // Catch later by then. TODO: implement deferred.reject for errors
        deferred.resolve({
           'metadata': metadata,
           'files': fileNames,
           'errors': excelErrors
        });
      }

      return promise;

    };



  });
