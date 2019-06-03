// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const _ = require('lodash');
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const axios = require('axios');

const startDate = new Date('September 27, 2018 08:00:00').getTime()
const endDate = new Date('December 14, 2018 08:00:00').getTime()
const firstRemDays = 4;
const secondRemDays = 7;
const thirdRemDays = 10;

const ai = [105, 106, 107, 109, 110, 111, 112, 113, 114, 637, 638, 651, 661,
    662, 670, 671, 714, 715, 717, 733, 740, 741, 742, 743, 744];
const challenge = [95, 96, 109, 110, 617, 618, 619, 620, 621, 717];

// for testing
const date1 = new Date('September 28, 2018 08:00:00').getTime()
const date2 = new Date('October 5, 2018 08:00:00').getTime()
const date3 = new Date('October 12, 2018 08:00:00').getTime()
const date4 = new Date('October 19, 2018 08:00:00').getTime()
const date5 = new Date('October 26, 2018 08:00:00').getTime()
const date6 = new Date('November 2, 2018 08:00:00').getTime()
const date7 = new Date('November 9, 2018 08:00:00').getTime()
const date8 = new Date('November 16, 2018 08:00:00').getTime()
const date9 = new Date('November 23, 2018 08:00:00').getTime()
const date10 = new Date('November 30, 2018 08:00:00').getTime()
const date11 = new Date('December 7, 2018 08:00:00').getTime()
const date12 = new Date('December 14, 2018 08:00:00').getTime()

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

// Get variables needed to send to a given author.
// Returns object with relevant information.
function getAuthorVars (author, curr_time) {
    let sub_last = null;
    let ex_last = null;

    const submissions = _.filter(author["submissions"], (o => o["submitted"] < curr_time));
    if (submissions.length > 0) {
      const newest_submission = _.maxBy(submissions, (o => o.submitted));
      sub_last = Math.floor((curr_time - newest_submission["submitted"]) / 86400000);
    }

    // only new submissions
    const subs_chronological = _.sortBy(submissions, (o => o.submitted));
    const new_submissions = _.uniqBy(subs_chronological, (o => o["exid"]) );
    if (new_submissions.length > 0) {
      const newest_new_submission = _.maxBy(new_submissions, (o => o.submitted));
      ex_last = Math.floor((curr_time - newest_new_submission["submitted"]) / 86400000);
    }

    // only most recent version of submissions
    const subs_rev_chronological = _.reverse(subs_chronological);
    const exercises = _.uniqBy(subs_rev_chronological, ( o => o["exid"]));

    const exercises_done = _.filter(exercises, (o => o.status == "Done")).length;
    const exercises_not_done = exercises.length - exercises_done;

    return {
        sub_last: sub_last,
        ex_last: ex_last,
        exercises_done: exercises_done,
        exercises_not_done: exercises_not_done,
        subs: submissions.length,
        exp: 3 * Math.floor((curr_time - date1) / 604800000),
        ai_exercises_attempted: _.filter(exercises, (o => ai.includes(o.exid))).length,
        challenge_exercises_attempted: _.filter(exercises, (o => challenge.includes(o.exid))).length
    };
};

function getEmailVars (json, currentTime) {
    return _.mapValues(json.authors, (o => getAuthorVars(o, currentTime)));
};

function getEmailsToSend(json, currentTime) {
    const reminderBuckets = json.reminders[currentTime];
    const emails = _.pick(getEmailVars(json, currentTime), _.flatten(_.values(reminderBuckets)));
    return _.mapValues(emails, (v => ({ subject: '325 Poke', text:
      `Heads up! It's been ${v.sub_last} days since you last submitted anything to the Code Critic${v.ex_last > v.sub_last ? `, and ${v.ex_last} days since you last submitted a new exercise.` : '.'}

      Two to three new exercises a week are expected, plus resubmissions of exercises that needed revision.

      If you're stuck on something, get help! Email me what you've tried and what happened. Put 325 and the exercise name in the Subject line. Include code and input/output in the email (no attachments).

      Your current stats: ${v.exercises_done} exercises done, ${v.exercises_not_done} exercises in progress, ${v.subs} submissions total.
      Advanced stats: ${v.ai_exercises_attempted} ai exercises and ${v.challenge_exercises_attempted} challenge exercises attempted.

      ${currentTime > startDate + 3 * 604800000 ? `Expected at this point in the quarter: ${v.exp} exercises done or almost done.` : ''}`
    })));
}

exports.updateDatabaseAndSendEmailFinal =
    functions.pubsub.schedule('10 17 * * *').timeZone('America/Chicago').onRun((context) => {
        // query database
        return admin.database().ref('/').once('value').then((snapshot) => {
            // when query finished, call updatejson() to compare and "merge" the current data in database with new json data
            let newJson = updateJson(snapshot.val(), fetchJson());
            // upload the data to database
            admin.database().ref('/').update(newJson);
            //console.log(newJson);
            // send emails as of a certain date
            const emails = getEmailsToSend(newJson, new Date('October 24, 2018 08:00:00').getTime());
        });
    });

// TODO: When we start axios, see below

// exports.updateDatabaseAndSendEmail =
//     functions.pubsub.schedule('0 20 * * *').timeZone('America/Chicago').onRun((context) => {
//         axios.get('/')
//             .then(function (response) {
//                 // query database
//                 admin.database().ref('/').once('value').then((snapshot) => {
//                 // when query finished, call updatejson() to compare and "merge" the current data in database with new json data
//                 let newJson = updateJson(snapshot.val(), fetchJson());
//                 // upload the data to database
//                 admin.database().ref('/').update(newJson);
//                 });
//                 console.log(response);
//             })
//             .catch(function (error) {
//                 // handle error
//                 console.log(error);
//             })
//             .finally(function () {
//                 axios.post('/', [])
//                 .then(function (response) {
//                     console.log(response);
//                   })
//                   .catch(function (error) {
//                     console.log(error);
//                   });
//             });
//
//     });
