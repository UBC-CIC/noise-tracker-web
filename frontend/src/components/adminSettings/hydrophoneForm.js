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
import axios from "axios";
import dayjs from "dayjs";
import { useState } from "react";

export default function HydrophoneForm({ mode, onUpdate, hydrophoneData, jwt, operatorData }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileExists, setFileExists] = useState(hydrophoneData && hydrophoneData.calibration_available ? true : false);
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

    const [formErrors, setFormErrors] = useState({
        hydrophone_operator_name: '',
        site: '',
        coordinates: '',
        model: '',
        mounting_type: '',
        height_from_seafloor: '',
        sampling_frequency: '',
        depth: '',
        range: '',
        angle_of_view: '',
        file_length: '',
        file_format: '',
        directory: '',
        file_name: '',
        timezone: '',
        storage_interval: '',
      });

    const [fileError, setFileError] = useState(false); 

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        const isValid = validateForm(); 
        if (!isValid) {
            return; 
        }
        
        const requestData = { ...formData };

        if (mode === 'create'){
            try{
                // Check if calibration is available but no file selected and file doesn't already exist from previous upload
                if (formData.calibration_available && !selectedFile && !fileExists) { 
                    setFileError(true);
                    return; 
                }

                const response = await axios.post(
                  API_URL + 'admin/hydrophones',
                  requestData,
                  {
                    headers: {
                      'Authorization': jwt
                    }
                  }
                );

                const presignedURL = response.data;

                if (formData.calibration_available && selectedFile) {
                    handleUpload(presignedURL);
                }

                onUpdate();
              } 
              
              catch(error){
                console.error("Error creating operator: ", error);
              }
        }
        else if (mode === 'modify'){
            requestData.hydrophone_id = hydrophoneData.hydrophone_id;

            try{
                // Check if calibration is available but no file selected and file doesn't already exist from previous upload
                if (formData.calibration_available && !selectedFile && !fileExists) { 
                    setFileError(true);
                    return; 
                }

                const response = await axios.put(
                  API_URL + 'admin/hydrophones',
                  requestData,
                  {
                    headers: {
                      'Authorization': jwt
                    }
                  }
                );

                const presignedURL = response.data;

                if (formData.calibration_available && selectedFile) {
                    handleUpload(presignedURL);
                }

                onUpdate();
              } 
              
              catch(error){
                console.error("Error creating operator: ", error);
              }
        }

        handleClose(); // Close the dialog after saving
    };

    const handleUpload = async (presignedURL) => {    
        try {
            const response = await axios.put(presignedURL, selectedFile, {
                headers: {
                    'Content-Type': selectedFile.type
                }
            });
    
            // Reset the selected file after upload
            setSelectedFile(null);
        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
        setFormErrors({ ...formErrors, [name]: '' });
    };

    const handleDateChange = (date, name) => {
        setFormData({ ...formData, [name]: date });
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setFormData({ ...formData, [name]: checked });
        if (!checked) {
            setFileError(false);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setFileExists(false);
        setFileError(false);
    };

    const validateForm = () => {
        let valid = true;
        const errors = {};
    
        if (!formData.hydrophone_operator_name.trim()) {
            errors.hydrophone_operator_name = 'Organization is required';
            valid = false;
        }
    
        if (!formData.site.trim()) {
            errors.site = 'Site is required';
            valid = false;
        }
    
        if (!formData.coordinates.trim()) {
            errors.coordinates = 'Coordinates are required';
            valid = false;
        }
    
        if (!formData.model.trim()) {
            errors.model = 'Model is required';
            valid = false;
        }
    
        if (!formData.mounting_type.trim()) {
            errors.mounting_type = 'Mounting type is required';
            valid = false;
        }
    
        if (!formData.height_from_seafloor.trim()) {
            errors.height_from_seafloor = 'Height from seafloor is required';
            valid = false;
        }
    
        if (!formData.sampling_frequency.trim()) {
            errors.sampling_frequency = 'Sampling frequency is required';
            valid = false;
        }
    
        if (!formData.depth.trim()) {
            errors.depth = 'Depth is required';
            valid = false;
        }
    
        if (!formData.range.trim()) {
            errors.range = 'Range is required';
            valid = false;
        }
    
        if (!formData.angle_of_view.trim()) {
            errors.angle_of_view = 'Angle of view is required';
            valid = false;
        }
    
        if (!formData.file_length.trim()) {
            errors.file_length = 'File length is required';
            valid = false;
        }
    
        if (!formData.file_format.trim()) {
            errors.file_format = 'File format is required';
            valid = false;
        }
    
        if (!formData.directory.trim()) {
            errors.directory = 'Directory is required';
            valid = false;
        }
    
        if (!formData.file_name.trim()) {
            errors.file_name = 'File name is required';
            valid = false;
        }
    
        if (!formData.timezone.trim()) {
            errors.timezone = 'Timezone is required';
            valid = false;
        }
    
        if (!formData.storage_interval.trim()) {
            errors.storage_interval = 'Storage interval is required';
            valid = false;
        }
    
        setFormErrors(errors);
        return valid;
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
                                <FormControl fullWidth margin="normal" error={!!formErrors.hydrophone_operator_name}>
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
                                    error={!!formErrors.site}
                                    helperText={formErrors.site}
                                />
                                <TextField
                                    label="Location (Coordinates)"
                                    name="coordinates"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.coordinates}
                                    onChange={handleChange}
                                    error={!!formErrors.coordinates}
                                    helperText={formErrors.coordinates}
                                />
                                <TextField
                                    label="Hydrophone Brand and Model"
                                    name="model"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.model}
                                    onChange={handleChange}
                                    error={!!formErrors.model}
                                    helperText={formErrors.model}
                                />
                                <TextField
                                    label="Mounting Type"
                                    name="mounting_type"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.mounting_type}
                                    onChange={handleChange}
                                    error={!!formErrors.mounting_type}
                                    helperText={formErrors.mounting_type}
                                />

                                <TextField
                                    label="Height from Seafloor (m)"
                                    name="height_from_seafloor"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.height_from_seafloor}
                                    onChange={handleChange}
                                    error={!!formErrors.height_from_seafloor}
                                    helperText={formErrors.height_from_seafloor}
                                />
                                <TextField
                                    label="Sampling Frequency (kHz)"
                                    name="sampling_frequency"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.sampling_frequency}
                                    onChange={handleChange}
                                    error={!!formErrors.sampling_frequency}
                                    helperText={formErrors.sampling_frequency}
                                />
                                <TextField
                                    label="Depth (m, at median tide)"
                                    name="depth"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.depth}
                                    onChange={handleChange}
                                    error={!!formErrors.depth}
                                    helperText={formErrors.depth}
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
                                    error={!!formErrors.range}
                                    helperText={formErrors.range}
                                />
                                <TextField
                                    label="Estimated Angle of View (degs)"
                                    name="angle_of_view"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.angle_of_view}
                                    onChange={handleChange}
                                    error={!!formErrors.angle_of_view}
                                    helperText={formErrors.angle_of_view}
                                />
                                <TextField
                                    label="File Length (mins)"
                                    name="file_length"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.file_length}
                                    onChange={handleChange}
                                    error={!!formErrors.file_length}
                                    helperText={formErrors.file_length}
                                />
                                <TextField
                                    label="File Format"
                                    name="file_format" 
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.file_format}
                                    onChange={handleChange}
                                    error={!!formErrors.file_format}
                                    helperText={formErrors.file_format}
                                />
                                <TextField
                                    label="Directory"
                                    name="directory"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.directory}
                                    onChange={handleChange}
                                    error={!!formErrors.directory}
                                    helperText={formErrors.directory}
                                />
                                <TextField
                                    label="Sample File Name"
                                    name="file_name"  
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.file_name}
                                    onChange={handleChange}
                                    error={!!formErrors.file_name}
                                    helperText={formErrors.file_name}
                                />
                                <TextField
                                    label="Timezone"
                                    name="timezone"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    error={!!formErrors.timezone}
                                    helperText={formErrors.timezone}
                                />
                                <TextField
                                    label="Storage Interval (e.g., daily, monthly)"
                                    name="storage_interval"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.storage_interval}
                                    onChange={handleChange}
                                    error={!!formErrors.storage_interval}
                                    helperText={formErrors.storage_interval}
                                />
                                <Typography style={{ marginTop: '20px' }}>
                                    Is calibration information available?
                                </Typography>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                        name="calibration_available"
                                        checked={formData.calibration_available}
                                        onChange={handleCheckboxChange}
                                    />}
                                  label="Yes"
                                />
                                {formData.calibration_available && (
                                    <div>
                                        <input
                                            accept=".csv"
                                            style={{ display: 'none' }}
                                            id="file-upload"
                                            type="file"
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="file-upload">
                                            <Typography  style={{ marginTop: '20px', marginBottom: '5px' }}>
                                                Select calibration file
                                            </Typography>
                                            <Button color="primary" component="span">
                                                Select File
                                            </Button>
                                        </label>
                                        {selectedFile ? (
                                            <Typography variant="body2" style={{ marginTop: '10px' }}>
                                                Selected file: {selectedFile.name}
                                            </Typography>
                                        ) : (
                                            fileExists ? (
                                                <Typography variant="body2" style={{ marginTop: '10px' }}>
                                                    Selected file: 
                                                    <a href={hydrophoneData.presignedUrl} target="_blank" rel="noopener noreferrer">
                                                        Previously uploaded file
                                                    </a>
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" style={{ marginTop: '10px' }}>
                                                    No file chosen
                                                </Typography>
                                            )
                                        )}
                                    </div>
                                )}
                                {fileError && ( 
                                    <Typography variant="body2" style={{ color: "red", marginTop: "10px" }}>
                                        Please select a file for calibration.
                                    </Typography>
                                )}
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
