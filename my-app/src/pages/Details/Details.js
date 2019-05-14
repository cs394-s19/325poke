import React, { Component } from 'react';
import _ from 'lodash';
import './styles.css';

export class Details extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exercises: this.props.location.exercises, 
            student: this.props.location.student
        };
        console.log(this.props.location.exercises)
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
            Status: <b>{exercise.status}</b> Last Submitted Time:<b>{this.toTime(exercise.submitted)}</b>
            <br/>
            <br/>
          </div>
        )
      });
    }
    render() {
      return(
        <div>
          <h1 className="details">Report for student {this.state.student}</h1>
          {this.populateSubHistory()}
        </div>
      )
    }
}

