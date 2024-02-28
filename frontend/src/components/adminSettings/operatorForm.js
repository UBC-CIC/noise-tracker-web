import { Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import sampleHydrophoneData from "../../sampledata/sampleHydrophoneData";
import { useState } from "react";

export default function OperatorForm({ mode }) {
    const [open, setOpen] = useState(false);
    const [organization, setOrganization] = useState('');
    const [contact, setContact] = useState('');
    const [deploymentDate, setDeploymentDate] = useState(null);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        console.log("Organization:", organization);
        handleClose(); // Close the dialog after saving
    };

    const handleOrganizationChange = (event) => {
        setOrganization(event.target.value);
    };

    const handleContactChange = (event) => {
        setContact(event.target.value);
    };

    const handleDeploymentDateChange = (date) => {
        setDeploymentDate(date);
    };

    return (
        <div style={{ paddingBottom: '20px' }}>
            {mode === 'create' ? (
                <Button variant="contained" color="primary" onClick={handleOpen}>
                    Create Operator
                </Button>
            ) : (
                <IconButton onClick={handleOpen}>
                    <EditIcon />
                </IconButton>
            )}
            <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{mode === 'create' ? 'Create Hydrophone Operator': 'Modify Hydrophone Operator'}</DialogTitle>
                    <DialogContent>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TextField
                                    label="Organization"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={organization}
                                    onChange={handleOrganizationChange}
                                />
                                <TextField
                                    label="Contact"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={contact}
                                    onChange={handleContactChange}
                                />
                        </LocalizationProvider>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} color="primary">
                            {mode === 'create' ? 'Create' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>
        </div>          
    );
}