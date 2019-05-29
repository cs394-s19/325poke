import React, {Component} from 'react';
import './styles.css';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import * as _ from "lodash";
import {SubmitReminderChart} from "../SubmitReminderChart";
import {endDate} from '../../pages/MainPage/MainPage';


class SubmitReminderTable extends Component {
    constructor(props) {
        super(props);
        const authors = this.props.userData;
        const data = [];

        //console.log(authors);

        _.forEach(authors, (details, authorID) => {
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

            let sev = this.calculateSeverity(srArray);
            // _.forEach(details.reminders, (reminders, time) => {
            //     var bucket_sum = 0;
            //     _.map(reminders, (rem) => {
            //         bucket_sum += parseInt(rem[rem.length - 1]);
            //     });
            //     sev += bucket_sum * Math.pow(0.9, (endDate - time - 3600000) / 86400000);
            // });
            let tmpObj = {
                name: details.name,
                email: details.email,
                authorID: authorID,
                severity: sev
            };
            data.push(tmpObj);
        });
        this.data = data;

        // console.log(data);

        this.columns = [
            {
                Header: 'Student Info',
                columns: [{
                    width: Math.round(window.innerWidth * 0.13),
                    Header: 'Name',
                    accessor: 'name',
                    // Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
                }, {
                    width: Math.round(window.innerWidth * 0.16),
                    Header: 'Email',
                    accessor: 'email',
                    // Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
                },
                    {
                        width: Math.round(window.innerWidth * 0.06),
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
                                <SubmitReminderChart userData={authors[row.value]}/>
                            </div>
                        ),

                    }
                ]
            }];


    }

    calculateSeverity(srArray) {
        let sev = 0;
        let rem1Coefficient = 1.0;
        let rem2Coefficient = 2.0;
        let rem3Coefficient = 5.0;
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
                        currCoefficient = 0;
                        break;
                    }
                }
                i = j;
            }
        }
        if (currCoefficient !== 0)
            sev += currCoefficient * (endDate - lastRemTimestamp);

        sev /= 1000000000;
        return sev;
    }

    render() {


        return (
            <div className="ReminderTable">
                <br/>
                <ReactTable
                    data={this.data}
                    columns={this.columns}
                    defaultPageSize={10}
                    className="-striped -highlight"
                    noDataText="Oh Noes!"
                    defaultSorted={[
                        {
                            id: "severity",
                            desc: true
                        }
                    ]}

                />
            </div>
        );
    }

}

export {
    SubmitReminderTable
}