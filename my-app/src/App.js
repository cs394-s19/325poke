import React from 'react';
import './App.css';
import _ from 'lodash';

const numDays = 4;

function fetchJson() {
  // fetch data from local file
  // TODO: In the future, the data would be fetched from Prof.Riesbeck's server
  let json = require('./poke-325-export.json');
  return json;
}

function getAnyReminders(currentTime) {
  // return an array with author ids
  const submissionData = fetchJson();
  const slackers = [];
  let authorId;
  for (authorId in submissionData.authors) {
    const lastSubTime = mostRecentSubTime(submissionData.authors[authorId]);
    const timeDiff = currentTime - lastSubTime;
    if (timeDiff > numDays * 86400000) {
      slackers.push([authorId, timeDiff]);
    }
  }
  console.log("slackers: " + slackers);
  return slackers;
}

const mostRecentSubTime = (author) => {
  return _.max(_.values(_.mapValues(author.submissions, (o => o.submitted))));
}

const populateListofSlackers = (currentTime) => {
  const slackers = getAnyReminders(currentTime);
  return _.map(slackers, (slacker, index) => {
    return (
      <div key={index}>
        An email should be sent to student {slacker[0]} because they have not submitted anything
        for {Math.floor(slacker[1] / 86400000)} days.
        <br/>
        <br/>
      </div>
    )
  });
}

function App() {
  // class start date = Thursday, September 27th
  // first email date = Friday, September 28th, 8am
  const date1 = new Date('September 28, 2018 08:00:00')

  // make list of every friday from date1 to end of quarter
  const times = [date1];

  return (
    <div className="App">
      {populateListofSlackers(times[0])}
    </div>
  );
}

export default App;
