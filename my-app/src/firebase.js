let firebase = require('firebase');
var config = {
    apiKey: "AIzaSyAEWyUd8kAtjRRMVGZCV07f1IoQrWeLzls",
    authDomain: "poke-325.firebaseapp.com",
    databaseURL: "https://poke-325.firebaseio.com/",
    storageBucket: "poke-325.appspot.com"
};

firebase.initializeApp(config);

// Get a reference to the database service
let database = firebase.database();

function fetchJson() {
    // Fetch data from local file
    // TODO: In the future, the data would be fetched from Prof.Riesbeck's server
    let json = require('./resources/example-submission-data.json');
    return json;
}

// fetch json and use it to update the database
function updateSubmissionInDatabase() {
    // query database
    let ref = database.ref('/').once('value').then((snapshot) => {
        // when query finished, call updatejson() to compare and "merge" the current data in database with new json data
        let newJson = updateJson(snapshot.val(), fetchJson());
        console.log(newJson);
        // upload the data to database
        database.ref('/').update(newJson);
    });
}

function updateJson(originjson, json) {
    let formattedJson = originjson;
    // fetch formatted json from database
    if (!formattedJson.hasOwnProperty('authors')) {
        formattedJson['authors'] = {};
    }
    // reformat the json and also compare & merge with database
    let keyList = Object.keys(json['submissions']);
    keyList.forEach((key) => {
        let submitObject = json['submissions'][key];
        if (!formattedJson['authors'].hasOwnProperty(submitObject['author'])) {
            formattedJson['authors'][submitObject['author']] = {};
            formattedJson['authors'][submitObject['author']]['submissions'] = {}
        }
        if (!formattedJson['authors'][submitObject['author']]['submissions'].hasOwnProperty(submitObject['exid'])) {
            formattedJson['authors'][submitObject['author']]['submissions'][submitObject['exid']] = {};
            formattedJson['authors'][submitObject['author']]['submissions'][submitObject['exid']]["submitted"] = submitObject['submitted'];
        } else if (formattedJson['authors'][submitObject['author']]['submissions'][submitObject['exid']]["submitted"] < submitObject['submitted'])
            formattedJson['authors'][submitObject['author']]['submissions'][submitObject['exid']]["submitted"] = submitObject['submitted'];
        formattedJson['authors'][submitObject['author']]['submissions'][submitObject['exid']]["status"] = submitObject['status'];
    });

    return formattedJson;
}

updateSubmissionInDatabase();

// database.ref('/').update(newJson);