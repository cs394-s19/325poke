// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();


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

function fetchJson() {
    // fetch data from local file
    // TODO: In the future, the data would be fetched from Prof.Riesbeck's server
    let json = require('./example-submission-data.json');
    return json;
}

function updateJson(originjson, json) {
    // fetch formatted json from database
    let formattedJson = originjson;
    if (formattedJson == null)
        formattedJson = {};
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
            formattedJson['authors'][submitObject['author']]['exercises'] = {};
            formattedJson['authors'][submitObject['author']]['submissions'] = [];
        } else if (!formattedJson['authors'][submitObject['author']].hasOwnProperty('submissions')) {
            formattedJson['authors'][submitObject['author']]['submissions'] = [];
        }
        // make a new variable to make expression shorter(actually not that much)
        let currSubmissions = formattedJson['authors'][submitObject['author']]['exercises'];
        // check if the specific author have the specific exid
        let strExid = submitObject['exid'].toString();
        if (!currSubmissions.hasOwnProperty(strExid)) {
            // initialize the required fields
            currSubmissions[strExid] = {};
            currSubmissions[strExid]["submitted"] = submitObject['submitted'];
            currSubmissions[strExid]["submit_hist"] = [];
            currSubmissions[strExid]["submit_hist"].push(submitObject);
        }
        if (currSubmissions[strExid]["submitted"] < submitObject['submitted'])
            currSubmissions[strExid]["submitted"] = submitObject['submitted'];
        // check corner case (mainly caused by old data)
        if (!currSubmissions[strExid].hasOwnProperty("submit_hist"))
            currSubmissions[strExid]["submit_hist"] = [];
        // if the current data is not in the submit history, add it
        if (!isSubmitInSubmitHist(currSubmissions[strExid]["submit_hist"], submitObject)) {
            currSubmissions[strExid]["submit_hist"].push(submitObject);
        }
        if (!isSubmitInSubmitHist(formattedJson['authors'][submitObject['author']]['submissions'], submitObject)) {
            formattedJson['authors'][submitObject['author']]['submissions'].push(submitObject);
        }
        formattedJson['authors'][submitObject['author']]['exercises'][strExid]["status"] = submitObject['status'];
    });




    return formattedJson;
}

function sendEmail(json) {

}

exports.updateDatabaseAndSendEmail =
    functions.pubsub.schedule('0 20 * * *').timeZone('America/Chicago').onRun((context) => {
        // query database
        return admin.database().ref('/').once('value').then((snapshot) => {
            // when query finished, call updatejson() to compare and "merge" the current data in database with new json data
            let newJson = updateJson(snapshot.val(), fetchJson());
            // upload the data to database
            admin.database().ref('/').update(newJson);
        });
    });