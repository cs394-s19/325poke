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

database.ref('/authors').once('value').then(function(snapshot) {
    console.log(snapshot.val());
});