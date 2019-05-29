import React, { Component } from 'react';
import './styles.css';
import ReactTable from 'react-table';
import 'react-table/react-table.css'


class ReminderTable extends Component {
    render() {
        const data = [{
            name: "Tanner Linsley",
            most_severe_reminder: 2,
            most_recent_reminder: 2,
            reminder1: 2,
            reminder2: 1,
            reminder3: 1,
        },
        {
            name: "Narendra Nunn",
            most_severe_reminder: 1,
            most_recent_reminder: 1,
            reminder1: 1,
            reminder2: 0,
            reminder3: 0,
        },
        {
            name: "Lexie Hanscom",
            most_severe_reminder: 3,
            most_recent_reminder: 1,
            reminder1: 3,
            reminder2: 2,
            reminder3: 1,
        },
        {
            name: "Delores Yardley",
            most_severe_reminder: 1,
            most_recent_reminder: 1,
            reminder1: 2,
            reminder2: 1,
            reminder3: 1,
        },
        {
            name: "Tai Doran",
            most_severe_reminder: 2,
            most_recent_reminder: 1,
            reminder1: 2,
            reminder2: 1,
            reminder3: 0,
        },
        {
            name: "Iain Mulhern",
            most_severe_reminder: 3,
            most_recent_reminder: 3,
            reminder1: 3,
            reminder2: 2,
            reminder3: 1,
        }
        ];

        const columns = [{
            Header: 'Name',
            accessor: 'name' // String-based value accessors!
        }, {
            Header: 'This Week\'s Reminder',
            columns: [{
                Header: 'Most Severe Reminder',
                accessor: 'most_severe_reminder',
                // Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
            }, {
                Header: 'Most Recent Reminder',
                accessor: 'most_recent_reminder',
                // Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
            }]
        }, {
            Header: 'Cumulative Reminder Counts',
            columns: [{
                Header: '1st Reminder',
                accessor: 'reminder1'
            }, {
                Header: '2nd Reminder',
                accessor: 'reminder2'
            }, {
                Header: '3rd Reminder',
                accessor: 'reminder3'
            }]
        }];

        return (
            <div className="ReminderTable">
            <br/>
                <ReactTable
                    data={data}
                    columns={columns}
                    defaultPageSize={10}
                    className="-striped -highlight"
                    noDataText="Oh Noes!"
                    defaultSorted={[
                        {
                            id: "reminder3",
                            desc: true
                        },
                        {
                            id: "reminder2",
                            desc: true
                        },
                        {
                            id: "reminder1",
                            desc: true
                        },
                    ]}
                />
            </div>
        );
    }

}

export {
    ReminderTable
}