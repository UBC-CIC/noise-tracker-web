import { IconButton, Typography, Tab, Tabs } from '@mui/material';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const Sidebar = ({ hydrophoneData, onCloseSidebar }) => {
    const handleSidebarClose = () =>{
        onCloseSidebar();
    };

    return (
        <div style={{ position: 'relative', width: '35%', backgroundColor: '#f0f0f0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 'auto' }}>
            <Typography variant='h4'>{hydrophoneData.name}</Typography>
            <Tabs value={false} indicatorColor="primary" textColor="primary" style={{ marginTop: '20px' }}>
              {hydrophoneData.metrics.map((metric, index) => (
                <Tab key={index} label={metric} />
              ))}
            </Tabs>
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