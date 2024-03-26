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
        <div className="popup-container">
          <IconButton onClick={handleClick}>
            <InfoIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Typography className="popup-typography-padding">
            How to Use This Map
          </Typography>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>How to Use This Map</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Use your mouse or keypad to pan in all directions, and to zoom in and out. Click on the hydrophone icons to view their data.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        </div>
      );      
}