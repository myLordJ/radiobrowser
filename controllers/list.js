var app = angular.module('RadioBrowserApp');

app.controller('ListController', function(radiobrowser, audioplayer, relLink, $stateParams) {
    var vm = this;

    var resultListFull = [];
    var relLinkCorrected = relLink.value;

    if ($stateParams.tag) {
        relLinkCorrected = '/webservice/json/stations/bytagexact/' + encodeURIComponent($stateParams.tag);
    } else if ($stateParams.state) {
        relLinkCorrected = '/webservice/json/stations/bystateexact/' + encodeURIComponent($stateParams.state);
    } else if ($stateParams.country) {
        relLinkCorrected = '/webservice/json/stations/bycountryexact/' + encodeURIComponent($stateParams.country);
    } else if ($stateParams.language) {
        relLinkCorrected = '/webservice/json/stations/bylanguageexact/' + encodeURIComponent($stateParams.language);
    } else if ($stateParams.codec) {
        relLinkCorrected = '/webservice/json/stations/bycodecexact/' + encodeURIComponent($stateParams.codec);
    }

    function changeItemsPerPage(items) {
        vm.itemsPerPage = items;
        updateList();
    }

    function updateList() {
        vm.resultList = resultListFull.slice((vm.bigCurrentPage - 1) * vm.itemsPerPage, (vm.bigCurrentPage) * vm.itemsPerPage);
    }

    function clearList() {
        resultListFull = [];
        vm.bigCurrentPage = 1;
        vm.bigTotalItems = 0;
        updateList();
    }

    function vote(station) {
        radiobrowser.get('/webservice/json/vote/' + station.id).then(function(data) {
            if (data.data.ok === "true") {
                station.votes = parseInt(station.votes) + 1;
            } else {
                alert("could not vote for station: " + data.data.message);
            }
            updateList();
        }, function(err) {
            console.log("error:" + err);
        });
    }

    function displayList() {
        radiobrowser.get(relLinkCorrected).then(function(data) {
            resultListFull = data.data;
            vm.bigCurrentPage = 1;
            vm.bigTotalItems = data.data.length;
            updateList();
        }, function(err) {
            console.log("error:" + err);
        });
    }

    function revertStation(stationid, changeid) {
        console.log("revertStation:" + stationid + "  " + changeid);
        radiobrowser.get('/webservice/json/revert/' + stationid + '/' + changeid).then(function(data) {
            clearList();
            if (data.data.ok === "true") {
                alert("undelete ok");
            } else {
                alert("could not undelete station:" + data.data.message);
            }
        }, function(err) {
            console.log("error:" + err);
        });
    };

    function play(id) {
        // decode playlist
        radiobrowser.get("/webservice/json/url/" + id).then(function(data) {
            if (data.data.length > 0) {
                var station = data.data[0];
                if (station.ok === "true") {
                    audioplayer.play(station.url, station.name);
                }
            }
        }, function(err) {
            console.log("error:" + err);
            alert("could not find station");
        });
    }

    function edit(station) {
        console.log(JSON.stringify(station));
        vm.editStation = station;
        updateSimiliar(station.name);
        updateImageList(station.homepage);
        if (station.tags.trim() === "") {
            vm.editStation.tags_arr = [];
        } else {
            vm.editStation.tags_arr = station.tags.split(',');
        }
    }

    function getTagsArray(tags_string) {
        if (tags_string.trim() === "") {
            return [];
        }
        console.log("tags:"+tags_string);
        return tags_string.split(',');
    };

    vm.editStation = null;
    vm.resultList = [];
    vm.itemsPerPage = 20;
    vm.bigCurrentPage = 1;
    vm.bigTotalItems = 0;

    vm.revertStation = revertStation;
    vm.vote = vote;
    vm.play = play;
    vm.edit = edit;
    vm.changeItemsPerPage = changeItemsPerPage;
    vm.getTagsArray = getTagsArray;
    vm.updateList = updateList;

    displayList();
});