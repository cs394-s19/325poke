// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

function fetchJson() {
    // fetch data from local file
    // TODO: In the future, the data would be fetched from Prof.Riesbeck's server
    let json = require('./example-submission-data.json');
    return json;
}

function updateJson(originJson, json) {
    let formattedJson = originJson === null ? {} : originJson;
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