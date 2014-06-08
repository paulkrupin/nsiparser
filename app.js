'use strict';
var app = angular.module('app', [])
.controller('mainCtrl', ['$scope',
    function ($scope) {
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
            var playlistOutput = [];
            var fileReader = new FileReader();
            fileReader.onload = function (evt) {
                //console.log(evt.target.result);
                var res = evt.target.result;
                var xmlDom = $.xmlDOM(res);
                var collectionEntries = xmlDom.find("COLLECTION > ENTRY");
                var playListEntries = xmlDom.find("NODE[TYPE='PLAYLIST'][NAME='HISTORY'] > PLAYLIST > ENTRY");
                var initialTime = $(playListEntries[0]).find("EXTENDEDDATA").attr("STARTTIME");
                var initialTimeAsDate = (new Date).clearTime().addSeconds(initialTime);
                var initialHours = -initialTimeAsDate.getHours();
                var initialMinutes = -initialTimeAsDate.getMinutes();
                var initialSeconds = -initialTimeAsDate.getSeconds();



                playListEntries.each(function () {
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
                    collectionEntries.each(function () {
                        var collectionEntryArtist = $(this).attr("ARTIST");
                        var collectionEntryTile = $(this).attr("TITLE");
                        var collectionEntryLocation = $(this).find("LOCATION");
                        if (collectionEntryLocation.attr("VOLUMEID") + collectionEntryLocation.attr("DIR")
                            + collectionEntryLocation.attr("FILE") == playListEntryKey) {
                            playlistOutput.push("<li>" + targetTime.toString('HH:mm:ss') + " "
                                + $.trim(collectionEntryArtist) + " - "
                                + $.trim(collectionEntryTile) + "</li>");
                        }
                    });
                });

                $("#playlist").html("<ul>" + playlistOutput.join("") + "</ul>");
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