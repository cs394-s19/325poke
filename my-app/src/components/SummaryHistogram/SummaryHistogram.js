import React, {useState} from 'react';
import Chart from 'react-google-charts';

// takes in the week number (from parent) and the data and generates the summary histogram
function SummaryHistogram({ week, data }) {
   const [chartEvents, setChartEvents] = useState(
      [
         {
             eventName: 'select',
             callback: ({ chartWrapper }) => {
                 const chart = chartWrapper.getChart()
                 const selection = chart.getSelection()
                 this.setState({
                     ...this.state,
                     currIndex: selection[0].row,
                     currBucket: selection[0].column,
                 })
             }
         },
     ]
   )
   
   console.log("data: " + data)
   return(
      <Chart className="Chart"
                       width={'=800px'}
                       height={'400px'}
                       chartType="Bar"
                       loader={<div>Loading Chart</div>}
                       data={data}
                       chartEvents={chartEvents}
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