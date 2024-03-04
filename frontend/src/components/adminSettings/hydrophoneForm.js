import { Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import sampleHydrophoneData from "../../sampledata/sampleHydrophoneData";
import axios from "axios";
import { useEffect, useState } from "react";

export default function HydrophoneForm({ mode, onUpdate, hydrophoneData }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const [open, setOpen] = useState(false);
    const [operator, setOperator] = useState('');
    const [site, setSite] = useState('');
    const [location, setLocation] = useState('');
    const [hydrophone, setHydrophone] = useState('');
    const [samplingFrequency, setSamplingFrequency] = useState('');
    const [depth, setDepth] = useState('');
    const [deploymentDate, setDeploymentDate] = useState(null);
    const [range, setRange] = useState('');
    const [angleOfView, setAngleOfView] = useState('');

    const [operatorData, setOperatorData] = useState([]);

    useEffect(() => {
        fetchOperators();
    }, []);

    const fetchOperators = async () => {
        try{
                const response = await axios.get(
                    API_URL + 'operators?query=getOperatorData'
                );
                
                const data = response.data;
                setOperatorData(data); 
        }
        catch(error){
            console.log("Error fetching operators: ", error);
        }
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        if (mode === 'create'){
            try{
                const response = await axios.post(
                  API_URL + 'hydrophones',
                  {
                    "hydrophone_operator_id": operator,
                    "hydrophone_site": site,
                    "hydrophone_name": hydrophone,
                    "hydrophone_coordinates": location,
                    "deployment_date": deploymentDate,
                    "angle_of_view": angleOfView,
                    "depth": depth,
                    "range": range,
                    "sampling_frequency": samplingFrequency
                  }
                );

                onUpdate();
              } 
              
              catch(error){
                console.error("Error creating operator: ", error);
              }
        }

        handleClose(); // Close the dialog after saving
    };

    const handleOperatorChange = (event) => {
        setOperator(event.target.value);
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

    const handleRangeChange = (event) => {
        setRange(event.target.value);
    };

    const handleAngleOfViewChange = (event) => {
        setAngleOfView(event.target.value);
    };

    return (
        <div style={{ paddingBottom: '20px' }}>
            {mode === 'create' ? (
                <Button variant="contained" color="primary" onClick={handleOpen}>
                    Create Hydrophone
                </Button>
            ) : (
                <IconButton onClick={handleOpen}>
                    <EditIcon />
                </IconButton>
            )}
            <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{mode === 'create' ? 'Create Hydrophone' : 'Modify Hydrophone'}</DialogTitle>
                    <DialogContent>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="operator-label">Operator</InputLabel>
                                    <Select
                                        labelId="operator-label"
                                        label="Operator"
                                        value={operator}
                                        onChange={handleOperatorChange}
                                        fullWidth
                                    >
                                        {operatorData.map((operator, index) => (
                                            <MenuItem key={index} value={operator.hydrophone_operator_name}>
                                                {operator.hydrophone_operator_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Site"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={site}
                                    onChange={handleSiteChange}
                                />
                                <TextField
                                    label="Location (Coordinates)"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={location}
                                    onChange={handleLocationChange}
                                />
                                <TextField
                                    label="Hydrophone Model"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={hydrophone}
                                    onChange={handleHydrophoneChange}
                                />
                                <TextField
                                    label="Sampling Frequency (kHz)"
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
                                    value={range}
                                    onChange={handleRangeChange}
                                />
                                <TextField
                                    label="Estimated Angle of View (degs)"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={angleOfView}
                                    onChange={handleAngleOfViewChange}
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
