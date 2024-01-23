import React, { useState } from 'react';
import { IconButton, Typography } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function Popup(){
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 1000,
            background: 'white', 
            borderRadius: '8px', // border-radius for rounded corners
          }}
        >
          <IconButton onClick={handleClick}>
            <InfoIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Typography style={{ paddingRight: '8px' }}>
            How to Use This Map
          </Typography>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>How to Use This Map</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Information about how to use the map goes here. Information about how
                to use the map goes here. Information about how to use the map goes
                here.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        </div>
      );      
}