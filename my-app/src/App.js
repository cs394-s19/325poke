import React from 'react';
import './App.css';
import _ from 'lodash';

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
    const lastSubTime = mostRecentSubTime(submissionData.authors[authorId]);
    console.log(lastSubTime)
    console.log(currentTime - 345600000)
    if (lastSubTime < currentTime - 345600000) {
      slackers.push(authorId);
    }
  }
  console.log("slackers: " + slackers);
  return slackers;
}

const mostRecentSubTime = (author) => {
  console.log(author);
  return _.max(_.values(_.mapValues(author.submissions, (o => o.submitted))));
}

function App() {
  return (
    <div className="App">
      {getAnyReminders()}
    </div>
  );
}

export default App;
