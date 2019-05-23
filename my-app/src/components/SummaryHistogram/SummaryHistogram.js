import React from 'react';
import Chart from 'react-google-charts';

// takes in the week number (from parent) and the data and generates the summary histogram
function SummaryHistogram({ week, data }) {
   return(
      <Chart className="Chart"
                       width={'=800px'}
                       height={'400px'}
                       chartType="Bar"
                       loader={<div>Loading Chart</div>}
                       data={this.getDailyReminderByWeek(currWeek)}
                       chartEvents={this.chartEvents}
                    //    options={{
                    //        // Material design options
                    //        chart: {
                    //            title: 'Number of reminders',
                    //            subtitle: 'Week ' + currWeek,
                    //        },
                    //    }}
                       align="center"
                    // For tests
                       rootProps={{'data-testid': '2'}}
    />
   )
}

export default SummaryHistogram;