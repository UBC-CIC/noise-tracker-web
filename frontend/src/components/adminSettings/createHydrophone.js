import { Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import sampleHydrophoneData from "../../sampledata/sampleHydrophoneData";
import { useState } from "react";

export default function CreateHydrophone() {
    const [open, setOpen] = useState(false);
    const [organization, setOrganization] = useState('');
    const [site, setSite] = useState('');
    const [location, setLocation] = useState('');
    const [hydrophone, setHydrophone] = useState('');
    const [samplingFrequency, setSamplingFrequency] = useState('');
    const [depth, setDepth] = useState('');
    const [deploymentDate, setDeploymentDate] = useState(null);
    const [estimatedRange, setEstimatedRange] = useState('');
    const [estimatedAngleOfView, setEstimatedAngleOfView] = useState('');

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

    const handleSiteChange = (event) => {
        setSite(event.target.value);
    };

    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    const handleHydrophoneChange = (event) => {
        setHydrophone(event.target.value);
    };

    const handleSamplingFrequencyChange = (event) => {
        setSamplingFrequency(event.target.value);
    };

    const handleDepthChange = (event) => {
        setDepth(event.target.value);
    };

    const handleDeploymentDateChange = (date) => {
        setDeploymentDate(date);
    };

    const handleEstimatedRangeChange = (event) => {
        setEstimatedRange(event.target.value);
    };

    const handleEstimatedAngleOfViewChange = (event) => {
        setEstimatedAngleOfView(event.target.value);
    };

    return (
        <div style={{ paddingBottom: '20px' }}>
            <Button variant="contained" color="primary" onClick={handleOpen}>
                Create Hydrophone
            </Button>
            <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Create Hydrophone</DialogTitle>
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
                                    label="Site"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={site}
                                    onChange={handleSiteChange}
                                />
                                <TextField
                                    label="Location"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={location}
                                    onChange={handleLocationChange}
                                />
                                <TextField
                                    label="Hydrophone Name"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={hydrophone}
                                    onChange={handleHydrophoneChange}
                                />
                                <TextField
                                    label="Sampling Frequency"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={samplingFrequency}
                                    onChange={handleSamplingFrequencyChange}
                                />
                                <TextField
                                    label="Depth (m, at median tide)"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={depth}
                                    onChange={handleDepthChange}
                                />
                                <DatePicker
                                    label="Deployment Date"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={deploymentDate}
                                    onChange={handleDeploymentDateChange}
                                />
                                <TextField
                                    label="Estimated Range (m)"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={estimatedRange}
                                    onChange={handleEstimatedRangeChange}
                                />
                                <TextField
                                    label="Estimated Angle of View (degs)"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={estimatedAngleOfView}
                                    onChange={handleEstimatedAngleOfViewChange}
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
