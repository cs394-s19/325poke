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

function isSubmitInSubmitHist(hist, newSubmit) {
    let res = false;
    hist.forEach((submit) => {
        if (submit["author"] === newSubmit["author"]
        && submit["submitted"] === newSubmit["submitted"]
        && submit["exid"] === newSubmit["exid"]
        && submit["status"] === newSubmit["status"])
            res = true;
    });
    return res;
}

function updateJson(originjson, json) {
    // fetch formatted json from database
    let formattedJson = originjson;
    if (!formattedJson.hasOwnProperty('authors')) {
        formattedJson['authors'] = {};
    }
    // reformat the json and also compare & merge with database
    let keyList = Object.keys(json['submissions']);
    keyList.forEach((key) => {
        let submitObject = json['submissions'][key];
        // check if there already have this specific author
        if (!formattedJson['authors'].hasOwnProperty(submitObject['author'])) {
            formattedJson['authors'][submitObject['author']] = {};
            formattedJson['authors'][submitObject['author']]['submissions'] = {}
        }
        // make a new variable to make expression shorter(actually not that much)
        let currSubmissions = formattedJson['authors'][submitObject['author']]['submissions'];
        // check if the specific author have the specific exid
        if (!currSubmissions.hasOwnProperty(submitObject['exid'])) {
            // initialize the required fields
            currSubmissions[submitObject['exid']] = {};
            currSubmissions[submitObject['exid']]["submitted"] = submitObject['submitted'];
            currSubmissions[submitObject['exid']]["submit_hist"] = [];
            currSubmissions[submitObject['exid']]["submit_hist"].push(submitObject);
        }
        if (currSubmissions[submitObject['exid']]["submitted"] < submitObject['submitted'])
            currSubmissions[submitObject['exid']]["submitted"] = submitObject['submitted'];
        // check corner case (mainly caused by old data)
        if (!currSubmissions[submitObject['exid']].hasOwnProperty("submit_hist"))
            currSubmissions[submitObject['exid']]["submit_hist"] = [];
        // if the current data is not in the submit history, add it
        if (!isSubmitInSubmitHist(currSubmissions[submitObject['exid']]["submit_hist"], submitObject)) {
            currSubmissions[submitObject['exid']]["submit_hist"].push(submitObject);
        }
        formattedJson['authors'][submitObject['author']]['submissions'][submitObject['exid']]["status"] = submitObject['status'];
    });

    return formattedJson;
}

updateSubmissionInDatabase();

//database.ref('/').update(newJson);