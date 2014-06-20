'use strict';
var app = angular.module('app', [])
.controller('mainCtrl', ['$scope',
    function ($scope) {
        $scope.Requirments = 'Sorry your browser doesn\'t support File API. :(';
        $scope.result = null;
        $scope.xmlDom = null;
        $scope.collectionEntries = null;
        $scope.playListEntries = null;
        $scope.initialPackedDate = null;
        $scope.initalDateAsDate = null;
        $scope.initialUnpackedYear = null;
        $scope.initialUnpackedMonth = null;
        $scope.initialUnpackedDay = null;
        $scope.initialTime = null;
        $scope.initialTimeAsDate = null;
        $scope.playlistOutput = [];

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            $scope.Requirments = 'All requirments are met.';
        }

        $scope.handleFileSelect = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.dataTransfer.files; // FileList object.

            // files is a FileList of File objects. List some properties.
            var fileReader = new FileReader();

            for (var i = 0, file; file = files[i]; i++) {
                fileReader.readAsText(file);
            }

            fileReader.onload = function (evt) {
                $scope.playlistOutput = [];
                $scope.result = evt.target.result;
                $scope.xmlDom = $.xmlDOM($scope.result);
                $scope.collectionEntries = $scope.xmlDom.find("COLLECTION > ENTRY");
                $scope.playListEntries = $scope.xmlDom.find("NODE[TYPE='PLAYLIST'][NAME='HISTORY'] > PLAYLIST > ENTRY");
                
                $scope.initialTime = $($scope.playListEntries[0]).find("EXTENDEDDATA").attr("STARTTIME");
                $scope.initialPackedDate = $($scope.playListEntries[0]).find("EXTENDEDDATA").attr("STARTDATE");
                $scope.initialUnpackedYear = $scope.initialPackedDate >> 16;
                $scope.initialUnpackedMonth = ($scope.initialPackedDate >> 8) & 255;
                $scope.initialUnpackedDay = $scope.initialPackedDate & 255;                                
                $scope.initialTimeAsDate = (new Date).clearTime().addSeconds($scope.initialTime);
                $scope.initalDateAsDate = new Date($scope.initialUnpackedYear,
                    ($scope.initialUnpackedMonth - 1),
                    $scope.initialUnpackedDay,
                    $scope.initialTimeAsDate.getHours(),
                    $scope.initialTimeAsDate.getMinutes(),
                    $scope.initialTimeAsDate.getSeconds());
                
                $scope.playListEntries.each(function () {
                    var needAbsoluteTime = $("input[id='absolute_time']:checked").length == 1;
                    var playlistEntryPimaryKey = $(this).find("PRIMARYKEY");
                    var plyaListEntryExtendData = $(this).find("EXTENDEDDATA");
                    var playListEntryKey = playlistEntryPimaryKey.attr("KEY");
                    var playListEntryStartTime = plyaListEntryExtendData.attr("STARTTIME");
                    var playListEntrySartTimeAsDate = (new Date).clearTime().addSeconds(playListEntryStartTime);
                    var playListEntryPackedDate = plyaListEntryExtendData.attr("STARTDATE");
                    var playListEntryUnpackedYear = playListEntryPackedDate >> 16;
                    var playListEntryUnpackedMonth = (playListEntryPackedDate >> 8) & 255;
                    var playListEntryUnpackedDay = playListEntryPackedDate & 255;
                    var playListEntryDate = new Date(playListEntryUnpackedYear,
                        (playListEntryUnpackedMonth - 1),
                        playListEntryUnpackedDay,
                        playListEntrySartTimeAsDate.getHours(),
                        playListEntrySartTimeAsDate.getMinutes(),
                        playListEntrySartTimeAsDate.getSeconds());
                    var timeSpan = new TimeSpan(playListEntryDate - $scope.initalDateAsDate);
                    var absoluteTime = (new Date).clearTime().addHours(timeSpan.hours).addMinutes(timeSpan.minutes)
                        .addSeconds(timeSpan.seconds);
                    var targetTime = needAbsoluteTime ? absoluteTime : playListEntryDate;
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
                $("#playlist").removeClass('invisible');
                //$("#code").removeClass('invisible');
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