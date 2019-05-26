import React, {Component} from 'react';
import _ from 'lodash';
import {Button, List, ListItem, ListItemText, AppBar, Toolbar, Typography, IconButton} from '@material-ui/core';
import {Link} from 'react-router-dom';
import './styles.css';
import database from '../../firebase'
import Chart from 'react-google-charts';
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import withStyles from "@material-ui/core/styles/withStyles";

import {
  ReminderTable, 
  SubmitReminderChart, 
  SubmitReminderTable,
  SummaryHistogram
} from '../../components';
//you should install react-google-charts through command "yarn add react-google-charts" or "npm i react-google-charts"

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
    }
}

const numDays = 4;
const firstRemDays = 4;
const secondRemDays = 7;
const thirdRemDays = 10;

// class start date = Thursday, September 27th
const startDate = new Date('September 27, 2018 08:00:00').getTime()
const endDate = new Date('December 14, 2018 08:00:00').getTime()
// first reporting date = Friday, September 28th, 8am
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
const dateArray = [startDate, date1, date2, date3, date4, date5, date6, date7, date8, date9, date10, date11, date12];
// make list of every friday from date1 to end of quarter
const times = [date1, date2, date3, date4, date5, date6, date7, date8, date9, date10, date11, date12];


class MainPage extends Component {
    // generated week dict using the date array we have
    generateWeekDict(dateArray) {
        let res = {};
        for (let i = 1; i < dateArray.length; i++) {
            res[i] = {
                "startDate": dateArray[i - 1],
                "endDate": dateArray[i]
            }
        }
        return res;
    }

    // given a base date, returns an array of author ids to which we need to send reminders
    getAnyReminders = (currentTime) => {
        // return an array with author ids
        const submissionData = this.state.jsonData;
        const slackers = [];
        let authorId;
        for (authorId in submissionData.authors) {
            const lastSubTime = this.mostRecentSubTime(submissionData.authors[authorId], currentTime);
            const timeDiff = currentTime - lastSubTime;
            if (timeDiff > numDays * 86400000) {
                slackers.push([authorId, timeDiff, submissionData.authors[authorId].name, submissionData.authors[authorId].email]);
            }
        }
        return slackers;
    }

    // function to ensure we only look at the previous submissions given a current time
    // kind of like a snapshot of the students' progress at the current time
    // ensures we ignore the future submissions since we have that data already
    forgetFutureSubmissions = (submissionTime, currentTime) => {
        if (submissionTime > currentTime) {
            return startDate; // to calculate number of days without work at beginning of quarter
        } else {
            return submissionTime;
        }
    }
    mostRecentSubTime = (author, currentTime) => {
        return _.max(_.values(_.mapValues(author.exercises, (o => this.forgetFutureSubmissions(o.submitted, currentTime)))));
    }

    populateWeeklyList = () => {
        return _.map(times, (weeklyDeadline, index) => {
            const newDate = new Date(weeklyDeadline)
            const month = newDate.getMonth() + 1
            const date = newDate.getDate()
            const year = newDate.getFullYear()
            return (
                <div key={index}>
                    <h2>Week {index + 1}: ending Friday, {month}/{date}/{year}</h2>
                    <List style={{"maxWidth": 600, "margin": "auto"}}>{this.populateListofSlackers(times[index])}</List>
                </div>
            )
        })
    }

    populateSpecificWeekList = (week) => {
        const endData = new Date(this.state.weekDict[week].endDate)
        const month = endData.getMonth() + 1
        const date = endData.getDate()
        const year = endData.getFullYear()

        return (
            <div key={week}>
                <h2>Week {week}: ending Friday, {month}/{date}/{year}</h2>
                <List style={{"maxWidth": 600, "margin": "auto"}}>{this.populateListofSlackers(dateArray[week])}</List>
            </div>
        )
    }

    // populate reminders
    getWeeklyReminders = (startTime, endTime) => {
        const weeklyReminders = _.filter(this.state.reminders, (timeStamp, index) => { //TODO: rename
            if (index >= startTime && index <= endTime) {
                return true
            } else {
                return false
            }
        })
        // console.log(weeklyReminders)
        // return weeklyReminders
        return this.displayWeeklyReminders(weeklyReminders)
    }

    // based on getWeeklyReminders()
    getRemindersByChart(index, bucket) {
        const startTime = this.state.weekDict[this.state.currWeek].startDate + 1;
        const endTime = this.state.weekDict[this.state.currWeek].endDate;
        const weeklyReminders = _.filter(this.state.reminders, (timeStamp, index) => { //TODO: rename
            if (index >= startTime && index <= endTime) {
                return true
            } else {
                return false
            }
        })
        // console.log([weeklyReminders[index - 1]]);
        // return weeklyReminders
        return this.displaySpecificReminders([weeklyReminders[index]["rem" + bucket]]);
    }

    displaySpecificReminders = (reminders) => {
        // console.log(reminders);
        return (
            <div>
                {_.map(reminders, (listofAuthors, bucket) => {
                    return (
                        <div>
                            <p>{_.map(listofAuthors, (authorId, randomKey) => {
                                return (
                                    <div>
                                    <p>reminder sent to {this.state.jsonData.authors[authorId].name} ({this.state.jsonData.authors[authorId].email})</p>
                                    <Button id="show" component={Link} to={{
                                        pathname: "details",
                                        exercises: this.state.jsonData.authors[authorId].exercises,
                                        student_id: authorId,
                                        student_name: this.state.jsonData.authors[authorId].name,
                                    }} label="Show Details" variant="contained" color="primary">
                                        Show Details
                                    </Button>
                                    </div>
                                )
                            })}</p>
                        </div>
                    )
                })}
            </div>
        )
    }

    listWeeklyReminders = (startTime, endTime) => {
        const weeklyReminders = _.pickBy(this.state.reminders, (timeStamp, index) => { //TODO: rename
            if (index >= startTime && index <= endTime) {
                return true
            } else {
                return false
            }
        })
        // console.log("look here: " + Object.keys(weeklyReminders))
        return weeklyReminders
    }
    // get daily reminders for histogram
    getDailyReminder = () => {
        const weeklyReminders = this.listWeeklyReminders(1540184400000, 1540789200000)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var resultData = [['Day', '1st', '2nd', '3rd']]
        _.map(weeklyReminders, (oneDayRem, timeStamp) => {
            var oneDayData = ["", 0, 0, 0]
            var dayIndex = new Date(Number(timeStamp)).getDay()
            oneDayData[0] = (days[dayIndex])
            _.map(oneDayRem, (authors, bucket) => {
                // console.log("bucket: " + authors)
                if (bucket == 'rem1') {
                    oneDayData[1] = authors.length
                } else if (bucket == 'rem2') {
                    oneDayData[2] = authors.length
                } else if (bucket == 'rem3') {
                    oneDayData[3] = authors.length
                }
            })
            resultData.push(oneDayData)
        })
        // console.log("result: " + resultData)
        return resultData
    }

    // for histogram
    getDailyReminderByWeek = (week) => {
        const weeklyReminders = this.listWeeklyReminders(this.state.weekDict[week].startDate + 1, this.state.weekDict[week].endDate)
        // console.log("these are the weekly reminders: " + Object.values(weeklyReminders));
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var resultData = [['Day', '1st', '2nd', '3rd']]
        _.map(weeklyReminders, (oneDayRem, timeStamp) => {
            var oneDayData = ["", 0, 0, 0]
            var dayIndex = new Date(Number(timeStamp)).getDay()
            oneDayData[0] = (days[dayIndex])
            _.map(oneDayRem, (authors, bucket) => {
                if (bucket == 'rem1') {
                    oneDayData[1] = authors.length
                } else if (bucket == 'rem2') {
                    oneDayData[2] = authors.length
                } else if (bucket == 'rem3') {
                    oneDayData[3] = authors.length
                }
            })
            resultData.push(oneDayData)
        })
        // console.log("result data: " + resultData)
        return resultData
    }

    // given the resultData [['Day', '1st', '2nd', '3rd'], ['Mon', 3, 5, 7], ['Tue', 3, 6, 2], ... [...]]
    // and the week number
    // return an array: ['Week 1', 5, 4, 3]
    sumDailyToWeek = (dailyBreakdownData, currWeek) => {
      // initialize a new data array to update and return
      var resultData = ['Week ' + currWeek, 0, 0, 0]
      // cut off the first item in the array since the first item is an array of axis title and bucket names
      dailyBreakdownData.shift() //.shift() pops the first element off of the array
      // initialize a count of # of reminders in each bucket
      var bucketOneCount = 0
      var bucketTwoCount = 0
      var bucketThreeCount = 0
      // count up reminders over a week
      _.map(dailyBreakdownData, (arr) => {
        bucketOneCount += arr[1]
        bucketTwoCount += arr[2]
        bucketThreeCount += arr[3]
      })
      // update resultData to have the new bucket counts
      resultData[1] = bucketOneCount
      resultData[2] = bucketTwoCount
      resultData[3] = bucketThreeCount
      return resultData
    }

    // gets the data needed to produce a quarter overview of reminders sent with a weekly breakdown
    getHistogramData = (selectedWeek) => {
      // if user selects the "All" view
      if (selectedWeek == 0) {
        // console.log("at getWeeklyReminderByQuarter")
        const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        // initialize a new data array to update and return
        var resultData = [['Week', '1st', '2nd', '3rd']]
        // need to call getDailyReminderByWeek with all weeks
        _.map(weeks, (currWeek) => {
          const dailyBreakdown = this.getDailyReminderByWeek(currWeek)
          const oneWeekArray = this.sumDailyToWeek(dailyBreakdown, currWeek)
        //   console.log("oneWeekArray: " + oneWeekArray)
          resultData.push(oneWeekArray) //TODO: make sure this maintains the right structure
        })
        // console.log("HERE: " + resultData)
        return resultData
      }
      // otherwise, show the daily breakdown for a given week
      else {
        return this.getDailyReminderByWeek(selectedWeek)
      }
    }

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
        }
        return dayName  ;
    }

    //given the index, get the name of day
    getRemName = (currBucket) =>{
        var remName = '';
        switch(currBucket)
        {
            case 1:
                remName = '1st'
                break;
            case 2:
                remName = '2nd'
                break;
            case 3:
                remName = '3rd'
                break;
        }
        return remName;
    }

    showDetails = () =>{
        return (
            <div>
            <h1>Here are the {this.getRemName(this.state.currBucket)} reminders on {this.getDay(this.state.currIndex)} :</h1>
            <div>{this.getRemindersByChart(this.state.currIndex, this.state.currBucket)}</div>
            </div>
        )
    }

    constructor(props) {
        super(props);
        this.state = {
            jsonData: {},
            isLoaded: false,
            weekDict: this.generateWeekDict(dateArray),
            currWeek: 0,
            currIndex: 0,
            currBucket: 1,
        }
        this.chartEvents = [
            {
                eventName: 'select',
                callback: ({ chartWrapper }) => {
                    const chart = chartWrapper.getChart()
                    const selection = chart.getSelection()
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
            if (fetchedJson.hasOwnProperty("authors")) {
                let idx = 0

                for (var author_id in fetchedJson["authors"]) {
                    var obj = fetchedJson["authors"][author_id];
                    obj["name"] = name_email["people"][idx]["name"];
                    obj["email"] = name_email["people"][idx]["email"];
                    idx = idx + 1
                }
            }
            this.setState({
                ...this.state,
                jsonData: fetchedJson,
                reminders: fetchedJson.reminders,
                isLoaded: true,
            });

            // console.log(this.state.weekDict);
            //
            // The code below is now moved to firebase.js(for test) and functions/index.js (real use)
            //
            // generate and push reminders
            // fetchedJson['reminders'] = this.generateRemindersForQuarter(startDate, endDate);
            // console.log(fetchedJson);
            // database.ref('/').update(Object.values(fetchedJson));
        });
    }

    handleWeekChange = event => {
        this.setState({currWeek: event.target.value});
    };

    render() {
        const {classes} = this.props;
        const {currWeek, weekDict} = this.state;
        return (
            <div className="Main">
                <AppBar position="static">
                    <Toolbar>
                        <span>Week</span> &nbsp;
                        <form autoComplete="off">
                            <FormControl>
                                <Select
                                    style={{color: 'white'}}
                                    disableUnderline={true}
                                    value={this.state.currWeek}
                                    onChange={this.handleWeekChange}
                                    inputProps={{
                                        id: 'week-selector',
                                        classes: {
                                            icon: classes.arrowColor,
                                        }
                                    }}
                                >
                                    <MenuItem value={0}>All</MenuItem>
                                    <MenuItem value={1}>1</MenuItem>
                                    <MenuItem value={2}>2</MenuItem>
                                    <MenuItem value={3}>3</MenuItem>
                                    <MenuItem value={4}>4</MenuItem>
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={6}>6</MenuItem>
                                    <MenuItem value={7}>7</MenuItem>
                                    <MenuItem value={8}>8</MenuItem>
                                    <MenuItem value={9}>9</MenuItem>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={11}>11</MenuItem>
                                    <MenuItem value={12}>12</MenuItem>
                                </Select>
                            </FormControl>
                        </form>
                    </Toolbar>
                </AppBar>
                <h1>Summary of Reminders Sent by Buckets</h1>
                {/* <SummaryHistogram 
                  week={currWeek}
                  data={this.getHistogramData(currWeek)}
                /> */}
                <Chart className="Chart"
                       width={'=800px'}
                       height={'400px'}
                       chartType="Bar"
                       loader={<div>Loading Chart</div>}
                       data={this.getHistogramData(currWeek)}
                       chartEvents={this.chartEvents}
                       align="center"
                    //    options={{
                    //        // Material design options
                    //        chart: {
                    //            title: 'Number of reminders',
                    //            subtitle: 'Week ' + currWeek,
                    //        },
                    //    }}

                    // For tests
                       rootProps={{'data-testid': '2'}}
                />

                <div className="bucket">
                    {/* commented out because of week index starting at week 0 for the "week all" view for the histogram. causes errors. but we can bring this back if Riesbeck wants */}
                    <div>{(this.state.isLoaded && (this.state.currWeek !=  0  && this.state.currWeek != 1)) ? this.showDetails(): null}</div>
                </div>

                <br/><br/><br/><br/><br/>
                <h1>Student Summaries</h1>
                {this.state.isLoaded ? <SubmitReminderTable userData={this.state.jsonData["authors"]} /> : null}

                {/* <div className="reminderDetails">
                    <div className="fourday">
                        <h1>
                            The 4-day reminders:
                        </h1>
                        {this.state.isLoaded ? this.populateSpecificWeekList(currWeek) : null}
                    </div>
                    <div className="twoweek">
                        <h1>
                            The 2-week reminders:
                        </h1>
                    </div>
                </div> */}
            </div>
        );
    }

    // getReminderBuckets = (currentTime) => {
    //     // return an object with 3 lists of author ids corresponding to sent reminders
    //     const submissionData = this.state.jsonData;
    //     const newReminders = {"rem1": [], "rem2": [], "rem3": [], "sentTime": currentTime};
    //     let authorId;
    //     for (authorId in submissionData.authors) {
    //         const lastSubTime = this.mostRecentSubTime(submissionData.authors[authorId], currentTime);
    //         const timeDiff = currentTime - lastSubTime;
    //         if (timeDiff >= firstRemDays * 86400000 && timeDiff < (firstRemDays + 1) * 86400000) {
    //             newReminders.rem1.push(authorId);
    //         } else if (timeDiff >= secondRemDays * 86400000 && timeDiff < (secondRemDays + 1) * 86400000) {
    //             newReminders.rem2.push(authorId);
    //         } else if (timeDiff >= thirdRemDays * 86400000 && timeDiff < (thirdRemDays + 1) * 86400000) {
    //             newReminders.rem3.push(authorId);
    //         }
    //     }
    //     return newReminders;
    // }
    //
    // generateRemindersForQuarter = (startDateTime, endDateTime) => {
    //     const buckets = _.map(_.range(startDateTime, endDateTime + 1, 86400000), this.getReminderBuckets);
    //     return _.mapValues(_.keyBy(buckets, o => o.sentTime), v => _.omit(v, 'sentTime'));
    // }
    // displayWeeklyReminders = (weeklyReminders) => {
    //     console.log(weeklyReminders);
    //     return _.map(weeklyReminders, (reminder, index) => {
    //         return (
    //             <div>
    //                 {_.map(reminder, (listofAuthors, bucket) => {
    //                     return (
    //                         <div>
    //                             <p>{bucket}</p>
    //                             <p>{_.map(listofAuthors, (authorId, randomKey) => {
    //                                 return (
    //                                     <p>reminder sent to {authorId}</p>
    //                                 )
    //                             })}</p>
    //                         </div>
    //                     )
    //                 })}
    //             </div>
    //         )
    //     })
    // }

    // populateListofSlackers = (currentTime) => {
    //     const slackers = this.getAnyReminders(currentTime);
    //     return _.map(slackers, (slacker, index) => {
    //         return (
    //             <ListItem key={index}>
    //                 <ListItemText
    //                     primary={slacker[2] + " (" + slacker[3] + ")"}
    //                     secondary={"No submissions for " + Math.floor(slacker[1] / 86400000) + " days"}
    //                 />
    //                 <Button id="show" component={Link} to={{
    //                     pathname: "details",
    //                     exercises: this.state.jsonData.authors[slacker[0]].exercises,
    //                     student_id: slacker[0],
    //                     student_name: slacker[2],
    //                     currentTime: currentTime
    //                 }}
    //                         label="Show Details" variant="contained" color="primary">
    //                     Show Details
    //                 </Button>
    //             </ListItem>
    //         )
    //     });
    // }

}

export const StyledMainPage = withStyles(styles)(MainPage)
export {startDate, endDate}