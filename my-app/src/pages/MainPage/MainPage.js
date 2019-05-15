import React, {Component} from 'react';
import _ from 'lodash';
import {Button} from '@material-ui/core';
import {Link} from 'react-router-dom';
import './styles.css';
import database from '../../firebase'

const numDays = 4;

// class start date = Thursday, September 27th
const startDate = new Date('September 27, 2018 08:00:00').getTime()
// first email date = Friday, September 28th, 8am
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

// make list of every friday from date1 to end of quarter
const times = [date1, date2, date3, date4, date5, date6, date7, date8, date9, date10, date11, date12];


export class MainPage extends Component {

    // given a base date, returns an array of author ids to which we need to send reminders
    getAnyReminders(currentTime) {
        // return an array with author ids
        const submissionData = this.state.jsonData;
        //console.log(submissionData);
        const slackers = [];
        let authorId;
        for (authorId in submissionData.authors) {
            const lastSubTime = this.mostRecentSubTime(submissionData.authors[authorId], currentTime);
            const timeDiff = currentTime - lastSubTime;
            if (timeDiff > numDays * 86400000) {
                slackers.push([authorId, timeDiff]);
            }
        }
        //console.log("slackers: " + slackers);
        return slackers;
    }

// function to ensure we only look at the previous submissions given a current time
// kind of like a snapshot of the students' progress at the current time
// ensures we ignore the future submissions since we have that data already
    forgetFutureSubmissions = (submissionTime, currentTime) => {
        // console.log(submissionTime);
        if (submissionTime > currentTime) {
            return startDate; // to calculate number of days without work at beginning of quarter
        } else {
            return submissionTime;
        }
    }
    mostRecentSubTime = (author, currentTime) => {
        return _.max(_.values(_.mapValues(author.exercises, (o => this.forgetFutureSubmissions(o.submitted, currentTime)))));
    }

    populateListofSlackers = (currentTime) => {
        const slackers = this.getAnyReminders(currentTime);
        //console.log(slackers);
        return _.map(slackers, (slacker, index) => {
            return (
                <div key={index}>
                    A reminder should be sent to student <b><i>{slacker[0]}</i></b>, because nothing has been submitted
                    anything
                    for {Math.floor(slacker[1] / 86400000)} days.&nbsp;&nbsp;&nbsp;
                    <Button id="show" component={Link} to={{
                        pathname: "details",
                        exercises: this.state.jsonData.authors[slacker[0]].exercises,
                        student: slacker[0],
                        currentTime: currentTime
                    }}
                            label="Show Details" variant="contained" color="primary">
                        Show Details
                    </Button>
                    <br/>
                    <br/>
                </div>
            )
        });
    }

    populateWeeklyList = () => {
        //console.log(this.state.jsonData.authors["1769"].exercises);
        return _.map(times, (weeklyDeadline, index) => {
            console.log(weeklyDeadline);
            const newDate = new Date(weeklyDeadline)
            const month = newDate.getMonth() + 1
            const date = newDate.getDate()
            const year = newDate.getFullYear()
            return (
                <div>
                    <h2>Week {index + 1}: ending Friday, {month}/{date}/{year}</h2>
                    {this.populateListofSlackers(times[index])}
                </div>
            )
        })
    }

    constructor(props) {
        super(props);
        this.state = {
            jsonData: {},
            isLoaded: false,
        };
    }

    componentDidMount() {
        database.ref('/').once('value').then((snapshot) => {
            // when query finished, call updatejson() to compare and "merge" the current data in database with new json data
            this.setState({
                ...this.state,
                jsonData: snapshot.val(),
                isLoaded: true
            });
        });
    }

    render() {
        return (
            <div className="Main">
                <h1>
                    The 4-day reminders:
                </h1>
                {this.state.isLoaded ? this.populateWeeklyList() : null}
                {/* <h3>Week 11: Starting December 7, 2018</h3>
      {populateListofSlackers(times[10])} */}
            </div>
        );
    }

}
