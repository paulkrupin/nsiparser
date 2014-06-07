'use strict';
var app = angular.module('app', ['angularFileUpload'])
.controller('mainCtrl', ['$scope',
    function ($scope) {
        $scope.Hello = 'Hello';
        $scope.World = 'World!';
        $scope.Requirments = 'Sorry your browser doesn\'t support File API. :(';

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            $scope.Requirments = 'All requirments are met.';
        }

        $scope.handleFileSelect = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();

            //var files = evt.target.files; // FileList object
            var files = evt.dataTransfer.files; // FileList object.

            // files is a FileList of File objects. List some properties.
            var output = [];
            var fileReader = new FileReader();
            fileReader.onload = function (evt) {
                //console.log(evt.target.result);
                var res = evt.target.result;
                console.log($(res).find('PLAYLISTS')[0].outerHTML);
            };
            for (var i = 0, file; file = files[i]; i++) {
                output.push('<li><strong>', escape(file.name), '</strong> (', file.type || 'n/a', ') - ',
                            file.size, ' bytes, last modified: ',
                            file.lastModifiedDate.toLocaleDateString(), '</li>');
                fileReader.readAsText(file);
            }
            document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
        };

        $scope.handleDragOver = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        };

        // Setup the dnd listeners.
        var dropZone = document.getElementById('drop_zone');
        dropZone.addEventListener('dragover', $scope.handleDragOver, false);
        dropZone.addEventListener('drop', $scope.handleFileSelect, false);

        //document.getElementById('files').addEventListener('change', $scope.handleFileSelect, false);
        //document.getElementById('files').addEventListener('change', handleFileSelect, false);
    }]);