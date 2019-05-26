import React, {Component} from 'react';
import './styles.css';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import * as _ from "lodash";
import {SubmitReminderChart} from "../SubmitReminderChart";
import {startDate, endDate} from '../../pages/MainPage/MainPage';


class SubmitReminderTable extends Component {
    constructor(props) {
        super(props);
        const authors = this.props.userData;
        const data = [];
        
        _.forEach(authors, (details, authorID) => {
            var sev = 0;
            _.forEach(details.reminders, (reminders, time) => {
                var bucket_sum = 0;
                _.map(reminders, (rem) => {
                    bucket_sum += parseInt(rem[rem.length -1]);
                });
                sev += bucket_sum * Math.pow(0.9, (endDate - time - 3600000) / 86400000);
            });
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
                    width: Math.round(window.innerWidth * 0.15),
                    Header: 'Name',
                    accessor: 'name',
                    // Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
                }, {
                    width: Math.round(window.innerWidth * 0.15),
                    Header: 'Email',
                    accessor: 'email',
                    // Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
                },
                {
                    width: Math.round(window.innerWidth * 0.05),
                    Header: 'Severity',
                    accessor: 'severity',
                    // Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
                }]
            }, {
                Header: 'Submission & Reminder Chart',
                columns: [
                    {
                        width: Math.round(window.innerWidth * 0.65),
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