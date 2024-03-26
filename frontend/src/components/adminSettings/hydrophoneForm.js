import { Typography, 
         TextField, 
         Button, 
         Dialog, 
         DialogTitle, 
         DialogContent, 
         DialogActions, 
         IconButton, 
         Select, 
         MenuItem, 
         FormControl, 
         InputLabel, 
         FormControlLabel,
         Checkbox } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import sampleHydrophoneData from "../../sampledata/sampleHydrophoneData";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function HydrophoneForm({ mode, onUpdate, hydrophoneData, jwt, operatorData }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        hydrophone_operator_name: hydrophoneData?.hydrophone_operator_name || '',
        site: hydrophoneData?.site || '',
        coordinates: hydrophoneData?.coordinates || '',
        model: hydrophoneData?.model || '',
        mounting_type: hydrophoneData?.mounting_type || '',
        height_from_seafloor: hydrophoneData?.height_from_seafloor || '',
        sampling_frequency: hydrophoneData?.sampling_frequency || '',
        depth: hydrophoneData?.depth || '',
        first_deployment_date: dayjs(hydrophoneData?.first_deployment_date) || null,
        last_deployment_date: dayjs(hydrophoneData?.last_deployment_date) || null,
        range: hydrophoneData?.range || '',
        angle_of_view: hydrophoneData?.angle_of_view || '',
        file_length: hydrophoneData?.file_length || '',
        file_format: hydrophoneData?.file_format || '',
        directory: hydrophoneData?.directory || '',
        file_name: hydrophoneData?.file_name || '',
        timezone: hydrophoneData?.timezone || '',
        storage_interval: hydrophoneData?.storage_interval || '',
        last_data_upload: 'N/A',
        calibration_available: hydrophoneData?.calibration_available || ''
    });

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        const requestData = { ...formData };

        if (mode === 'create'){
            try{
                const response = await axios.post(
                  API_URL + 'admin/hydrophones',
                  requestData,
                  {
                    headers: {
                      'Authorization': jwt
                    }
                  }
                );

                onUpdate();
              } 
              
              catch(error){
                console.error("Error creating operator: ", error);
              }
        }
        else if (mode === 'modify'){
            requestData.hydrophone_id = hydrophoneData.hydrophone_id;

            try{
                const response = await axios.put(
                  API_URL + 'admin/hydrophones',
                  requestData,
                  {
                    headers: {
                      'Authorization': jwt
                    }
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

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (date, name) => {
        setFormData({ ...formData, [name]: date });
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setFormData({ ...formData, [name]: checked });
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
                                        name="hydrophone_operator_name"
                                        label="Operator"
                                        value={formData.hydrophone_operator_name}
                                        onChange={handleChange}
                                        fullWidth
                                    >
                                        {operatorData.length > 0 && operatorData.map((operator, index) => (
                                            <MenuItem key={index} value={operator.hydrophone_operator_name}>
                                                {operator.hydrophone_operator_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Site"
                                    name="site"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.site}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Location (Coordinates)"
                                    name="coordinates"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.coordinates}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Hydrophone Brand and Model"
                                    name="model"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.model}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Mounting Type"
                                    name="mounting_type"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.mounting_type}
                                    onChange={handleChange}
                                />

                                <TextField
                                    label="Height from Seafloor (m)"
                                    name="height_from_seafloor"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.height_from_seafloor}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Sampling Frequency (kHz)"
                                    name="sampling_frequency"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.sampling_frequency}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Depth (m, at median tide)"
                                    name="depth"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.depth}
                                    onChange={handleChange}
                                />
                                <DatePicker
                                    label="First Deployment Date"
                                    name="first_deployment_date"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.first_deployment_date}
                                    onChange={(date) => handleDateChange(date, 'first_deployment_date')}
                                />
                                <DatePicker
                                    label="Last Deployment Date"
                                    name="last_deployment_date"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.last_deployment_date}
                                    onChange={(date) => handleDateChange(date, 'last_deployment_date')}
                                />
                                <TextField
                                    label="Estimated Range (m)"
                                    name="range"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.range}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Estimated Angle of View (degs)"
                                    name="angle_of_view"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.angle_of_view}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="File Length (mins)"
                                    name="file_length"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.file_length}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="File Format"
                                    name="file_format" 
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.file_format}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Directory"
                                    name="directory"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.directory}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Sample File Name"
                                    name="file_name"  
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.file_name}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Timezone"
                                    name="timezone"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Storage Interval (e.g., daily, monthly)"
                                    name="storage_interval"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.storage_interval}
                                    onChange={handleChange}
                                />
                                <Typography style={{ marginTop: '20px' }}>
                                    Calibration information is available
                                </Typography>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                        name="calibration_available"
                                        checked={formData.calibration_available}
                                        onChange={handleCheckboxChange}
                                    />}
                                  label="True"
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
