'use strict';

angular.module('mapVisualizationApp')
  .service('MapMarkersService', function MapMarkersService() {

    // Private function to detect the location uncertainty of the isolate
    function _checkUncertainty(isolate){
      if (isolate.location_uncertainty_flag !== null && isolate.location_uncertainty_flag !== '0' ){
        return {
          longitude: isolate.go_longitude,
          latitude: isolate.go_latitude
        };
      }else{
        return {
          longitude: isolate.longitude,
          latitude: isolate.latitude
        };
      }
    }

    // Private function to create just the markers
    function _createMarkers(isolate, markerList, markers){
      var marker = L.marker([
        isolate.geometry.coordinates[1], //long
        isolate.geometry.coordinates[0] //lat
      ]);

      marker.bindPopup(
        '<b>Country:</b> ' + isolate.properties.data.country + '<br>' +
        '<b>Location:</b> ' + isolate.properties.data.city  + '<br>' +
        '<b>Date:</b> '+ isolate.properties.data.printDate+ '<br>' +
        '<b>Pathogenic:</b> '+isolate.properties.data.pathogenic+ '<br>'+
        '<b>Source:</b> '+isolate.properties.data.isolation_source+ '<br>'+
        '<b>Organism:</b> '+isolate.properties.data.organism+ '<br>'+
        '<b>Notes:</b> '+isolate.properties.data.notes+ '<br>'
      );

      markerList.push(marker);
      // Isolate to the scope
      markers.push(isolate);
    }

    // Private function to create map geoJSON features
    function _createFeatures(isolates, source){

      var markerList = [];
      var markers = [];

      isolates.forEach(function(isolate, i){
        isolate.printDate = isolate.collection_date;
        isolate.Size = 1;

        if (source === 'flu' || source === 'DB' || source === 'excel'){
          if (typeof(isolate.collection_date) === 'string'){
            isolate.collection_date = d3.time.format('%Y-%m-%d').parse(isolate.collection_date);
          }
        }else if (source === 'dengue' || source === 'ebola'){
          isolate.collection_date = d3.time.format('%Y').parse(isolate.collection_date);
        }else{
          console.log('Source unknown');
        }
        var coordinates = {};
        if (source === 'DB'){
          coordinates = _checkUncertainty(isolate);
        }else{
          coordinates.longitude = isolate.longitude;
          coordinates.latitude =  isolate.latitude;
        }

        // Create isolate ready for the map in GEOJSON format
        var mapFeature = {
           'type':'Feature', 'id':i.toString(),
           'properties':{
              'data':isolate
           },
           'geometry':{
             'type':'Point',
             'coordinates':[
                parseFloat(coordinates.longitude),
                parseFloat(coordinates.latitude)
              ]
            }
          };
        _createMarkers(mapFeature, markerList, markers);
      });

      return {
         'isolates': markers,
         'markerList': markerList,
      };
    }

   this.createNewMarkers = function(isolates, source){
      console.log('Creating New Markers...');
      return _createFeatures(isolates, source);
   };

    // Service function to return just markers
    this.createMarkers = function(isolateList){

      var markerList = [],
          markers = [];
      isolateList.forEach(function(isolate){
         _createMarkers(isolate, markerList, markers, false);
      });
      return markerList;
   };

});
