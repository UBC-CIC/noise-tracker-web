import React from 'react';
import Plot from 'react-plotly.js';

const LineGraph = ({ hydrophoneData }) => {
  const { xAxis, yAxis } = hydrophoneData.soundLevelsData;

  // Sample data for the line graph
  const data = [
    {
      x: xAxis,
      y: yAxis,
      type: 'scatter',
      mode: 'lines',
      marker: { color: '#1976D2' },
    },
  ];

  // Get every fifth date for x-axis labels
  const tickIndices = xAxis.reduce((indices, _, index) => {
    if (index % 5 === 0) {
      indices.push(index);
    }
    return indices;
  }, []);

  const tickvals = tickIndices.map(index => xAxis[index]);
  const ticktext = tickvals;


  // Layout configuration for the graph
  const layout = {
    title: 'Sound Pressure Level',
    xaxis: { title: 'Date', tickvals, ticktext},
    yaxis: { title: 'dB'},
    autosize: false,
    width: 600,
    height: 400,
    margin: {
        l: 50,
        r: 50,
        b: 50,
        t: 50,
        pad: 4
  },
  };

  return <Plot data={data} layout={layout} />;
};

export default LineGraph;