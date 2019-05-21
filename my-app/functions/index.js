// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const startDate = new Date('September 27, 2018 08:00:00').getTime()
const endDate = new Date('December 14, 2018 08:00:00').getTime()
const numDays = 4;
const firstRemDays = 4;
const secondRemDays = 7;
const thirdRemDays = 10;


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

function forgetFutureSubmissions(submissionTime, currentTime) {
    // console.log(submissionTime);
    if (submissionTime > currentTime) {
        return startDate; // to calculate number of days without work at beginning of quarter
    } else {
        return submissionTime;
    }
}

function mostRecentSubTime(author, currentTime) {
    return _.max(_.values(_.map(author.submissions, (o => forgetFutureSubmissions(o.submitted, currentTime)))));}

function getReminderBuckets(jsonData, currentTime) {
    // return an object with 3 lists of author ids corresponding to sent reminders
    const submissionData = jsonData;
    const newReminders = {"rem1": [], "rem2": [], "rem3": [], "sentTime": currentTime};
    let authorId;
    for (authorId in submissionData.authors) {
        const lastSubTime = mostRecentSubTime(submissionData.authors[authorId], currentTime);
        const timeDiff = currentTime - lastSubTime;
        if (timeDiff >= firstRemDays * 86400000 && timeDiff < (firstRemDays + 1) * 86400000) {
            newReminders.rem1.push(authorId);
        }
        else if (timeDiff >= secondRemDays * 86400000 && timeDiff < (secondRemDays + 1) * 86400000) {
            newReminders.rem2.push(authorId);
        }
        else if (timeDiff >= thirdRemDays * 86400000 && timeDiff < (thirdRemDays + 1) * 86400000) {
            newReminders.rem3.push(authorId);
        }
    }
    return newReminders;
}

function generateRemindersForQuarter(jsonData, startDateTime, endDateTime) {
    let getReminderBucketsCurry = _.curry(getReminderBuckets)(jsonData);
    const buckets = _.map(_.range(startDateTime, endDateTime + 1, 86400000), getReminderBucketsCurry);
    return _.mapValues(_.keyBy(buckets, o => o.sentTime), v => _.omit(v, 'sentTime'));
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
        if (!formattedJson['authors'][submitObject['author']]['exercises'].hasOwnProperty('ignoreme')) {
            formattedJson['authors'][submitObject['author']]['exercises']['ignoreme'] = true;
        }
        // make a new variable to make expression shorter(actually not that much)
        let currSubmissions = formattedJson['authors'][submitObject['author']]['exercises'];
        // check if the specific author have the specific exid
        let exid = submitObject['exid'];
        if (!currSubmissions.hasOwnProperty(exid)) {
            // initialize the required fields
            currSubmissions[exid] = {};
            currSubmissions[exid]["submitted"] = submitObject['submitted'];
            currSubmissions[exid]["submit_hist"] = [];
            currSubmissions[exid]["submit_hist"].push(submitObject);
        }
        if (currSubmissions[exid]["submitted"] < submitObject['submitted'])
            currSubmissions[exid]["submitted"] = submitObject['submitted'];
        // check corner case (mainly caused by old data)
        if (!currSubmissions[exid].hasOwnProperty("submit_hist"))
            currSubmissions[exid]["submit_hist"] = [];
        // if the current data is not in the submit history, add it
        if (!isSubmitInSubmitHist(currSubmissions[exid]["submit_hist"], submitObject)) {
            currSubmissions[exid]["submit_hist"].push(submitObject);
        }
        if (!isSubmitInSubmitHist(formattedJson['authors'][submitObject['author']]['submissions'], submitObject)) {
            formattedJson['authors'][submitObject['author']]['submissions'].push(submitObject);
        }
        formattedJson['authors'][submitObject['author']]['exercises'][exid]["status"] = submitObject['status'];
    });

    if (!formattedJson.hasOwnProperty('reminders')) {
        formattedJson['reminders'] = {};
    }
    formattedJson['reminders'] = generateRemindersForQuarter(formattedJson, startDate, endDate);


    // store reminders in specific author
    _.forEach(formattedJson['reminders'], (remList, timestamp) => {
        _.forEach(remList, (content, remType) => {
            _.forEach(content, (authorID) => {
                formattedJson['authors'][authorID]['reminders'][timestamp] = [];
                formattedJson['authors'][authorID]['reminders'][timestamp].push(remType);
            })
        })
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