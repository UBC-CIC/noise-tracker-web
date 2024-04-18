import { Typography, CircularProgress } from '@mui/material';
import React from 'react';
import Plot from 'react-plotly.js';

const SidebarLineGraph = ({ splData, loading }) => {
  // Check if splData is defined
  if (!splData && !loading) {
    return (
      <div>
          <Typography className='sidebar-typography-padding'>No Sound Pressure Level Data Available</Typography>
      </div>
      );
  }

  // Extracting dates and values for each trace
  const dates = splData?.data.map(data => data.date);
  const values = splData?.data.map(data => data.values);
  
  // Calculate least f_min and greatest f_max
  let lowerFrequency = Infinity;
  let upperFrequency = -Infinity;
  values[0].forEach(value => {
    // Convert to numbers before comparing
    let f_min = Number(value.f_min);
    let f_max = Number(value.f_max);

    if (f_min < lowerFrequency) {
      lowerFrequency = f_min;
    }
    if (f_max > upperFrequency) {
      upperFrequency = f_max;
    }
  });

  // Creating traces
  const traces = values[0].map((_, index) => ({
    x: dates,
    y: values.map(data => 10*Math.log10(data[index].val)),
    name: `${Number(values[0][index].f_min)} to ${Number(values[0][index].f_max)} Hz`,
    type: 'scatter',
  }));

  const config = {
    responsive: true
  };

  return (
    <div>
      {loading ? ( // Render circular progress if loading is true
                <center>
                    <CircularProgress color="success" />
                </center>
          ) : (
            <div>
            <Plot
              style={{ width: "100%", height: "100%" }}
              data={traces}
              layout={{
                title: 'Sound Pressure Levels',
                xaxis: { title: 'Time' },
                yaxis: { title: 'dB (re 1µPa)' },
                legend: { 
                  traceorder: 'reversed',
                  "orientation": "h",
                  x: 0,
                  y: -0.3
                },
              }}
              config={config} 
              useResizeHandler={true}
            />
            <Typography className='sidebar-typography-padding'>
              This plot shows Sound Pressure Levels in specific frequency bands over the last 24 hours. 
            </Typography>
            <Typography style={{ paddingBottom: '20px' }}>
              Double-click a label on the legend to isolate that band. 
            </Typography>
            <Typography>These frequency bands are defined as: </Typography>
            <ul>
              <li>Broadband - the full frequency range that this hydrophone records</li>
              <li>10-100Hz - communication range of larger baleen whales. Larger vessels may produce noise in this range.</li>
              <li>100-1000Hz - shows the levels in the communication range of humpback whales. Larger vessels may produce noise in this range</li>
              <li>0.5-15kHz - communication range of killer whales. Smaller vessels may produce noise in this range.</li>
              <li>15-150kHz - echolocation range of killer whales. Smaller vessels may produce noise in this range.</li>
            </ul>
            <Typography style={{ paddingTop: '20px' }}>
              Note: This hydrophone has a recording frequency range of {lowerFrequency}Hz to {upperFrequency}Hz.
            </Typography>
            <Typography className='sidebar-typography-padding'>
              Learn more about Sound Pressure Levels as a tool to understanding the ocean soundscape in our Education Hub.
            </Typography>
            </div>
          )}
    </div>
  );
};

export default SidebarLineGraph;
