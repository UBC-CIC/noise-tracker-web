import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Tab, Tabs, Box, tabsClasses, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SidebarOverview from './sidebarOverview';
import SidebarNoiseMetrics from './sidebarNoiseMetrics';
import SidebarTrends from './sidebarTrends';
import SidebarStationInformation from './sidebarStationInformation';
import LineGraph from './linegraph';

const Sidebar = ({ hydrophoneData, onCloseSidebar, spectrogramData, splData, selectedMetric }) => {
    const [selectedTab, setSelectedTab] = useState("Overview"); // Initialize selectedTab state
    const tabs = ["Overview", "Noise Metrics", "Trends", "Station Information"];
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
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

    const sidebarStyles = {
      position: isMobile ? 'absolute' : 'relative',
      display: 'flex',
      flexDirection: 'column',
      bottom: isMobile ? '10%' : 'auto',
      left: isMobile ? '5%' : 'auto',
      right: isMobile ? '5%' : 'auto',
      transform: isMobile ? 'translateY(0) translateX(0)' : 'none',
      width: isMobile ? '80vw' : '35%',
      height: isMobile ? '60vh' : 'auto',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      borderRadius: isMobile ? '20px' : '0px',
      zIndex: 1000,
  };

  // Render different components based on selected tab
  const renderTabContent = () => {
    switch (selectedTab) {
      case "Overview":
        return <SidebarOverview hydrophoneData={hydrophoneData} />;
      case "Noise Metrics":
        return <SidebarNoiseMetrics spectrogramData={spectrogramData} splData={splData} />;
      case "Trends":
        return <SidebarTrends hydrophoneData={hydrophoneData} />;
      case "Station Information":
        return <SidebarStationInformation hydrophoneData={hydrophoneData} />;
      default:
        return null;
    }
  };

  return (
      <Box sx={sidebarStyles}>
          <div className="sidebar-header">
              <Typography variant='h4'>{`${hydrophoneData.site} (${hydrophoneData.hydrophone_operator_name})`}</Typography>
              <IconButton onClick={handleSidebarClose}>
                  <CloseIcon />
              </IconButton>
          </div>
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
                  {tabs.map((metric, index) => (
                      <Tab key={index} label={metric} value={metric} />
                  ))}
              </Tabs>
          <div className="sidebar-content">
            {renderTabContent()}
            {/* <div className="sidebar-graph">
              {selectedTab === "Sound Pressure Level" && (
                  <>
                      <Typography className="sidebar-typography-padding">Contextual information about the metric goes here.</Typography>
                      <div>
                        <LineGraph hydrophoneData={hydrophoneData} />
                      </div>
                  </>
              )}
              </div> */}
              <div className="sidebar-updated-timestamp">
              <Typography>Last Updated: {hydrophoneData.lastUpdated}</Typography>
              </div>
          </div>
          
      </Box>
  );
};

export default Sidebar;