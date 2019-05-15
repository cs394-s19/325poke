import React, { Component } from 'react';
import _ from 'lodash';
import './styles.css';

export class Details extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exercises: this.props.location.exercises, 
            student_id: this.props.location.student_id,
            student_name: this.props.location.student_name
        };
    };

    toTime = (timestamp) => {
        var date = new Date(timestamp);
        var time = date.getFullYear() + '-' + (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-' + date.getDate() + ' '+ date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(); 
        return time;
    }

    populateSubHistory = () => {
      return _.map(this.state.exercises, (exercise, index) => {
          if (index === 'ignoreme')
              return;
        return (
          <div className="details" key={index}>
            <h1>Exercise {index}</h1> 
            {/* Status: <b>{exercise.status}</b> Last Submitted Time: <b>{this.toTime(exercise.submitted)}</b>
            <br/>
            <br/> */}
            <div className="table">
              <table className="details">
                <tbody>
                {_.map(exercise.submit_hist, (submission, index) => {
                  return (
                  <tr key={index}>
                    <td>{exercise.submit_hist.length === (index + 1) ? <b>{submission.status}</b> : submission.status}</td>
                    <td>{exercise.submit_hist.length === (index + 1) ? <b>{this.toTime(submission.submitted)}</b> : this.toTime(submission.submitted)}</td>
                  </tr>
                  )
                })}
                </tbody>
              </table>
            </div>
          </div>
        )
      });
    }
    render() {
      return(
        <div>
          <h1 className="details">Report for {this.state.student_name}</h1>
          {this.populateSubHistory()}
        </div>
      )
    }
}

