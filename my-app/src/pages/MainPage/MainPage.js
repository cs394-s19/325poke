import React, {Component} from 'react';
import _ from 'lodash';
import {Button, List, ListItem, ListItemText, AppBar, Toolbar, Typography, IconButton} from '@material-ui/core';
import {Link} from 'react-router-dom';
import './styles.css';
import database from '../../firebase'
import Chart from 'react-google-charts';
import ReactTable from 'react-table'
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import withStyles from "@material-ui/core/styles/withStyles";

import {ReminderTable} from '../../components';
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
        //console.log("slackers: " + slackers);
        return slackers;
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
                <ListItem key={index}>
                    <ListItemText
                        primary={slacker[2] + " (" + slacker[3] + ")"}
                        secondary={"No submissions for " + Math.floor(slacker[1] / 86400000) + " days"}
                    />
                    {/* A reminder should be sent to student <b><i>{slacker[2]}</i></b> (<i>{slacker[3]}</i>), because nothing has been submitted anything
                    for {Math.floor(slacker[1] / 86400000)} days.&nbsp;&nbsp;&nbsp; */}
                    <Button id="show" component={Link} to={{
                        pathname: "details",
                        exercises: this.state.jsonData.authors[slacker[0]].exercises,
                        student_id: slacker[0],
                        student_name: slacker[2],
                        currentTime: currentTime
                    }}
                            label="Show Details" variant="contained" color="primary">
                        Show Details
                    </Button>
                </ListItem>
            )
        });
    }

    populateWeeklyList = () => {
        //console.log(this.state.jsonData.authors["1769"].exercises);
        return _.map(times, (weeklyDeadline, index) => {
            // console.log(index);
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
        console.log(weeklyReminders)
        // return weeklyReminders
        return this.displayWeeklyReminders(weeklyReminders)
    }

    // based on getWeeklyReminders()
    getRemindersByChart(index, bucket) {
        const startTime = this.state.weekDict[this.state.currWeek].startDate;
        const endTime = this.state.weekDict[this.state.currWeek].endDate;
        const weeklyReminders = _.filter(this.state.reminders, (timeStamp, index) => { //TODO: rename
            if (index >= startTime && index <= endTime) {
                return true
            } else {
                return false
            }
        })
        console.log([weeklyReminders[index - 1]]);
        // return weeklyReminders
        return this.displaySpecificReminders([weeklyReminders[index]["rem" + bucket]]);
    }


    displayWeeklyReminders = (weeklyReminders) => {
        // return _.map(weeklyReminders, (reminder, index) => {
        //   _.map(reminder, (listofAuthors, bucket) => {
        //     return (<p>{bucket}</p>)
        //   })
        console.log(weeklyReminders);
        return _.map(weeklyReminders, (reminder, index) => {
            return (
                <div>
                    {/*<p>index: {index}</p>*/}
                    {_.map(reminder, (listofAuthors, bucket) => {
                        return (
                            <div>
                                <p>{bucket}</p>
                                <p>{_.map(listofAuthors, (authorId, randomKey) => {
                                    return (
                                        <p>reminder sent to {authorId}</p>
                                    )
                                })}</p>
                            </div>
                        )
                    })}
                </div>
            )
        })
    }

    displaySpecificReminders = (reminders) => {
        console.log(reminders);
        return (
            <div>
                {_.map(reminders, (listofAuthors, bucket) => {
                    return (
                        <div>
                            <p>{_.map(listofAuthors, (authorId, randomKey) => {
                                return (
                                    <p>reminder sent to {authorId}</p>
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
        console.log("listweeklyreminders timestamp: " + Object.keys(weeklyReminders))
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
        console.log("result: " + resultData)
        return resultData
    }

    getDailyReminderByWeek = (week) => {
        const weeklyReminders = this.listWeeklyReminders(this.state.weekDict[week].startDate, this.state.weekDict[week].endDate)
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
        return resultData
    }

    constructor(props) {
        super(props);
        this.state = {
            jsonData: {},
            isLoaded: false,
            weekDict: this.generateWeekDict(dateArray),
            currWeek: 5,
            currIndex: 1,
            currBucket: 1,
        }
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

            console.log(this.state.weekDict);
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
        // Use these lines to see firebase data
        // database.ref('/').once('value').then((snapshot) => {
        //     console.log(snapshot.val());
        // });
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
            }
        ];
        const {classes} = this.props;
        const {currWeek, weekDict} = this.state;
        return (
            <div className="Main">
                <AppBar position="static">
                    <Toolbar>
                        <span>Week</span> &nbsp;
                        <form autoComplete="off">
                            <FormControl>
                                {/*<InputLabel shrink htmlFor='week-selector' style={{color: 'white'}}>*/}
                                {/*Week*/}
                                {/*</InputLabel>*/}
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
                <ReminderTable/>
                <br/><br/><br/>
                <Chart className="Chart"
                       width={'500px'}
                       height={'300px'}
                       chartType="Bar"
                       loader={<div>Loading Chart</div>}
                       data={this.getDailyReminderByWeek(currWeek)}
                       chartEvents={this.chartEvents}
                       options={{
                           // Material design options
                           chart: {
                               title: 'Number of reminders',
                               subtitle: 'Week ' + currWeek,
                           },
                       }}
                    // For tests
                       rootProps={{'data-testid': '2'}}
                />

                <div className="bucket">
                    <h1>Here are the reminders for this week:</h1>
                    {/*<div>{this.getWeeklyReminders(weekDict[currWeek].startDate, weekDict[currWeek].endDate)}</div>*/}
                    <div>{this.state.isLoaded ? this.getRemindersByChart(this.state.currIndex, this.state.currBucket) : null}</div>
                </div>
                <div className="reminderDetails">
                    <div className="fourday">
                        <h1>
                            The 4-day reminders:
                        </h1>
                        {this.state.isLoaded ? this.populateSpecificWeekList(currWeek) : null}
                        {/* <h3>Week 11: Starting December 7, 2018</h3>
                        {populateListofSlackers(times[10])} */}
                    </div>
                    <div className="twoweek">
                        <h1>
                            The 2-week reminders:
                        </h1>
                    </div>
                </div>
            </div>
        );
    }

}

export const StyledMainPage = withStyles(styles)(MainPage)