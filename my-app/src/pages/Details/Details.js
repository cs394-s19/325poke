import React, { Component } from 'react';
import _ from 'lodash';
import './styles.css';

export class Details extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exercises: this.props.location.exercises,
            student: this.props.location.student,
            currentTime: this.props.location.currentTime,
        };
        console.log(this.props.location.exercises)
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
    }

    populateSubHistory = () => {
      return _.map(this.state.exercises, (exercise, index) => {
        const hist = _.filter(exercise.submit_hist, (entry) => entry.submitted < this.state.currentTime);
        console.log(hist);
        if (_.isEmpty(hist)) {
          // to identify when we have no submissions
          return null;
        }
        return (
          <div className="details" key={index}>
            <h1>Exercise {index}</h1>
            {this.populateListofSubmissions(hist)}
          </div>
        );
      });
    }

    render() {
      // to avoid trying to display null
      let pastSubs = _.filter(this.populateSubHistory(), (e) => e != null);
      if (_.isEmpty(pastSubs)) {
        pastSubs = <p className="details">This student has not submitted anything yet.</p>;
      }
      return(
        <div>
          <h1 className="details">Report for student {this.state.student}</h1>
          <br/>
          {pastSubs}
        </div>
      );
    }
}
