import React, {Component} from 'react';
import _ from 'lodash';
import {Button, withStyles} from '@material-ui/core';
import {Link} from 'react-router-dom';
import './styles.css';
import database from '../../firebase'
import Chart from 'react-google-charts';

import {StyledHeader, SubmitReminderTable} from '../../components';

// styles
const styles = {
    textField: {
        width: 300,
        fontSize: 50,
    },
    weekColor: {
        color: 'white',
    },
    arrowColor: {
        fill: 'white'
    },
    week_label: {
        marginRight: 100,
    }
};

const ai = [105, 106, 107, 109, 110, 111, 112, 113, 114, 637, 638, 651, 661,
    662, 670, 671, 714, 715, 717, 733, 740, 741, 742, 743, 744];
const challenge = [95, 96, 109, 110, 617, 618, 619, 620, 621, 717];

const numDays = 4;

// class start date = Thursday, September 27th
// const startDate = new Date('September 27, 2018 08:00:00').getTime();
// const endDate = new Date('December 14, 2018 08:00:00').getTime();
//const currEndDate = endDate;
// make list of every friday from date1 to end of quarter
class MainPage extends Component {
    // generated week dict using the date array we have
    generateWeekDict(startDate, endDate) {
        console.log(startDate);
        let res = {};
        let dateArray = [];
        for (let i = startDate; i <= endDate; i = this.getNextDayOfWeek(i, 5)) {
            //console.log(i);
            dateArray.push(i);
        }
        let i = 1;
        for (; i < dateArray.length; i++) {
            res[i] = {
                "startDate": dateArray[i - 1],
                "endDate": dateArray[i]
            }
        }
        if (dateArray[i] !== endDate) {
            res[i] = {
                "startDate": dateArray[i - 1],
                "endDate": endDate
            }
        }
        return res;
    }

    getNextDayOfWeek(date, dayOfWeek) {
        let resultDate = new Date(date);
        let tmpDate = new Date(date);

        resultDate.setDate(tmpDate.getDate() + (dayOfWeek - 1 - tmpDate.getDay() + 7) % 7 + 1);

        return resultDate.getTime();
    }


    // Get variables needed to send to a given author.
    // Returns object with relevant information.
    getAuthorVars = (author, curr_time) => {
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

        const exercises_done = _.filter(exercises, (o => o.status === "Done")).length;
        const exercises_not_done = exercises.length - exercises_done;

        return {
            sub_last: sub_last,
            ex_last: ex_last,
            exercises_done: exercises_done,
            exercises_not_done: exercises_not_done,
            subs: submissions.length,
            exp: 3 * Math.floor( (curr_time - this.state.weekDict[1].endDate) / 604800000),
            ai_exercises_attempted: _.filter(exercises, (o => ai.includes(o.exid))).length,
            challenge_exercises_attempted: _.filter(exercises, (o => challenge.includes(o.exid))).length
        };
    };


    getEmailVars = (json, currentTime) => {
        console.log("email vars");
        console.log(json.authors);
        console.log(_.mapValues(json.authors, (o => this.getAuthorVars(o, currentTime))));
        return _.mapValues(json.authors, (o => this.getAuthorVars(o, currentTime)));
    };

    getEmailsToSend = (json, currentTime) => {
        const reminderBuckets = json.reminders[currentTime];
        const emails = _.pick(this.getEmailVars(json, currentTime), _.flatten(_.values(reminderBuckets)));
        console.log(currentTime);
        console.log(_.mapValues(emails, (v => ({ subject: '325 Poke', text:
          `Heads up! It's been ${v.sub_last} days since you last submitted anything to the Code Critic${v.ex_last > v.sub_last ? `, and ${v.ex_last} days since you last submitted a new exercise.` : '.'}

          Two to three new exercises a week are expected, plus resubmissions of exercises that needed revision.

          If you're stuck on something, get help! Email me what you've tried and what happened. Put 325 and the exercise name in the Subject line. Include code and input/output in the email (no attachments).

          Your current stats: ${v.exercises_done} exercises done, ${v.exercises_not_done} exercises in progress, ${v.subs} submissions total.
          Advanced stats: ${v.ai_exercises_attempted} ai exercises and ${v.challenge_exercises_attempted} challenge exercises attempted.

          ${currentTime > this.state.startDate + 3 * 604800000 ? `Expected at this point in the quarter: ${v.exp} exercises done or almost done.` : ''}`
        }))));
    };

    // given a base date, returns an array of author ids to which we need to send reminders
    getAnyReminders = (currentTime) => {
        // return an array with author ids
        const submissionData = this.state.jsonData;
        const slackers = [];
        let authorId;
        for (authorId in submissionData.authors) {
            if (submissionData.authors.hasOwnProperty(authorId)) {
                const lastSubTime = this.mostRecentSubTime(submissionData.authors[authorId], currentTime);
                const timeDiff = currentTime - lastSubTime;
                if (timeDiff > numDays * 86400000) {
                    slackers.push([authorId, timeDiff, submissionData.authors[authorId].name, submissionData.authors[authorId].email]);
                }
            }
        }
        return slackers;
    };

    // function to ensure we only look at the previous submissions given a current time
    // kind of like a snapshot of the students' progress at the current time
    // ensures we ignore the future submissions since we have that data already
    forgetFutureSubmissions = (submissionTime, currentTime) => {
        if (submissionTime > currentTime) {
            return this.state.startDate; // to calculate number of days without work at beginning of quarter
        } else {
            return submissionTime;
        }
    };
    mostRecentSubTime = (author, currentTime) => {
        return _.max(_.values(_.mapValues(author.exercises, (o => this.forgetFutureSubmissions(o.submitted, currentTime)))));
    };

    // based on getWeeklyReminders()
    getRemindersByChart(index, bucket) {
        if (index === -1 && bucket === -1)
            return;
        const startTime = this.state.weekDict[this.state.currWeek].startDate + 1;
        const endTime = this.state.weekDict[this.state.currWeek].endDate;
        const weeklyReminders = _.filter(this.state.reminders, (timeStamp, index) => { //TODO: rename
            return index >= startTime && index <= endTime;
        });
        return this.displaySpecificReminders([weeklyReminders[index]["rem" + bucket]]);
        // console.log([weeklyReminders[index - 1]]);
    }

    displaySpecificReminders = (reminders) => {
        // console.log(reminders);
        return (
            _.map(reminders, (listofAuthors, bucket) => {
                    return (
                        <div className="reminderList" key={bucket}>
                            {_.map(listofAuthors, (authorId, randomKey) => {
                                return (
                                    <div className="reminderElement" key={randomKey}>
                                        {this.state.jsonData.authors[authorId].name} ({this.state.jsonData.authors[authorId].email}) &nbsp;
                                        <div className="buttonShowDetails">
                                            <Button id="show" component={Link} to={{
                                                pathname: "details",
                                                exercises: this.state.jsonData.authors[authorId].exercises,
                                                student_id: authorId,
                                                student_name: this.state.jsonData.authors[authorId].name,
                                            }} label="Show Details" variant="contained" color="primary">
                                                Show Details
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })
        )
    };

    listWeeklyReminders = (startTime, endTime) => {
        return _.pickBy(this.state.reminders, (timeStamp, index) => {
            return index >= startTime && index <= endTime;
        })
    };

    // for histogram
    getDailyReminderByWeek = (week) => {
        let weeklyReminders = {};
        // let lastWeek = 0;
        // _.forEach(this.state.weekDict, (content, weekNumStr) => {
        //     if (parseInt(weekNumStr) > lastWeek) {
        //         lastWeek = parseInt(weekNumStr);
        //     }
        // });
        // "All"
        if (week === 0) {
            weeklyReminders = this.listWeeklyReminders(this.state.weekDict[this.state.lastWeek].startDate + 1, this.state.weekDict[this.state.lastWeek].endDate);
        } else {
            weeklyReminders = this.listWeeklyReminders(this.state.weekDict[week].startDate + 1, this.state.weekDict[week].endDate);
        }
        // console.log("these are the weekly reminders: " + Object.values(weeklyReminders));
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var resultData = [['Day', '1st', '2nd', '3rd']];
        _.map(weeklyReminders, (oneDayRem, timeStamp) => {
            var oneDayData = ["", 0, 0, 0];
            var dayIndex = new Date(Number(timeStamp)).getDay();
            oneDayData[0] = (days[dayIndex]);
            _.map(oneDayRem, (authors, bucket) => {
                if (bucket === 'rem1') {
                    oneDayData[1] = authors.length
                } else if (bucket === 'rem2') {
                    oneDayData[2] = authors.length
                } else if (bucket === 'rem3') {
                    oneDayData[3] = authors.length
                }
            });
            resultData.push(oneDayData)
        });
        // console.log("result data: " + resultData)
        return resultData
    };

    // given the resultData [['Day', '1st', '2nd', '3rd'], ['Mon', 3, 5, 7], ['Tue', 3, 6, 2], ... [...]]
    // and the week number
    // return an array: ['Week 1', 5, 4, 3]
    sumDailyToWeek = (dailyBreakdownData, currWeek) => {
      // initialize a new data array to update and return
      var resultData = ['Week ' + currWeek, 0, 0, 0];
      // cut off the first item in the array since the first item is an array of axis title and bucket names
      dailyBreakdownData.shift(); //.shift() pops the first element off of the array
      // initialize a count of # of reminders in each bucket
      var bucketOneCount = 0;
      var bucketTwoCount = 0;
      var bucketThreeCount = 0;
      // count up reminders over a week
      _.map(dailyBreakdownData, (arr) => {
        bucketOneCount += arr[1];
        bucketTwoCount += arr[2];
        bucketThreeCount += arr[3]
      });
      // update resultData to have the new bucket counts
      resultData[1] = bucketOneCount;
      resultData[2] = bucketTwoCount;
      resultData[3] = bucketThreeCount;
      return resultData
    };

    // gets the data needed to produce a quarter overview of reminders sent with a weekly breakdown
    getHistogramData = (selectedWeek) => {
      // if user selects the "All" view
      if (selectedWeek === 0) {
        // console.log("at getWeeklyReminderByQuarter")
        const weeks = [];
        for (let i = 1; i <= this.state.numOfWeek; i++)
            weeks.push(i);
        // initialize a new data array to update and return
        var resultData = [['Week', '1st', '2nd', '3rd']];
        // need to call getDailyReminderByWeek with all weeks
        _.map(weeks, (currWeek) => {
          const dailyBreakdown = this.getDailyReminderByWeek(currWeek);
          const oneWeekArray = this.sumDailyToWeek(dailyBreakdown, currWeek);
        //   console.log("oneWeekArray: " + oneWeekArray)
          resultData.push(oneWeekArray) //TODO: make sure this maintains the right structure
        });
        // console.log("HERE: " + resultData)
        return resultData
      }
      // otherwise, show the daily breakdown for a given week
      else {
        return this.getDailyReminderByWeek(selectedWeek)
      }
    };

    //given the index, get the name of day
    getDay = (dayIndex) =>{
        var dayName = '';
        switch(dayIndex)
        {
            case 0:
                dayName = 'Saturday';
                break;
            case 1:
                dayName = 'Sunday';
                break;
            case 2:
                dayName = 'Monday';
                break;
            case 3:
                dayName = 'Tuesday';
                break;
            case 4:
                dayName = 'Wednesday';
                break;
            case 5:
                dayName = 'Thursday';
                break;
            case 6:
                dayName = 'Friday';
                break;
            default:
                break;
        }
        return dayName  ;
    };

    //given the index, get the name of day
    getRemName = (currBucket) =>{
        var remName = '';
        switch(currBucket)
        {
            case 1:
                remName = '1st';
                break;
            case 2:
                remName = '2nd';
                break;
            case 3:
                remName = '3rd';
                break;
            default:
                break;
        }
        return remName;
    };

    showDetails = () =>{
        return (
            <div>
            <h1>Here are the {this.getRemName(this.state.currBucket)} reminders on {this.getDay(this.state.currIndex)} :</h1>
            <div>{this.getRemindersByChart(this.state.currIndex, this.state.currBucket)}</div>
            </div>
        )
    };

    constructor(props) {
        super(props);
        this.state = {
            jsonData: {},
            isLoaded: false,
            weekDict: {},
            currWeek: 0,
            currIndex: -1,
            currBucket: -1,
            currEndDate: new Date().getTime(),
            startDate: new Date().getTime(),
            endDate: new Date().getTime(),
        };
        this.chartEvents = [
            {
                eventName: 'select',
                callback: ({ chartWrapper }) => {
                    const chart = chartWrapper.getChart();
                    const selection = chart.getSelection();
                    this.setState({
                        ...this.state,
                        currIndex: selection[0].row,
                        currBucket: selection[0].column,
                    })
                }
            },
        ];
    }

    componentDidMount() {
        let name_email = require('../../resources/fake_names_emails.json');
        database.ref('/').once('value').then((snapshot) => {
            // when query finished, call updatejson() to compare and "merge" the current data in database with new json data
            let fetchedJson = snapshot.val();
            let startDate = new Date().getTime();
            let endDate = new Date().getTime();
            if (fetchedJson.hasOwnProperty("authors")) {
                let idx = 0;
                for (let author_id in fetchedJson["authors"]) {
                    let obj = fetchedJson["authors"][author_id];
                    obj["name"] = name_email["people"][idx]["name"];
                    obj["email"] = name_email["people"][idx]["email"];
                    idx = idx + 1
                }
            }
            if (fetchedJson.hasOwnProperty("settings")) {
                if (fetchedJson["settings"].hasOwnProperty("time")) {
                    startDate = new Date(fetchedJson["settings"]["time"]["start"]).getTime();
                    endDate = new Date(fetchedJson["settings"]["time"]["end"]).getTime();
                }
            }
            console.log(startDate);
            const weekDict = this.generateWeekDict(startDate, endDate);
            //console.log(weekDict);

            let lastWeek = 0;
            let numOfWeek = 0;
            console.log(weekDict)
            _.forEach(weekDict, (content, weekNumStr) => {
                numOfWeek++;
                if (parseInt(weekNumStr) > lastWeek) {
                    lastWeek = parseInt(weekNumStr);
                }
            });

            this.setState({
                ...this.state,
                jsonData: fetchedJson,
                reminders: fetchedJson.reminders,
                isLoaded: true,
                startDate: startDate,
                endDate: endDate,
                weekDict: weekDict,
                currEndDate: endDate,
                lastWeek: lastWeek,
                numOfWeek: numOfWeek
            });

            // for testing
            this.getEmailsToSend(fetchedJson, new Date('October 24, 2018 08:00:00').getTime());
        });
    }

    handleWeekChange = event => {
        //console.log(this.state.weekDict[event.target.value]);
        let currEndDate = 0;
        if (event.target.value === 0) {
            currEndDate = this.state.endDate;
        } else {
            currEndDate = this.state.weekDict[event.target.value]["endDate"];
        }
        // console.log(currEndDate);
        this.setState({
            ...this.state,
            currWeek: event.target.value,
            currEndDate: currEndDate,
            currIndex: -1,
            currBucket: -1,
        });
    };

    render() {
        const {currWeek} = this.state;
        return (
            <div className="Main">
                <StyledHeader currWeek={this.state.currWeek} numOfWeek={this.state.numOfWeek} jsonData={this.state.jsonData} handleWeekChange={this.handleWeekChange.bind(this)} />

                <h1>Student Summaries</h1>
                {this.state.isLoaded ? <SubmitReminderTable startDate={this.state.startDate} endDate={this.state.currEndDate} userData={this.state.jsonData["authors"]} /> : null}
                <br/><br/><br/><br/><br/>
                <h1>Summary of Reminders Sent by Buckets</h1>
                {this.state.isLoaded ? <Chart className="Chart"
                                              width={'=800px'}
                                              height={'400px'}
                                              chartType="Bar"
                                              loader={<div>Loading Chart</div>}
                                              data={this.getHistogramData(currWeek)}
                                              chartEvents={this.chartEvents}
                                              align="center"
                                              rootProps={{'data-testid': '2'}}
                /> : null}


                <div className="bucket">
                    {/* commented out because of week index starting at week 0 for the "week all" view for the histogram. causes errors. but we can bring this back if Riesbeck wants */}
                    <div>{(this.state.isLoaded && (this.state.currWeek !==  0  && this.state.currWeek !== 1)) ? this.showDetails(): null}</div>
                </div>
                <br/><br/><br/><br/><br/>
            </div>
        );
    }

}

export const StyledMainPage = withStyles(styles)(MainPage);
