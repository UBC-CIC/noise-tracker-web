import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Tab, Tabs, Box, tabsClasses, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SidebarOverview from './sidebarOverview';
import SidebarNoiseMetrics from './sidebarNoiseMetrics';
import SidebarTrends from './sidebarTrends';
import SidebarStationInformation from './sidebarStationInformation';
import LineGraph from './linegraph';

const Sidebar = ({ 
  hydrophoneData, 
  hydrophoneLoading,
  onCloseSidebar, 
  spectrogramData, 
  spectrogramLoading,
  splData, 
  splLoading,
  gaugeData, 
  gaugeLoading,
  selectedMetric 
}) => {
    const [selectedTab, setSelectedTab] = useState("Overview"); // Initialize selectedTab state
    const tabs = ["Overview", "Noise Metrics", "Trends", "Station Information"];
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [selectedGauge, setSelectedGauge] = useState(null);
    const [selectedSpl, setSelectedSpl] = useState(null);
    const [selectedSpectrogram, setSelectedSpectrogram] = useState(null);

    const date = selectedGauge?.recent_spl[0]?.date.slice(0,-1) + '-07:00';
    const lastUpdatedRaw = new Date(date);

    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true,
        timeZoneName: 'short',
    };

    const lastUpdatedFormatted = lastUpdatedRaw.toLocaleString('en-US', options);
    
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

    useEffect(() => {
      const selectedGauge = gaugeData.find(gauge => gauge.hydrophone_id === hydrophoneData.hydrophone_id);
      setSelectedGauge(selectedGauge);
    }, [gaugeData, hydrophoneData]);
    
    useEffect(() => {
      const selectedSpl = splData.find(spl => spl.hydrophone_id === hydrophoneData.hydrophone_id);
      setSelectedSpl(selectedSpl);
    }, [splData, hydrophoneData]);
    
    useEffect(() => {
      const selectedSpectrogram = spectrogramData.find(spectrogram => spectrogram.hydrophone_id === hydrophoneData.hydrophone_id);
      setSelectedSpectrogram(selectedSpectrogram);
    }, [spectrogramData, hydrophoneData]);
    

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
        return <SidebarOverview gaugeData={selectedGauge} gaugeLoading={gaugeLoading} />;
      case "Noise Metrics":
        return <SidebarNoiseMetrics spectrogramData={selectedSpectrogram} spectrogramLoading={spectrogramLoading} splData={selectedSpl} splLoading={splLoading} />;
      case "Trends":
        return <SidebarTrends />;
      case "Station Information":
        return <SidebarStationInformation hydrophoneData={hydrophoneData} hydrophoneLoading={hydrophoneLoading} />;
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
          <div className="sidebar-updated-timestamp">
            <Typography>Last Updated: {lastUpdatedFormatted}</Typography>
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
          </div>
          
      </Box>
  );
};

export default Sidebar;