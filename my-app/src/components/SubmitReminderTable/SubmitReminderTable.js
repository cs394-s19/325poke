import React, {Component} from 'react';
import './styles.css';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import * as _ from "lodash";
import {SubmitReminderChart} from "../SubmitReminderChart";


class SubmitReminderTable extends Component {
    constructor(props) {
        super(props);
        const authors = this.props.userData;
        //console.log(authors);
        const data = [];
        _.forEach(authors, (details, authorID) => {
            let tmpObj = {
                name: details.name,
                email: details.email,
                authorID: authorID
            };
            data.push(tmpObj);
        });
        this.data = data;

        console.log(data);

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
                }]
            }, {
                Header: 'Submission & Reminder Chart',
                columns: [
                    {
                        width: Math.round(window.innerWidth * 0.7),
                        Header: 'Chart',
                        accessor: 'authorID',
                        Cell: row => (
                            <div>
                                <SubmitReminderChart userData={authors[row.value]}/>
                            </div>
                        )
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
    SubmitReminderTable
}