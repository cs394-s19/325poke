// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

admin.database().ref('/authors').once('value').then(function(snapshot) {
    console.log(snapshot.val());
});

function analyseJson(json) {

}

function sendEmail(json) {

}

exports.scheduledFunctionCrontab =
    functions.pubsub.schedule('56 12 * * *').timeZone('America/Chicago').onRun((context) => {
        // analyseJson();
        // sendEmail();
        return admin.database().ref('/messages').push({original: "original333333333333"});
    });