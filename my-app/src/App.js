import React from 'react';
import logo from './logo.svg';
import './App.css';

function fetchJson() {
  // fetch data from local file
  // TODO: In the future, the data would be fetched from Prof.Riesbeck's server
  let json = require('./poke-325-export.json');
  return json;
}

function getAnyReminders() {
  // return an array with author ids
  const submissionData = fetchJson()
  const slackers = []
  const date = new Date();
  var currentTime = date.getTime()
  for (var authorId in submissionData["authors"]) {
    var lastSubTime = mostRecentSubTime(authorId, currentTime)
    if (lastSubTime - currentTime > TimeUnit.DAYS.toMillis(4)) {
      slackers.concat([authorId])
    }
  }
  console.log("slackers: " + slackers)
  return slackers;
}

getAnyReminders()

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
