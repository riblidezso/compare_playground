'use strict';

angular.module('mapVisualizationApp')
  .directive('map', function (MapMarkersService, $compile) {
    return {
      restrict: 'A',
      //scope: true, //Creates a new scope but prototypically inherits from the parent scope.
      link: function (scope, element, attrs) {
         // LINK SHOULD WORK WITH DOM MANIPULATION!!!!! MEANING D3 GOES HERE
         // We have a 'private' scope now. First attach variables and functions here

         /////////////////////////////////
         ////////    Variables    ////////
         var tiles = {
            standarTiles: 'https://{s}.tile.openstreetmap.org/'+
                                 '{z}/{x}/{y}.png',
            artisticTiles: 'https://{s}.tile.stamen.com/watercolor/'+
                                 '{z}/{x}/{y}.jpg'
         };
         // Create Map
         scope.map = new L.Map(element[0], {
                           center: [
                               parseFloat(attrs.lat), parseFloat(attrs.long)
                           ],
                           zoom: 4,
                           maxZoom: 8
                        }).addLayer(new L.TileLayer(tiles.standarTiles));
         L.Icon.Default.imagePath = 'bower_components/leaflet/dist/images';
         // To apply ng-show directive we need to compile the element
         var markerPane = element.find('.leaflet-marker-pane');
         var shadowPane = element.find('.leaflet-shadow-pane');
         markerPane.attr('ng-show', 'mapLayer === "clusters"');
         shadowPane.attr('ng-show', 'mapLayer === "clusters"');
         $compile(markerPane)( scope );
         $compile(shadowPane)( scope );

         scope.mapLayer = 'clusters';

         scope.map.attributionControl.setPrefix(''); // Hide Leaflet text.
         scope.map.options.minZoom = 2;
         // Redraw map SVG layers every time the map changes
         scope.map.on('viewreset', function(){
            // TODO: Call API of mapOutbreaks directive
            scope.$broadcast('viewreset');
         });
         //var markerList = [];
         var markers = new L.MarkerClusterGroup({
           //disableClusteringAtZoom: 8
         }).on('clusterclick', function () {
           // TODO: FIX selection of clusters based on the are that they cover
           // THIS WOULD NEVER HAPPEN...
           // THIS WONT BE EXECUTED => FALSE
         //   if (false){
         //     console.log(a.latlng);
         //     if (a.selected === true){
         //       a.selected = false;
         //     }else{
         //       a.selected = true;
         //     }
         //     console.log(a.selected);
         //     var coordinates = a.latlng.lng+'-'+a.latlng.lat;
           //
         //     // Update selected clusters in dimension
         //     if (a.selected){
         //       console.log(coordinates);
         //       scope.locations[0].filter(coordinates);
         //       $('#reset_clusters').css({'display' : 'block'});
         //     }else{
         //       scope.locations[0].filterAll();
         //       $('#reset_clusters').css({'display' : 'none'});
         //     }
         //     // Broadcast event to update pie and rowchart
         //     scope.$broadcast('clusterSelected');
           //)}
         });

         /////////////////////////////////
         ////////    Functions   ////////


         /////////////////////////////////
         ////////    Watchers    ////////

         // Watch the scope variable 'isolates' to load the content.
         // Just executed once... or more times depending on users uploading excel files
        //  scope.$watch('totalData', function (newVal, oldVal) {
        //     if (newVal !== oldVal){
        //        var svg = element.find('#outbreaks');
        //        if (newVal !== 0){
        //           console.log('Creating Clusters and Markers...');
        //           if (svg !== undefined){
        //              svg.remove();
        //              // New markers (return just  markerList)
        //              markerList = MapMarkersService.createMarkers(scope.isolates);
        //              markers.clearLayers();
        //           }
        //           //markers = new L.MarkerClusterGroup({});
        //           markers.addLayers(markerList);
        //           scope.map.addLayer(markers);
         //
        //           var overlayPane =  angular.element(scope.map.getPanes().overlayPane);
        //           var svgNew = angular.element('<svg id="outbreaks"></svg>');
        //           overlayPane.append(svgNew);
        //           svgNew.attr('map-outbreaks', '');     // Attach directive
        //           svgNew.attr('isolates', 'isolates');  // Attach isolates to layer
        //           svgNew.attr('filter', 'locations');  // Filtering dimension
        //           svgNew.attr('criteria', 'groupingCriteria');  // ID or Location
        //           svgNew.attr('leaflet-map', 'map');  // Map for coordinate transformation
        //           svgNew.attr('ng-show', 'mapLayer === "outbreaks"');  // Layer selector
        //           svgNew = $compile(svgNew)( scope );
         //
        //        }else{
        //           // TotalData = 0 => We clean Isolates from all Views
        //           if (svg !== undefined){ // Check if its the first time we upload data
        //              console.log('Removing Outbreaks and Markers');
        //              svg.remove();
        //              scope.map.removeLayer(markers);
        //              markers.clearLayers();
        //              scope.isolates = []; // To update the Table view
        //           }
        //        }
        //     }
        //  });

         scope.$watch('loadData', function (newVal, oldVal) {
            if (newVal !== oldVal){
               console.log('Load data... ', newVal);
               if (newVal === true){ // There is no data

                  //markerList = MapMarkersService.createMarkers(scope.isolates);
                  //markerList = scope.markerList; // Updated in main.js
                  markers.clearLayers();

                  markers.addLayers(scope.markerList);
                  scope.map.addLayer(markers);

                  var overlayPane =  angular.element(scope.map.getPanes().overlayPane);
                  var svg = angular.element('<svg id="outbreaks"></svg>');
                  overlayPane.append(svg);
                  svg.attr('map-outbreaks', '');     // Attach directive
                  svg.attr('isolates', 'isolates');  // Attach isolates to layer
                  svg.attr('filter', 'locations');  // Filtering dimension
                  svg.attr('criteria', 'groupingCriteria');  // ID or Location
                  svg.attr('leaflet-map', 'map');  // Map for coordinate transformation
                  svg.attr('ng-show', 'mapLayer === "outbreaks"');  // Layer selector
                  svg = $compile(svg)( scope );

               }else{ // We remove the data
                  console.log('Removing Outbreaks and Markers');
                  var svg = element.find('#outbreaks');
                  //if (svg !== undefined){ // Check if its the first time we upload data
                     svg.remove();
                  //}
                  scope.map.removeLayer(markers);
                  markers.clearLayers();
                  //markers = new L.MarkerClusterGroup({});
                  scope.isolates = []; // To update the Table view
                  // TODO: hide visualizations via Angular
                  //$('[class*="visualizations"]').hide();
                  console.log('removido');
               }
            }
         });

         /////////////////////////////////
         ////////    ON Events   ////////

         // If a new filter is applied, update SVG circles
         // Watch if any filter applies to update the markers on the map
         // TODO: update Table View when clusters are selected and filters apply
         scope.$on('updateMap',function () {
            // Remove the old markers
            markers.clearLayers();
            if (scope.isolates.length !== scope.totalData){
               console.log('different numbers of elements', scope.isolates.length, scope.totalData, scope.isolates);
               // Markers
                var markerList = MapMarkersService.createMarkers(scope.isolates); // return just  markerList
                markers.addLayers(markerList);
            }else{
               // Retrieve the initial data
               console.log('retreiving initial data');
               markers.addLayers(scope.markerList);
            }
            // Add the markers layer
            scope.map.addLayer(markers);
         });
      }
  };
});
