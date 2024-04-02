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
      marker: { color: '#4B9690' },
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
    xaxis: { title: 'Date', tickvals, ticktext },
    yaxis: { title: 'dB' },
    margin: {
      l: 50,
      r: 50,
      b: 100,
      t: 100,
      pad: 4
    },
  };

  const config = {
    responsive: true
  };

  return <Plot data={data} layout={layout} config={config} useResizeHandler={true} style={{ width: "100%", height: "100%" }}/>;
};

export default LineGraph;