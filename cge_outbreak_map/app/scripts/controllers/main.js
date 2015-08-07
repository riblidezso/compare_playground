'use strict';

angular.module('mapVisualizationApp').controller('MainCtrl',
   function ($scope, IsolatesService, MapMarkersService, ExcelParserService, ENV,
               $q, CrossfilterService, $activityIndicator, $timeout,
               $modal,TableViewService, Isolaterunsservice, $filter)
   {

      ///////////////////////////
      // Scope variables

      // General variables
      $scope.devMode = (ENV.status === 'development');

      $scope.colorClicked = false;
      $scope.isCollapsed = true;
      $scope.infoMessage = '';       // Initially no info message
      $scope.errorsExist = false;
      $scope.infoClass = 'alert alert-danger';
      $scope.multipleErrors = false;

      $scope.rowSelected = false;

      $scope.activeView = 'details'; // Initially Details is active view
      $scope.pieLayer = 'countries';
      $scope.mapLayer = 'clusters';

      $scope.waitingForData = false;  // Loading data activated initialy
      $scope.excelInfoText = 'Download the template and fill it out with ' +
                              'information about your isolates: Date, Country...';
      $scope.searchInfoText = '<b><i>Example</i></b>: Date: 1960|1961|...; Country: Singapore; Organism: ...'
      // Grid table
      // Create Table view based on example from the data
      $scope.gridOptions = TableViewService.gridLayout();
      $scope.tableDataReady = false;

      // Viz related variables
      $scope.isolates = [];
      $scope.loadData = false;

      $scope.startAnimation = false;

      // Spinner
      $scope.spinner = {
         startSpinner: function () {
            $scope.waitingForData = true;
            $activityIndicator.startAnimating();
         },
         stopSpinner : function () {
            // Change grey background of spinner container
            $scope.waitingForData = false;
            $activityIndicator.stopAnimating();
         }
      };

      // Reset button for selected clusters hidden initially
      // TODO: Move this to mapLayer
      //$("#reset_clusters").css({'display' : 'none'});

      $scope.downloadExcelFile = function(){
         var url = ENV.apiEndpoint + 'metadataform.xlsx';
         var element = angular.element('<a/>');
            element.attr({
               href: url,
               target: '_self',
               download:'metadata_form.xlsx'
            })[0].click();
      };

      // Listener to play button
      $scope.playAnimation = function() {
        $scope.startAnimation = true;
      };

      $scope.groupSelection = [];
      $scope.groupColor = 0;
      $scope.isAllSelected = false;
      $scope.toColorGroup = function (row){
        console.log(row);
        var id = row.entity.properties.data.id;
        // If id exists remove it, if not, push it
        var index = $scope.groupSelection.indexOf(id);
        if (index === -1){
          $scope.groupSelection.push(id);
          row.entity.properties.data.selected = true;
        }else{
          $scope.groupSelection = $filter('filter')($scope.groupSelection, function(value, index){
            return value !== id;
          }, true);
          row.entity.properties.data.selected = false;
        }

      };
      $scope.changeColorOfSelection = function (){
        //console.log($scope.groupSelection);
        $scope.groupSelection.forEach(function(id){
          $scope.isolates.forEach(function(isolate){
            if (id === isolate.properties.data.id){
              isolate.properties.data.colorGroup = $scope.groupColor;
            }
          });
        });
        $scope.$broadcast('groupColorSelectionChanged');
      };

      $scope.removeColorOfSelection = function(){
        $scope.isolates.forEach(function(isolate){
          isolate.properties.data.colorGroup = 0;
        });
        $scope.$broadcast('restoreSelectedColors');
      };

      // FIXME: DOESNT WORKKKK!!!!!!! Select only visible
      $scope.globalSelection = function(isAllSelected){
        var visibleRows = [];
        // If filters active, select one by one
        if ($scope.isolates.length === $scope.gridOptions.ngGrid.filteredRows.length){
          console.log('select all...');
          //$scope.isAllSelected = isAllSelected;
        }else{
          console.log('select few...');
          $scope.gridOptions.ngGrid.filteredRows.forEach(function(row){
            visibleRows.push(row.entity.properties.data.id);
          });
          console.log(visibleRows);
        }

        if (isAllSelected){
          $scope.isolates.forEach(function(isolate){
            if (visibleRows.indexOf(isolate.properties.data.id) !== -1 || visibleRows.length === 0){
              isolate.properties.data.selected = true;
              $scope.groupSelection.push(isolate.properties.data.id);
            }
          });
        }else{
          console.log('deselect all...');
          // FIXME:if previously is selected will keep the selection
          $scope.groupSelection = [];
          // Too consuming??
          // $scope.groupSelection = $filter('filter')($scope.groupSelection, function(value, index){
          //   return value !== id;
          // }, true);
          $scope.isolates.forEach(function(isolate){
            if (visibleRows.indexOf(isolate.properties.data.id) !== -1 || visibleRows.length === 0){
              isolate.properties.data.selected = false;
            }
          });
        }
      };

      $scope.$watch('groupColor', function (newVal, oldVal) {
        if (newVal, oldVal){
            $scope.changeColorOfSelection();
        }
      });

      $scope.demoData = function(data, source){
         // Visualization boxes hidden while loading
         //$('[class*="visualizations"]').hide();

         // TODO: Service to restart visualization
         $scope.errorsExist = false; // Hide alarms
         $scope.removeExcelSheet();

         $scope.loadData = false; // First we remove everything
         $scope.spinner.startSpinner();
         IsolatesService.getDemoData(data).getJSON(function(answer){
            $scope.getData(answer, source);
         });
      };

      // Function to get either the real data or test data
      // TODO: Create Service for this function
      $scope.getData = function (answer, source){
         $scope.isolates = [];
         $scope.unauthorized = false; // Hide authorization message
         // TODO: new service for this?
         answer.forEach(function(isolate){
           isolate.colorGroup = 0;
           isolate.selected = false;
         });
         console.log('Creating Clusters and Markers...');
         answer = MapMarkersService.createNewMarkers(answer, source);
         // Create Crossfilter Dimensiosn Data
         var crossfilterData = CrossfilterService.create(answer.isolates, source);
         console.log(crossfilterData);
         // Extend scope with crossfilter dimensions
         angular.extend($scope,crossfilterData);
         // Finally we update the scope variable isolates
         angular.extend($scope, answer); // scope <= {isolates: [...], markerList: [...]}
         //$scope.gridOptions.selectedItems = $scope.isolates;
         $scope.columDefs = TableViewService.setUpColumns($scope.isolates[0]);
         $scope.totalData = answer.isolates.length;
         console.log('Data ready...');
         $scope.loadData = true; // This triggers the vizs.
        //  $scope.gridOptions.selectAll(true);
        //  $scope.allSelected = true;
        //  $scope.tableDataReady = true;
         // Data ready => stop spinner
         $scope.spinner.stopSpinner();

      };

      $scope.$on('updateIsolates', function (){
         // Isolates are updated to everyone that listens
         // Is listening to all the filters active at the moment
         $scope.isolates = $scope.locations[0].top(Infinity);
         console.log('Updating isolates...', $scope.isolates.length);
         $scope.$broadcast('updateMap');
      });

      // $scope.$on('ngGridEventData', function(event){
      //   if (!$scope.allSelected){
      //     console.log(event);
      //     $scope.gridOptions.selectAll(true);
      //     $scope.allSelected = true;
      //     $scope.tableDataReady = true;
      //   }
      // });


      $scope.openModal = function (selection){
        console.log('Modal opened');
        var servicesResult = Isolaterunsservice.getAllDataRuns();
        var pipelineResult = Isolaterunsservice.getAllDataPipeline(selection.entity.properties.data.id);
        var answerService, answerPipeline;

        if (ENV.status === 'development'){
          console.log('Dev');
          answerService = servicesResult.getJSON;
          answerPipeline = pipelineResult.getJSON;
        }else{
          console.log('Prod');
          answerService = servicesResult.success;
          answerPipeline = pipelineResult.success;
        }

        // Chain promises
        var deferred = $q.defer();
        var promise = deferred.promise;
        answerPipeline(function(pipeline){
          console.log(pipeline);
          if (ENV.status !== 'development'){
            pipeline = angular.fromJson(pipeline);
          }
          deferred.resolve(pipeline);
          return promise;
        });

        promise.then(function(pipeline){
          answerService(function(runs){
            var id = 'I' + selection.entity.properties.data.id;
            var analysis = runs[id];

            var modalInstance = $modal.open({
              templateUrl: 'templates/modalTemplateAccordion.html',
              controller: 'ModelinstanceCtrl',
              size: 'lg',
              resolve: {
                analysis: function () {
                  return analysis;
                },pipeline: function () {
                  return pipeline;
                }
              }
            });

            modalInstance.result.then(function (selectedItem) {
              //$scope.selected = selectedItem;
            }, function () {
              console.log('Modal dismissed at: ' + new Date());
            });
          });

        });

      $scope.$on('openModal', function(event, args){
        console.log(args);
        $scope.openModal();
      });
    };

      // TODO: Move this to table View Service
      $scope.gridOptions.afterSelectionChange = function(selection) {
        //$scope.rowSelected = !$scope.rowSelected ;

        if (selection.selected){

          console.log(selection, Isolaterunsservice);
          $scope.openModal(selection);
        }

        // console.log(selection.length, $scope.isolates.length);
        // console.log($scope.gridOptions);
        // console.log($scope.allSelected);
        // if (selection.length !== undefined){
        //   $scope.id[0].filterAll();
        //   // Sellect all on/off. Fired when clicked select all button
        //   if (selection[0].selected){
        //
        //   }else{
        //
        //   }
        // }else{
        //   // Individual selection
        //   $scope.id[0].filter(function (d){
        //      return selection.entity.id == d;
        //   });
        //
        //
        // }

      };


      /////////////////////////////////////////
      // Initial load of the isolates data
      $scope.spinner.startSpinner();
      var serverCall = IsolatesService.getDBData();
      serverCall.success(function(answer){
        $scope.errorsExist = false;    // Hide alarms
        if (answer === null){
          if (ENV.status === 'development'){
            //var path = 'influenza_data.js';
            var path = 'staticFlu.js';
            IsolatesService.getDemoData(path).getJSON(function(answer){
               $scope.getData(answer, 'flu');
            });
          }else{
            $scope.infoClass = 'alert alert-danger';
            $scope.multipleErrors = false;
            $scope.errorsExist = true;
            $activityIndicator.stopAnimating();
            $scope.infoMessage = ' Data from the server could not be loaded';
          }
        }else{
          $scope.getData(answer, 'DB');
        }
      }).error(function (data, status) {
        try {
          $scope.multipleErrors = false;
          $scope.errorsExist = true;
          $activityIndicator.stopAnimating();
          $scope.infoClass = 'alert alert-danger';
          if (status === 401){
             $scope.infoMessage = ' Unauthorized user';
          }else{
             $scope.infoMessage = ' Error requesting data from server';
          }
        }
        catch(err) {
            $scope.infoMessage = ' Error requesting data from server';
        }
      });
});

// TODO: move it to its own controller
angular.module('mapVisualizationApp')
  .controller('ModelinstanceCtrl', function ($scope, $modalInstance, analysis, pipeline, Isolaterunsservice, $sce, $compile, ENV) {

  $scope.openedAccordions = true;
  $scope.analysis = analysis;
  angular.extend($scope, pipeline);

  if (ENV.status === 'development'){

    Isolaterunsservice
      .getServiceResult('', '', '', '')
      .getJSON(function(servicesHTML){
        console.log(servicesHTML);
        console.log($scope.analysis);
        angular.forEach($scope.analysis.services, function(value, key) {
          angular.element('.' + key).replaceWith(servicesHTML[value.service.split('-')[0]]);
        });
      });

  }else{

    var promises = [];
    angular.forEach($scope.analysis.services, function(value, key) {

      promises.push(Isolaterunsservice
                        .getServiceResult(
                            $scope.analysis.id,
                            value.id,
                            value.date,
                            value.service.split('-')[0],
                            value.service.split('-')[1]));


      //console.log(key + ': ' + servicesHTML[value.service.split('-')[0]]);
      //value.html = $sce.trustAsHtml(servicesHTML[value.service.split('-')[0]]);
      //angular.element('.' + key).replaceWith(servicesHTML[value.service.split('-')[0]]);
    });

    $q.all(promises).then(function(pipelineResult){

      

      angular.forEach($scope.analysis.services, function(value, key) {
        angular.element('.' + key).replaceWith(servicesHTML[value.service.split('-')[0]]);
      });

    });


  }

  // pipelineResult(function(servicesHTML){
  //       console.log(servicesHTML);
  //
  //       console.log($scope.analysis);
  //       angular.forEach($scope.analysis.services, function(value, key) {
  //         //console.log(key + ': ' + servicesHTML[value.service.split('-')[0]]);
  //         //value.html = $sce.trustAsHtml(servicesHTML[value.service.split('-')[0]]);
  //         angular.element('.' + key).replaceWith(servicesHTML[value.service.split('-')[0]]);
  //       });
  //
  //     });



  //$scope.hideOutput = true;
  //$scope.output = '';
  $scope.serviceDataProcess = function(serviceData){
    if (serviceData !== ''){
      console.log(serviceData);
      var serviceArray = [];
      var elements = serviceData.split('||');
      elements.forEach(function(element){
        var content = element.split('=');
        var serviceObject = {};
        serviceArray.push(serviceObject[content[0]] = content[1].split(','));
      });
      return serviceArray;
    }else{
      return [];
    }

  };

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.removeService = function (id) {
    console.log(id);
  };

  // $scope.getServiceResults = function (isolateID, runID, date, service){
  //   console.log(isolateID, runID, date, service);
  //   Isolaterunsservice
  //     .getServiceResult(isolateID, runID, date, service)
  //     .success(function(answer){
  //       $scope.output = $sce.trustAsHtml(answer);
  //       angular.element('#serviceOutput').replaceWith(answer);
  //       //$compile(angular.element('#serviceOutput'))($scope);
  //       console.log(answer);
  //     }).error(function(error){
  //       console.log(error);
  //     });
  //
  // };

});
