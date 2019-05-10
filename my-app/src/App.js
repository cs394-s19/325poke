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

function getAnyReminders() {
  // return an array with author ids
  const submissionData = fetchJson();
  const slackers = [];
  const currentTime = Date.now();
  let authorId;
  for (authorId in submissionData.authors) {
    // var lastSubTime = mostRecentSubTime(authorId, currentTime)
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
  console.log(author);
  return _.max(_.values(_.mapValues(author.submissions, (o => o.submitted))));
}

const populateListofSlackers = () => {
  const slackers = getAnyReminders();
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
  return (
    <div className="App">
      {populateListofSlackers()}
    </div>
  );
}

export default App;
