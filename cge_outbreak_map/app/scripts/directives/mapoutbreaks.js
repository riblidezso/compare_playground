'use strict';

// TODO: Inject D3 as a dependencie:
//       http://www.ng-newsletter.com/posts/d3-on-angular.html

angular.module('mapVisualizationApp')
  .directive('mapOutbreaks', function (GroupIsolatesService) {
    return {
      restrict: 'A',
      //scope: true,
      // scope: {
      //       isolates:'=isolates',  // Features added to the directives's scope
      //       groupingCriteria:'=criteria',
      //       locations: '=filter',
      //       map:'=leafletMap'
      // },
      link: function postLink(scope, element, attrs) {

         /////////////////////////////////
         //////// Scope variables ////////
         scope.outbreaks = [];
         scope.selectedOutbreaks = [];
         scope.geoJSON = {
            'type': 'FeatureCollection',
            'features': []
         };
         scope.groupingCriteria = 'id';
         scope.padding = 10; // Extra padding for circle radius
         scope.svg = d3.select(element[0]);
         // Hide layer during zooming
         scope.g = scope.svg.append('g').attr('class', 'leaflet-zoom-hide');

         /////////////////////////////////
         //////// Scope functions ////////

         // Use Leaflet to implement a D3 geometric transformation.
         // Here is visible to both watch functions
         // x = longitude, y = latitude
         scope.projectPoint = function (x, y) {
            var point = scope.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
         };

        // Functions for d3 transformation. Visible in the scope
        var transform = d3.geo.transform({point: scope.projectPoint});
        // A projection function takes a two-element array of numbers
        // representing the coordinates of a location, [longitude, latitude]
        scope.path = d3.geo.path().projection(transform)
                              .pointRadius(function(d){
                                  return scope.radius(d.properties.data.Size);
                              });
        // Radius for the outbreaks
        scope.radius = d3.scale.linear()
                      .domain([1, 1]) // updated later, when we know the isolates
                      .range([6, 50]);

         // Reposition the SVG Bounding Box to cover the features.
         scope.updateBB = function (){
            var bounds = scope.path.bounds(scope.geoJSON),
               topLeft = [
                  bounds[0][0] - scope.padding, bounds[0][1] - scope.padding
               ],
               bottomRight = [
                  bounds[1][0] + scope.padding, bounds[1][1] + scope.padding
               ];

            scope.svg
               .attr('width', bottomRight[0] - topLeft[0])
               .attr('height', bottomRight[1] - topLeft[1])
               .style('left', topLeft[0] + 'px')
               .style('top', topLeft[1] + 'px');

            scope.g.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');
         };

         scope.createCircles = function (data) {
            // outbreaks in scope so we don't select every time
            scope.outbreaks = scope.g.selectAll('.circlePath')
                           .data(data, function(d){
                              // Key to join the data based on criteria
                              return d.id;
                           });

            // Update. Only in the case of filters applied
            // when criteria changes, update selection is empty
            scope.outbreaks.transition().duration(1500).attr('d', scope.path);

            // Enter
            scope.outbreaks.enter().append('path')
               .attr('class','circlePath')
               .attr('d', scope.path)
               // Styles apply only if the color eas previously selected (!= 0)
               .style('fill', function(d){
                   if (d.properties.data.colorGroup !== 0){
                     return d.properties.data.colorGroup;
                   }
                })
                .style('fill-opacity', function(d){
                   if (d.properties.data.colorGroup !== 0){
                     return 1;
                   }
                })
               .on('click', function(d){

                  // TODO: Move reset button to map view
                  //$('#reset_clusters').css({'display' : 'block'});
                  var coordinates = d.geometry.coordinates[0]+'#'+d.geometry.coordinates[1];
                  // Remember which cluster was selected
                  if (d.properties.data.selected === true){
                     d.properties.data.selected = false;
                     var index = scope.selectedOutbreaks.indexOf(coordinates);
                     scope.selectedOutbreaks.splice(index, 1);
                     // Change color of selected cluster to Red
                     d3.select(this).classed('circlePathSelected', false);
                     // Hid reset button when no clusters selected
                  }else {
                     scope.selectedOutbreaks.push(coordinates);
                     d.properties.data.selected = true;
                     // Change color of selected cluster to Green
                     d3.select(this).classed('circlePathSelected', true);
                  }
                  // Update selected clusters in dimension
                  if (scope.selectedOutbreaks.length === 0){
                    console.log('No outbreaks...');
                     scope.locations[0].filterAll();
                  }else{
                     scope.locations[0].filterFunction(function (d){
                        return scope.selectedOutbreaks.indexOf(d) !== -1;
                     });
                  }

                  //console.log(scope.countries[0].top(Infinity));

                  // Update table
                  // TODO: Is it feasible?
                  //scope.isolates = scope.locations[0].top(Infinity);

                  scope.$broadcast('clusterSelected');
               });
            // Exit
            scope.outbreaks.exit().remove();
         };

         // Process the data acording to criteria
         scope.processData = function (data, criteria) {
            var groupedData, max, min, answer;
            if (criteria === 'id'){
               groupedData = data; max = 1; min = 1;
            }
            else if (criteria === 'location'){
               answer = GroupIsolatesService.create(data, 'location');
               groupedData = answer[0]; max = answer[1]; min = answer[2];
            }
            scope.radius.domain([min, max]);
            scope.padding = scope.radius(max);
            scope.geoJSON.features = groupedData;
         };

         /////////////////////////////////
         ////////    Watchers    ////////

         scope.$watch('groupingCriteria', function (newVal, oldVal) {
            if (newVal !== oldVal){
               scope.locations[0].filterAll(); // remove any filters applied
               scope.isolates = scope.locations[0].top(Infinity);
               scope.selectedOutbreaks = []; // Clean outbreaks if some were selected

               // Group isolates according to the criteria
               scope.processData(scope.isolates, scope.groupingCriteria);
               scope.createCircles(scope.geoJSON.features);
               scope.updateBB(); // Reposition new circles
               scope.$broadcast('clusterSelected'); // Broadcast event to update pie and rowchart

               // Channge selected class (green to red)
               scope.outbreaks.each(function (d){
                   d.properties.data.selected = false;
                  //console.log(d);
                   d3.select(this).style('fill', function(d){
                     if (d.properties.data.colorGroup !== 0){
                       return d.properties.data.colorGroup;
                     }
                    }).style('fill-opacity', function(d){
                      if (d.properties.data.colorGroup !== 0){
                        return 1;
                      }
                    });
                    // Change color of selected cluster to Red
                    d3.select(this).classed('circlePathSelected', false);
               });
            }
         });

        // TODO: Start animation to see outbreaks evolution
        scope.$watch('play_animation',function (newVal, oldVal){
           if (newVal !== oldVal){
              // Start a transition from first to last date with a step of one day

              // Apply filter
          }
        });

         /////////////////////////////////
         ////////    ON Events   ////////

         scope.$on('viewreset', function (event){
            //console.log(event);
            scope.updateBB();
            scope.outbreaks.attr('d', scope.path);
         });

         scope.$on('groupColorSelectionChanged', function (event) {
           console.log('changing group');
            scope.outbreaks.each(function (d){
                //console.log(d);
                // Change color of selected cluster to the group color
                d3.select(this).style('fill', function(d){
                    //console.log(d.properties.data.colorGroup);
					if (d.properties.data.colorGroup !== 0){
						return d.properties.data.colorGroup;
					}
                  })
                  .style('fill-opacity', function(d){
                    if (d.properties.data.colorGroup !== 0){
                      return 1;
                    }
                  })
                  ;
            });
         });

         scope.$on('restoreSelectedColors', function(event){
           scope.outbreaks.each(function (d){
               // Change color of selected cluster to the group color
               d3.select(this).style('fill', function(d){
                   if (d.properties.data.colorGroup !== 0){
                     return 'brown';
                   }
                 })
                 .style('fill-opacity', function(d){
                   if (d.properties.data.colorGroup !== 0){
                     return .2;
                   }
                 })
                 ;
           });
         });

         // If a new filter is applied, update SVG circles
         // Watch if any filter applies to update the markers on the map
         // TODO: update Table View when clusters are selected and filters apply
         scope.$on('updateMap',function (){
            if (scope.selectedOutbreaks.length === 0){
               scope.processData(scope.isolates, scope.groupingCriteria);
               scope.createCircles(scope.geoJSON.features);
               scope.updateBB(); // Reposition new circles
           }
         });

         // Same functionallity as clicking on 'clear selection' but from visualizations
         // FIXME: Not useful anymore?
         scope.clustersDeselected = function (){
            scope.locations[0].filterAll();
            //console.log(scope.locations[1].all());
            // Redraw all visualizations
            dc.redrawAll();
            scope.selectedOutbreaks = [];
            scope.outbreaks.each(function (d){
                d.properties.data.selected = false;
                // Change color of selected cluster to Red
                d3.select(this).classed('circlePathSelected', false);
            });
            // Broadcast event to update pie and rowchart
            scope.$broadcast('clusterSelected');
         };

         ///////////////////////////////////
         //////////       Main         /////
         console.log('Creating oubreaks...');
         // First time: Create Outbreaks
         scope.processData(scope.isolates, scope.groupingCriteria);
         scope.createCircles(scope.geoJSON.features);
         scope.updateBB(); // Reposition new circles
    }
   };
 });
