import { Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import sampleHydrophoneData from "../../sampledata/sampleHydrophoneData";
import { useState } from "react";

export default function CreateOperator() {
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
            <Button variant="contained" color="primary" onClick={handleOpen}>
                Create Operator
            </Button>
            <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Create Hydrophone Operator</DialogTitle>
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
                                <DatePicker
                                    label="Creation Date"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={deploymentDate}
                                    onChange={handleDeploymentDateChange}
                                />
                        </LocalizationProvider>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} color="primary">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
        </div>          
    );
}
