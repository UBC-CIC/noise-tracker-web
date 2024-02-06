import { IconButton, Typography, Tab, Tabs } from '@mui/material';
import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import LineGraph from './linegraph';

const Sidebar = ({ hydrophoneData, onCloseSidebar, selectedMetric }) => {
    const [selectedTab, setSelectedTab] = useState("Sound Levels"); // Initialize selectedTab state

    const handleTabChange = (event, newValue) => {
      setSelectedTab(newValue);
    };

    const handleSidebarClose = () =>{
        onCloseSidebar();
    };

    useEffect(() => {
      if (selectedMetric){
        setSelectedTab(selectedMetric);
      }
    }, [selectedMetric]);

    return (
      <div style={{ position: 'relative', width: '35%', backgroundColor: '#f0f0f0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 'auto' }}>
          <Typography variant='h4'>{hydrophoneData.name}</Typography>
          <Tabs value={selectedTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" style={{ marginTop: '20px' }}>
            {hydrophoneData.metrics.map((metric, index) => (
              <Tab key={index} label={metric} value={metric} />
            ))}
          </Tabs>
          {selectedTab === "Sound Levels" && <LineGraph hydrophoneData={hydrophoneData} />} 
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <Typography>Last Updated: {hydrophoneData.lastUpdated}</Typography>
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <IconButton onClick={handleSidebarClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      </div>
    );   
};

export default Sidebar;