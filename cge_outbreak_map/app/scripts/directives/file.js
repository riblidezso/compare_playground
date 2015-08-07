'use strict';

angular.module('mapVisualizationApp')
  .directive('file', function (ExcelParserService, GeoLocationService) {
    return {
      templateUrl: 'templates/uploadExcelFileTemplate.html',
      restrict: 'A',
      //scope: true, // Inherits from the parent's scope.
      link: function postLink(scope, element, attrs) {
         console.log('Init file directive...');
         // Excel variables

         var parseExcel = ExcelParserService.parseFile;
         scope.geolocation = GeoLocationService;

         element.find('input').bind('change', function(event){
           console.log('Parsing excel...'); // Uploading excel sheet
           scope.excelRight = false;
           scope.errorsExist = false; // Hide alarms
           //scope.isolates = [];
           scope.loadData = false; // First we remove everything
           scope.spinner.startSpinner();
           scope.$apply();
           var files = event.target.files;
           var file = files[0];

           scope.testloaded = false;

           if (!scope.excelRight){
             // Call service to process excel file
             parseExcel(file, false).then(function(answer){
                console.log(answer);
                if (answer.errors.nErrors > 0){
                   scope.errorsExist = true;
                   scope.infoClass = 'alert alert-warning';
                   scope.multipleErrors = false;
                   scope.infoMessage = 'Errors were found in your template.'+
                                        ' Wrong isolates were skipped.';
                   //scope.messages = answer.errors.messages;
                   scope.infoMessage =
                      answer.errors.nErrors + ' ' +
                      'errors were detected in the Excel file';

                   //scope.errorsExist = false;
                }
                scope.excelRight = true;
                 var isolates = [];
                 // Get metadata array
                 answer.files.forEach(function(name){
                    isolates.push(answer.metadata[name]);
                 });

                 // FIXME: This should be a service injected to directive
                 scope.getData(isolates, 'excel');
                 GeoLocationService.clearLocation();
                //}
             });
          }
         });

         scope.removeExcelSheet = function (){

            if (scope.excelRight){
               // TODO: Service to go back to initial state.
               //
               // scope.myData = RestartViewService.restartTable();
               // RestartViewService.restartMap();
               // RestartViewService.restartUploader();
               //
               var inputElement = element.find('input');
               inputElement.replaceWith(inputElement.val('').clone(true));

               scope.excelRight = false;
               scope.excelExists = false;
               scope.errorsExist = false; // Hide alarms
               scope.loadData = false; // Removing Data
               scope.waitingForData = true; // Show grey background
               scope.isolates = [];
               GeoLocationService.clearLocation();
            }
         };

      }
    };
  });
