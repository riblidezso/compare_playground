'use strict';

angular.module('mapVisualizationApp')
  .service('GeoLocationService', function GeoLocationService($q) {


   var openStreetMapGeocoder = GeocoderJS.createGeocoder('openstreetmap');

   this.lastLocation = '';
   var self = this; // For inner reference inside functions

  //  this.getLatLngFromLocation = function (isolate){
   //
  //     // Task that will finish in the future
  //     var deferred = $q.defer();
  //     var promise = deferred.promise;
  //     var locationString  = '';
  //     var errors = {messages: [], nErrors: 0};
   //
  //     // TODO: Add ZIP CODE to the location search
  //     if (isolate.longitude === '' || isolate.latitude === ''){
  //        if (isolate.region !== '') {
  //           locationString = isolate.city + ', ' + isolate.region + ', ' + isolate.country;
  //        }else{
  //           locationString = isolate.city + ', ' + isolate.country;
  //        }
  //        console.log('Asking for address...', locationString);
  //        openStreetMapGeocoder.geocode(locationString, function(result) {
  //           self.lastLocation = locationString;
  //           if (result.length > 0){
  //              isolate.longitude = result[0].longitude;
  //              isolate.latitude =  result[0].latitude;
  //           }else{
  //              //isolate.locationError = true;
  //              errors.messages.push(
  //                 'Unknown location in isolate number: ' + isolate.sample_name
  //              );
  //              errors.nErrors += 1;
  //           }
  //           deferred.resolve({isolate: isolate, errors: errors});
  //        });
   //
  //      }else{
  //        // Resolve already
  //        deferred.resolve({isolate: isolate, errors: errors});
  //      }
  //      return promise;
  //  };

  this.getLatLngFromString = function (locationString, errors){

    // Task that will finish in the future
    var deferred = $q.defer();
    var promise = deferred.promise;
    var coordinates = {};
    var success = true;
    console.log('Asking for address...', locationString);
    openStreetMapGeocoder.geocode(locationString, function(result) {
       self.lastLocation = locationString;
       if (result.length > 0){
          coordinates.longitude = result[0].longitude;
          coordinates.latitude = result[0].latitude;
       }else{
          //isolate.locationError = true;
          errors.messages.push(
             'Unknown location: ' + locationString
          );
          errors.nErrors += 1;
          success = false;
       }
       deferred.resolve({
         'location': locationString,
         'coordinates': coordinates,
         'errors': errors,
         'success': success
       });
    });
    return promise;
  };

   this.getLocationFromLatLng = function (isolate){
      // Task that will finish in the future
      var deferred = $q.defer();
      var promise = deferred.promise;
      openStreetMapGeocoder.geodecode(isolate.latitude, isolate.longitude, function(result) {
        deferred.resolve(isolate);
      });
      return promise;
   };

   this.clearLocation = function(){
     self.lastLocation = '';
   };

});
