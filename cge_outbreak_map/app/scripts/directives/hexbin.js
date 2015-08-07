'use strict';

/**
 * @ngdoc directive
 * @name mapVisualizationApp.directive:hexbin
 * @description
 * # hexbin
 */
angular.module('mapVisualizationApp')
  .directive('hexbin', function () {
    return {
      //template: '<div></div>',
      restrict: 'A',
      //scope: true,
      scope: {
            isolates:'=isolates',  // Features added to the directives's scope
            //groupingCriteria:'=criteria',
            locations: '=filter',
            map:'=leafletMap'
      },
      link: function postLink(scope, element, attrs) {


          //isolates
          var svg = d3.select(element[0]);
           // Hide layer during zooming
           svg.g = scope.svg.append('g').attr('class', 'leaflet-zoom-hide');

          var color = d3.scale.linear()
              .domain([0, 20])
              .range(["white", "steelblue"])
              .interpolate(d3.interpolateLab);

          var hexbin = d3.hexbin()
              //.size([width, height]) //later defined
              .radius(20);


              svg.append("g")
                  //.attr("clip-path", "url(#clip)")
                .selectAll(".hexagon")
                  .data(hexbin(scope.isolates))
                .enter().append("path")
                  .attr("class", "hexagon")
                  .attr("d", hexbin.hexagon())
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                  .style("fill", function(d) { return color(d.length); });

            // Use Leaflet to implement a D3 geometric transformation.
            		function projectPoint(x, y) {
            			var point = scope.map.latLngToLayerPoint(new L.LatLng(y, x));
            			this.stream.point(point.x, point.y);
            		}

         /////////////////////////////////
         //////// Scope variables ////////
        //  scope.outbreaks = [];
        //  scope.selectedOutbreaks = [];
        //  scope.geoJSON = {
        //     'type': 'FeatureCollection',
        //     'features': []
        //  };
        //  scope.groupingCriteria = 'id';
        //  scope.padding = 10; // Extra padding for circle radius
        //  scope.svg = d3.select(element[0]);
        //  // Hide layer during zooming
        //  scope.g = scope.svg.append('g').attr('class', 'leaflet-zoom-hide');
        //
        //  scope.circles = scope.g.append("g").attr("class", "circles");
        //  scope.hexagons = scope.g.append("g").attr("class", "hexagons");
        //
        //  scope.radiusHex = d3.scale.sqrt()
        //                     .domain([1, 1])
        //                     .range([0, 8]);
        //
        //
        //  /////////////////////////////////
        //  //////// Scope functions ////////
        //
        //  // Use Leaflet to implement a D3 geometric transformation.
        //  // Here is visible to both watch functions
        //  // x = longitude, y = latitude
        //  scope.projectPoint = function (x, y) {
        //     var point = scope.map.latLngToLayerPoint(new L.LatLng(y, x));
        //     this.stream.point(point.x, point.y);
        //  };
        //
        // // Functions for d3 transformation. Visible in the scope
        // var transform = d3.geo.transform({point: scope.projectPoint});
        // // A projection function takes a two-element array of numbers
        // // representing the coordinates of a location, [longitude, latitude]
        // scope.path = d3.geo.path().projection(transform)
        //                       .pointRadius(function(d){
        //                           return scope.radius(d.properties.data.Size);
        //                       });
        // // Radius for the outbreaks
        // scope.radius = d3.scale.linear()
        //               .domain([1, 1]) // updated later, when we know the isolates
        //               .range([6, 50]);
        //
        // // Hexbining method. size is added when updating BB
        // scope.hexbin = d3.hexbin()
        //     //.size([width, height])
        //     .radius(8);
        //
        //  // Reposition the SVG Bounding Box to cover the features.
        //  scope.updateBB = function (){
        //     var bounds = scope.path.bounds(scope.geoJSON),
        //        topLeft = [
        //           bounds[0][0] - scope.padding, bounds[0][1] - scope.padding
        //        ],
        //        bottomRight = [
        //           bounds[1][0] + scope.padding, bounds[1][1] + scope.padding
        //        ];
        //
        //     var width = bottomRight[0] - topLeft[0];
        //     var height = bottomRight[1] - topLeft[1];
        //
        //     //scope.hexbin.size([width, height]);
        //
        //     scope.svg
        //        .attr('width', width)
        //        .attr('height', height)
        //        .style('left', topLeft[0] + 'px')
        //        .style('top', topLeft[1] + 'px');
        //
        //     scope.g.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');
        //  };
        //
        //  scope.updateWH = function(){
        //    var bounds = scope.path.bounds(scope.geoJSON),
        //       topLeft = [
        //          bounds[0][0] - scope.padding, bounds[0][1] - scope.padding
        //       ],
        //       bottomRight = [
        //          bounds[1][0] + scope.padding, bounds[1][1] + scope.padding
        //       ];
        //
        //    var width = bottomRight[0] - topLeft[0];
        //    var height = bottomRight[1] - topLeft[1];
        //
        //    return {
        //      'width' : width,
        //      'height' : height
        //    };
        //  }
        //
        //  scope.createHexBinning = function (data){
        //    var BB = scope.updateWH();
        //    scope.hexbin.size([BB.width, BB.height]);
        //
        //    scope.svg.append("g")
        //          .attr("class", "hexagons")
        //        .selectAll("path")
        //          .data(scope.hexbin(data).sort(function(a, b) { return b.length - a.length; }))
        //        .enter().append("path")
        //          .attr("d", function(d) { return scope.hexbin.hexagon(scope.radius(d.length)); })
        //          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        //          //.style("fill", function(d) { return color(d3.median(d, function(d) { return +d.date; })); })
        //          ;
        //
        //  }
        //
        //
        //
        //  // Process the data acording to criteria
        //  scope.processData = function (data) {
        //     var groupedData, max, min, answer;
        //     if (criteria === 'id'){
        //        groupedData = data; max = 1; min = 1;
        //     }
        //     else if (criteria === 'location'){
        //        answer = GroupIsolatesService.create(data, 'location');
        //        groupedData = answer[0]; max = answer[1]; min = answer[2];
        //     }
        //     scope.radius.domain([min, max]);
        //     scope.padding = scope.radius(max);
        //     scope.geoJSON.features = groupedData;
        //
        //
        //
        //  };
        //
        //  /////////////////////////////////
        //  ////////    Watchers    ////////
        //
        //
        // // TODO: Start animation to see outbreaks evolution
        // scope.$watch('play_animation',function (newVal, oldVal){
        //    if (newVal !== oldVal){
        //       // Start a transition from first to last date with a step of one day
        //
        //       // Apply filter
        //   }
        // });
        //
        //  /////////////////////////////////
        //  ////////    ON Events   ////////
        //
        //  scope.$on('viewreset', function (event){
        //     //console.log(event);
        //     scope.updateBB();
        //     scope.outbreaks.attr('d', scope.path);
        //  });
        //
        //  // If a new filter is applied, update SVG circles
        //  // Watch if any filter applies to update the markers on the map
        //  // TODO: update Table View when clusters are selected and filters apply
        //  scope.$on('updateMap',function (){
        //     if (scope.selectedOutbreaks.length === 0){
        //        scope.processData(scope.isolates, scope.groupingCriteria);
        //        scope.updateBB(); // Reposition new hex
        //        scope.createHexBinning(scope.geoJSON.features);
        //    }
        //  });
        //
        //  // Same functionallity as clicking on 'clear selection' but from visualizations
        //  // FIXME: Not useful anymore?
        //  scope.clustersDeselected = function (){
        //     scope.locations[0].filterAll();
        //     //console.log(scope.locations[1].all());
        //     // Redraw all visualizations
        //     dc.redrawAll();
        //     scope.selectedOutbreaks = [];
        //     scope.outbreaks.each(function (d){
        //         d.properties.data.selected = false;
        //         // Change color of selected cluster to Red
        //         d3.select(this).classed('circlePathSelected', false);
        //     });
        //     // Broadcast event to update pie and rowchart
        //     scope.$broadcast('clusterSelected');
        //  };
        //
        //  ///////////////////////////////////
        //  //////////       Main         /////
        //  console.log('Creating oubreaks...');
        //  // First time: Create Outbreaks
        //  scope.processData(scope.isolates);
        //  scope.createCircles(scope.geoJSON.features);
        //  scope.updateBB(); // Reposition new circles
        //  scope.createHexBinning(scope.geoJSON.features);
    }
   };
 });
