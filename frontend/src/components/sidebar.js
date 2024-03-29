import { IconButton, Typography, Tab, Tabs, tabsClasses } from '@mui/material';
import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import LineGraph from './linegraph';

const Sidebar = ({ hydrophoneData, onCloseSidebar, selectedMetric }) => {
    const [selectedTab, setSelectedTab] = useState("Sound Pressure Level"); // Initialize selectedTab state

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
      <div className="sidebar-container">
        <div className="sidebar-header">
        <Typography variant='h4'>{hydrophoneData.name}</Typography>
        <IconButton onClick={handleSidebarClose}>
          <CloseIcon />
        </IconButton>
      </div>
        <div className="sidebar-content">
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange} 
            indicatorColor="primary" 
            textColor="primary" 
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            className="tabs-margin-top"
            sx={{
              [`& .${tabsClasses.scrollButtons}`]: {
                '&.Mui-disabled': { opacity: 0.3 },
              },
            }}>
            {hydrophoneData.metrics.map((metric, index) => (
              <Tab key={index} label={metric} value={metric} />
            ))}
          </Tabs>
          {selectedTab === "Sound Pressure Level" && (
            <>
              <Typography className="sidebar-typography-padding">Contextual information about the metric goes here.</Typography>
              <div>
                <LineGraph hydrophoneData={hydrophoneData} />
              </div>
            </>
          )} 
        </div>
        <div>
          <Typography>Last Updated: {hydrophoneData.lastUpdated}</Typography>
        </div>
      </div>
    );   
};

export default Sidebar;