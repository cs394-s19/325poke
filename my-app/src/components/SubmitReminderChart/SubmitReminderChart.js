import React, {Component} from 'react';
import './styles.css';
import 'react-table/react-table.css'
import ReactEcharts from 'echarts-for-react';
import * as _ from "lodash";
const timeOffset = 8 * 3600 * 1000;

export class SubmitReminderChart extends Component {
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

    render() {
        const {reminders, exercises, maxY, endDate, startDate} = this.props.userData;
        const dayList = this.generateDayList(startDate, endDate);
        // build x axis
        const xAxisData = [];
        for (let i = 0; i < dayList.length; i++) {
            xAxisData.push(new Date(dayList[i]).toDateString());
        }
        // build reminder bar
        let reminderOneSentDate = [];
        let reminderTwoSentDate = [];
        let reminderThreeSentDate = [];
        _.forEach(reminders, (remType, timestamp) => {
            if (remType[0] === "rem1")
                reminderOneSentDate[dayList.indexOf(this.mapTimestampToDate(timestamp, dayList))] = -1;
            else if (remType[0] === "rem2")
                reminderTwoSentDate[dayList.indexOf(this.mapTimestampToDate(timestamp, dayList))] = -1;
            else if (remType[0] === "rem3")
                reminderThreeSentDate[dayList.indexOf(this.mapTimestampToDate(timestamp, dayList))] = -1;
        });

        let firstSubmissionList = [];
        let reSubmissionList = [];
        // build submission bar
        _.forEach(exercises, (detail, exid) => {

            _.forEach(detail.submit_hist, (hist, index) => {
                let tempDate = this.mapTimestampToDate(hist.submitted, dayList);
                let dayIndex = dayList.indexOf(tempDate);
                if (index === 0) {
                    if (firstSubmissionList[dayIndex] !== undefined) {
                        firstSubmissionList[dayIndex] = firstSubmissionList[dayIndex] + 1;
                    } else {
                        firstSubmissionList[dayIndex] = 1;
                    }
                    return;
                }
                if (reSubmissionList[dayIndex] !== undefined) {
                    reSubmissionList[dayIndex] = reSubmissionList[dayIndex] + 1;
                } else {
                    reSubmissionList[dayIndex] = 1;
                }
            });
        });

        var itemStyleFirstSubmission = {
            color: "#4c9447",
            emphasis: {
                barBorderWidth: 1,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: 'rgba(0,0,0,0.5)'
            }
        };
        var itemStyleResubmission = {
            color: "#8DC679",
            emphasis: {
                barBorderWidth: 1,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: 'rgba(0,0,0,0.5)'
            }
        };
        this.option = {
            backgroundColor: '#eee',
            tooltip: {},
            xAxis: {
                data: xAxisData,
                name: 'Date  ',
                inverse: true,
                silent: false,
                axisLine: {onZero: true},
                splitLine: {show: false},
                splitArea: {show: false}
            },
            yAxis: {
                name: 'Number of Submissions',
                max: maxY,
                min: -1,
                inverse: false,
                splitArea: {show: false}
            },
            grid: {
                left: 100
            },
            series: [
                {
                    name: '4-day reminder',
                    type: 'bar',
                    stack: 'one',
                    itemStyle: {
                        color: '#5086EC'
                    },
                    data: reminderOneSentDate
                },
                {
                    name: '7-day reminder',
                    type: 'bar',
                    stack: 'one',
                    itemStyle: {
                        color: '#EBB53E'
                    },
                    data: reminderTwoSentDate
                },
                {
                    name: '10-day reminder',
                    type: 'bar',
                    stack: 'one',
                    itemStyle: {
                        color: '#CB4F40'
                    },
                    data: reminderThreeSentDate
                }
            ]
        };

        let jsonObjFirstSubmission = {
            name: 'First Submission',
            type: 'bar',
            stack: 'one',
            itemStyle: itemStyleFirstSubmission,
            data: firstSubmissionList
        };
        let jsonObjResubmission = {
            name: 'Resubmission',
            type: 'bar',
            stack: 'one',
            itemStyle: itemStyleResubmission,
            data: reSubmissionList
        };
        this.option["series"].push(jsonObjFirstSubmission);
        this.option["series"].push(jsonObjResubmission);

        return (
            <div>
                <ReactEcharts
                    option={this.option}
                    notMerge={true}
                    lazyUpdate={true}
                    theme={"theme_name"}
                    />
            </div>
        )
    }
}
