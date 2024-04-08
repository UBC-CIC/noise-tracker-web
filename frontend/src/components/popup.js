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
              <div style={{ paddingBottom: "20px" }}>
                <DialogContentText>
                  Each icon on this map represents a hydrophone. 
                  These underwater microphones listen to the sounds of the underwater world and gather valuable acoustic information. 
                  Click on these icons to access real-time noise data at different locations along the coast and learn more about the 
                  various metrics that scientists use to understand the ocean soundscape. 
                </DialogContentText>
              </div>
              <DialogContentText>
                Don’t forget to check out our comprehensive Education Hub to learn more about the underwater noise!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        </div>
      );      
}