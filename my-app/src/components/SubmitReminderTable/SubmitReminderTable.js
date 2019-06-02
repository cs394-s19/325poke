import React, {Component} from 'react';
import './styles.css';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import * as _ from "lodash";
import {SubmitReminderChart} from "../SubmitReminderChart";
import {endDate, startDate} from '../../pages/MainPage/MainPage';
const timeOffset = 8 * 3600 * 1000;

class SubmitReminderTable extends Component {
    generateDayList(startDate, endDate) {
        let dayList = [];
        for (let i = startDate; i <= endDate; i+=86400000) {
            dayList.push(i);
        }
        return dayList;
    }

    mapTimestampToDate(timestamp, dayList) {
        for (let i = 1; i < dayList.length; i++) {
            if (timestamp < dayList[i] - timeOffset && timestamp > dayList[i - 1] - timeOffset) {
                return dayList[i - 1];
            }
        }
        return -1;
    }
    
    getData() {
        const authors = this.props.userData;
        const data = [];
        let maxSubmissionPerDay = 1;
        const dayList = this.generateDayList(startDate, endDate);

        // for each student, create on object (tmpObj) that has name, email, authorID, and severity and add to a list (data[])
        _.forEach(authors, (details, authorID) => {
            let firstSubmissionList = [];
            let reSubmissionList = [];
            _.forEach(details.exercises, (detail, exid) => {
                _.forEach(detail.submit_hist, (hist, index) => {
                    let tempDate = this.mapTimestampToDate(hist.submitted, dayList);
                    let dayIndex = dayList.indexOf(tempDate);
                    if (index === 0) {
                        if (firstSubmissionList[dayIndex] !== undefined) {
                            firstSubmissionList[dayIndex] = firstSubmissionList[dayIndex] + 1;
                            if (firstSubmissionList[dayIndex] + reSubmissionList[dayIndex] > maxSubmissionPerDay) {
                                //console.log(authorID + "  " + firstSubmissionList[dayIndex] + "  " + reSubmissionList[dayIndex] + "  " + dayIndex);
                                maxSubmissionPerDay = firstSubmissionList[dayIndex] + reSubmissionList[dayIndex];
                            }
                        } else {
                            firstSubmissionList[dayIndex] = 1;
                        }
                        return;
                    }
                    if (reSubmissionList[dayIndex] !== undefined) {
                        reSubmissionList[dayIndex] = reSubmissionList[dayIndex] + 1;
                        if (firstSubmissionList[dayIndex] + reSubmissionList[dayIndex] > maxSubmissionPerDay) {
                            //console.log(authorID + "  " + firstSubmissionList[dayIndex] + "  " + reSubmissionList[dayIndex] + "  " + dayIndex);
                            maxSubmissionPerDay = firstSubmissionList[dayIndex] + reSubmissionList[dayIndex];
                        }
                    } else {
                        reSubmissionList[dayIndex] = 1;
                    }
                });
            });

            var sev = this.calculateSeverity(details);

            let tmpObj = {
                name: details.name,
                email: details.email,
                authorID: authorID,
                severity: sev
            };

            data.push(tmpObj);
        });

        this.data = data;

        _.forEach(authors, (details, authorID) => {
            authors[authorID]['maxY'] = maxSubmissionPerDay
        })
    }

    // Input: an object (student) with email, exercises, maxY, name, reminders, and submissions
    // Output: severity score for the given student
    calculateSeverity(details) {
        // build a submission & reminder severity array
        let srArray = [];
        let subIndex = 0;
        _.forEach(details.reminders, (remType, timestamp) => {
            for (; subIndex < details.submissions.length; subIndex++) {
                if (details.submissions[subIndex].submitted < timestamp) {
                    let tmp = {};
                    tmp[details.submissions[subIndex].submitted] = "submission";
                    srArray.push(tmp);
                } else
                    break;
            }
            let tmp = {};
            if (remType.indexOf("rem1") !== -1)
                tmp[timestamp] = "rem1";
            else if (remType.indexOf("rem2") !== -1)
                tmp[timestamp] = "rem2";
            else if (remType.indexOf("rem3") !== -1)
                tmp[timestamp] = "rem3";
            srArray.push(tmp);
        });
        if (subIndex < details.submissions.length) {
            for (; subIndex < details.submissions.length; subIndex++) {
                let tmp = {};
                tmp[details.submissions[subIndex].submitted] = "submission";
                srArray.push(tmp);
            }
        }

        let sev = 0;
        let rem1Coefficient = 1.0;
        let rem2Coefficient = 2.0;
        let rem3Coefficient = 3.0;
        let currCoefficient = rem1Coefficient;
        let lastRemTimestamp = 0;
        for (let i = 0; i < srArray.length; i++) {
            let timestamp = Object.keys(srArray[i])[0];
            if (srArray[i][timestamp] === "rem1"
                || srArray[i][timestamp] === "rem2"
                || srArray[i][timestamp] === "rem3") {
                lastRemTimestamp = timestamp;
                let j = i;
                while (j < srArray.length - 1) {
                    j++;
                    let timestampj = Object.keys(srArray[j])[0];
                    sev += currCoefficient * (timestampj - timestamp);
                    if (srArray[j][timestampj] === "rem1") {
                        lastRemTimestamp = timestampj;
                        currCoefficient = rem1Coefficient;
                    } else if (srArray[j][timestampj] === "rem2") {
                        lastRemTimestamp = timestampj;
                        currCoefficient = rem2Coefficient;
                    } else if (srArray[j][timestampj] === "rem3") {
                        lastRemTimestamp = timestampj;
                        currCoefficient = rem3Coefficient;
                    } else if (srArray[j][timestampj] === "submission") {
                        currCoefficient = rem1Coefficient;
                        sev *= 0.95;
                        break;
                    }
                }
                i = j;
            } else {
                sev *= 0.95;
            }
        }
        if (currCoefficient !== rem1Coefficient)
            sev += currCoefficient * (endDate - lastRemTimestamp);

        sev /= 1000000000;
        return parseFloat(sev.toFixed(3));
    }

    componentWillMount() {
        this.getData();
        this.columns = [
            {
                Header: 'Student Info',
                columns: [{
                    width: Math.round(window.innerWidth * 0.13),
                    Header: 'Name',
                    accessor: 'name',
                    // Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
                }, {
                    width: Math.round(window.innerWidth * 0.12),
                    Header: 'Email',
                    accessor: 'email',
                    // Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
                },
                    {
                        width: Math.round(window.innerWidth * 0.10),
                        Header: 'Severity',
                        accessor: 'severity',
                        // Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
                    }]
            }, {
                Header: 'Submission & Reminder Chart',
                columns: [
                    {
                        width: Math.round(window.innerWidth * 0.64),
                        Header: 'Chart',
                        accessor: 'authorID',
                        Cell: row => (
                            <div>
                                <SubmitReminderChart userData={this.props.userData[row.value]}/>
                            </div>
                        ),

                    }
                ]
            }];
    }

    
    render() {
        return (
            <div className="ReminderTable">
                <br/>
                <ReactTable
                    data={this.data}
                    columns={this.columns}
                    defaultPageSize={25}
                    className="-striped -highlight"
                    noDataText="No rows found"
                    pageSizeOptions= {[25, 50, 75, 100]}
                    defaultSorted={[
                        {
                            id: "severity",
                            desc: true
                        }
                    ]}

                />
            </div>
        );
    };

}

export {
    SubmitReminderTable
}