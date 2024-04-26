import { Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Alert } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from "axios";
import { useState } from "react";

export default function DeleteForm({ mode, itemId, onDelete, jwt }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [organization, setOrganization] = useState('');
    const [contact, setContact] = useState('');

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = async () => {
        if (mode === 'operator'){
            try{
                const deleteOperator = await axios.delete(
                  API_URL + 'admin/operators?operator_id=' + itemId,
                  {
                    headers: {
                      'Authorization': jwt
                    }
                  }
                );

                onDelete();
                handleClose(); 
              } 
              
              catch(error){
                setError("Error deleting operator: " + error?.response?.data);
                console.error("Error deleting operator: ", error);
              }
        }

        else if (mode === 'hydrophone'){
            try{
                const deleteOperator = await axios.delete(
                  API_URL + 'admin/hydrophones?hydrophone_id=' + itemId,
                  {
                    headers: {
                      'Authorization': jwt
                    }
                  }
                );

                onDelete();
                handleClose(); 
              } 
              
              catch(error){
                setError("Error deleting hydrophone: " + error?.response?.data);
                console.error("Error deleting hydrophone: ", error);
              }
        }
    };

    const handleOrganizationChange = (event) => {
        setOrganization(event.target.value);
    };

    const handleContactChange = (event) => {
        setContact(event.target.value);
    };

    return (
        <div style={{ paddingBottom: '20px' }}>
            <IconButton onClick={handleOpen}>
                <DeleteIcon />
            </IconButton>

            <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Delete</DialogTitle>
                    <DialogContent>
                        {error && <Alert severity="error">{error}</Alert>} 
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DialogContentText>
                                {mode === 'operator' 
                                ? 'Are you sure you want to delete this hydrophone operator?'
                                : 'Are you sure you want to delete this hydrophone?'}
                            </DialogContentText>
                        </LocalizationProvider>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
        </div>          
    );
}
