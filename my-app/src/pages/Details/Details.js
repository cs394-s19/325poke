import React, { Component } from 'react';
import _ from 'lodash';
import './styles.css';

export class Details extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exercises: this.props.location.exercises, 
            student_id: this.props.location.student_id,
            student_name: this.props.location.student_name,
            //currentTime: this.props.location.currentTime,
        };
    };

    toTime = (timestamp) => {
        var date = new Date(timestamp);
        var time = date.getFullYear() + '-' + (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-' + date.getDate() + ' '+ date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        return time;
    };

    populateListofSubmissions = (hist) => {
      return _.reverse(_.map(hist, (sub, index) => {
        return (
          <div className="details" key={index}>
            Status: <b>{sub.status}</b> Submitted On: <b>{this.toTime(sub.submitted)}</b>
            <br/>
            <br/>
          </div>
        )
      }));
    };

    populateSubHistory = () => {
      return _.map(this.state.exercises, (exercise, index) => {
          if (index === 'ignoreme')
              return;
        //const hist = _.filter(exercise.submit_hist, (entry) => entry.submitted < this.state.currentTime);
        const hist = exercise.submit_hist;
        console.log(hist);
        if (_.isEmpty(hist)) {
          // to identify when we have no submissions
          return null;
        }
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
        );
      });
    };

    render() {
      // to avoid trying to display null
      let pastSubs = _.filter(this.populateSubHistory(), (e) => e != null);
      if (_.isEmpty(pastSubs)) {
        pastSubs = <p className="details">This student has not submitted anything yet.</p>;
      }
      return(
        <div>
          <h1 className="details">Report for {this.state.student_name}</h1>
          {pastSubs}
        </div>
      );
    }
}
