import { IconButton, Button, Typography } from '@mui/material';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const Sidebar = ({ hydrophoneMetadata, onCloseSidebar }) => {
    const handleSidebarClose = () =>{
        onCloseSidebar();
    };

    return (
        <div style={{ position: 'relative', width: '25%', backgroundColor: '#f0f0f0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 'auto' }}>
            <Typography variant='h4'>{hydrophoneMetadata.name}</Typography>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <Typography>Last Updated: {hydrophoneMetadata.lastUpdated}</Typography>
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