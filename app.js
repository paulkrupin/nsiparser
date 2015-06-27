'use strict';

var handleDragOver = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
};

var handleFileSelect = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var fileReader = new FileReader();

    for (var i = 0, file; file = files[i]; i++) {
        fileReader.readAsText(file);
    }

    fileReader.onload = function (evt) {
        var playlistOutput = [];
        var result = evt.target.result;
        var xmlDom = $.xmlDOM(result);
        var collectionEntries = xmlDom.find('COLLECTION > ENTRY');
        var playListEntries = xmlDom.find('NODE[TYPE=\'PLAYLIST\'][NAME=\'HISTORY\'] > PLAYLIST > ENTRY');

        var initialTime = $(playListEntries[0]).find('EXTENDEDDATA').attr('STARTTIME');
        var initialPackedDate = $(playListEntries[0]).find('EXTENDEDDATA').attr('STARTDATE');
        var initialUnpackedYear = initialPackedDate >> 16;
        var initialUnpackedMonth = (initialPackedDate >> 8) & 255;
        var initialUnpackedDay = initialPackedDate & 255;
        var initialTimeAsDate = (new Date).clearTime().addSeconds(initialTime);
        var initalDateAsDate = new Date(initialUnpackedYear,
            (initialUnpackedMonth - 1),
            initialUnpackedDay,
            initialTimeAsDate.getHours(),
            initialTimeAsDate.getMinutes(),
            initialTimeAsDate.getSeconds());

        playListEntries.each(function () {
            var needAbsoluteTime = document.getElementById('absolute_time').checked;
            var playlistEntryPimaryKey = $(this).find('PRIMARYKEY');
            var plyaListEntryExtendData = $(this).find('EXTENDEDDATA');
            var playListEntryKey = playlistEntryPimaryKey.attr('KEY');
            var playListEntryStartTime = plyaListEntryExtendData.attr('STARTTIME');
            var playListEntrySartTimeAsDate = (new Date).clearTime().addSeconds(playListEntryStartTime);
            var playListEntryPackedDate = plyaListEntryExtendData.attr('STARTDATE');
            var playListEntryUnpackedYear = playListEntryPackedDate >> 16;
            var playListEntryUnpackedMonth = (playListEntryPackedDate >> 8) & 255;
            var playListEntryUnpackedDay = playListEntryPackedDate & 255;
            var playListEntryDate = new Date(playListEntryUnpackedYear,
                (playListEntryUnpackedMonth - 1),
                playListEntryUnpackedDay,
                playListEntrySartTimeAsDate.getHours(),
                playListEntrySartTimeAsDate.getMinutes(),
                playListEntrySartTimeAsDate.getSeconds());
            var timeSpan = new TimeSpan(playListEntryDate - initalDateAsDate);
            var absoluteTime = (new Date).clearTime().addHours(timeSpan.hours).addMinutes(timeSpan.minutes)
                .addSeconds(timeSpan.seconds);
            var targetTime = needAbsoluteTime ? absoluteTime : playListEntryDate;
            collectionEntries.each(function () {
                var collectionEntryArtist = $(this).attr('ARTIST');
                var collectionEntryTile = $(this).attr('TITLE');
                var collectionEntryLocation = $(this).find('LOCATION');
                if (collectionEntryLocation.attr('VOLUMEID') + collectionEntryLocation.attr('DIR')
                    + collectionEntryLocation.attr('FILE') == playListEntryKey) {
                    playlistOutput.push('<li>' + targetTime.toString('HH:mm:ss') + ' '
                        + $.trim(collectionEntryArtist) + ' - '
                        + $.trim(collectionEntryTile) + '</li>');
                }
            });
        });
        
        var playList = document.getElementById('playlist');
        playList.innerHTML = '<ul>' + playlistOutput.join('') + '</ul>';
        playList.className = 'dashed-border';
    };
};

document.addEventListener('DOMContentLoaded', function () {
    var Requirments = 'Sorry your browser doesn\'t support File API. :(';
    var result = null;
    var xmlDom = null;
    var collectionEntries = null;
    var playListEntries = null;
    var initialPackedDate = null;
    var initalDateAsDate = null;
    var initialUnpackedYear = null;
    var initialUnpackedMonth = null;
    var initialUnpackedDay = null;
    var initialTime = null;
    var initialTimeAsDate = null;
    var playlistOutput = [];

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        Requirments = 'All requirments are met.';
    }

    var requirmentsElement = document.getElementById('requirments');
    requirmentsElement.textContent = Requirments;

    // Setup the dnd listeners.
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
});