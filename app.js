'use strict';
var app = angular.module('app', [])
.controller('mainCtrl', ['$scope',
    function ($scope) {
        $scope.Requirments = 'Sorry your browser doesn\'t support File API. :(';
        $scope.result = null;
        $scope.xmlDom = null;
        $scope.collectionEntries = null;
        $scope.playListEntries = null;
        $scope.initialTime = null;
        $scope.initialTimeAsDate = null;
        $scope.playlistOutput = [];

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            $scope.Requirments = 'All requirments are met.';
        }

        $scope.handleFileSelect = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();

            //var files = evt.target.files; // FileList object
            var files = evt.dataTransfer.files; // FileList object.

            // files is a FileList of File objects. List some properties.
            var fileReader = new FileReader();

            for (var i = 0, file; file = files[i]; i++) {
                fileReader.readAsText(file);
            }

            fileReader.onload = function (evt) {
                $scope.result = evt.target.result;
                $scope.xmlDom = $.xmlDOM($scope.result);
                $scope.collectionEntries = $scope.xmlDom.find("COLLECTION > ENTRY");
                $scope.playListEntries = $scope.xmlDom.find("NODE[TYPE='PLAYLIST'][NAME='HISTORY'] > PLAYLIST > ENTRY");
                $scope.initialTime = $($scope.playListEntries[0]).find("EXTENDEDDATA").attr("STARTTIME");
                $scope.initialTimeAsDate = (new Date).clearTime().addSeconds($scope.initialTime);
                var initialHours = -$scope.initialTimeAsDate.getHours();
                var initialMinutes = -$scope.initialTimeAsDate.getMinutes();
                var initialSeconds = -$scope.initialTimeAsDate.getSeconds();



                $scope.playListEntries.each(function () {
                    var needAbsoluteTime = $("input[id='absolute_time']:checked").length == 1;
                    var playlistEntryPimaryKey = $(this).find("PRIMARYKEY");
                    var plyaListEntryExtendData = $(this).find("EXTENDEDDATA");
                    var playListEntryKey = playlistEntryPimaryKey.attr("KEY");
                    var playListEntryStartDate = plyaListEntryExtendData.attr("STARTDATE");
                    var playListEntryStartTime = plyaListEntryExtendData.attr("STARTTIME");
                    var playListEntrySartTimeAsDate = (new Date).clearTime().addSeconds(playListEntryStartTime);
                    var absoluteTime = (new Date).clearTime().addSeconds(playListEntryStartTime).addHours(initialHours)
                    .addMinutes(initialMinutes).addSeconds(initialSeconds);
                    var targetTime = needAbsoluteTime ? absoluteTime : playListEntrySartTimeAsDate;
                    $scope.collectionEntries.each(function () {
                        var collectionEntryArtist = $(this).attr("ARTIST");
                        var collectionEntryTile = $(this).attr("TITLE");
                        var collectionEntryLocation = $(this).find("LOCATION");
                        if (collectionEntryLocation.attr("VOLUMEID") + collectionEntryLocation.attr("DIR")
                            + collectionEntryLocation.attr("FILE") == playListEntryKey) {
                            $scope.playlistOutput.push("<li>" + targetTime.toString('HH:mm:ss') + " "
                                + $.trim(collectionEntryArtist) + " - "
                                + $.trim(collectionEntryTile) + "</li>");
                        }
                    });
                });

                $("#playlist").html("<ul>" + $scope.playlistOutput.join("") + "</ul>");
            };
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
    }]);