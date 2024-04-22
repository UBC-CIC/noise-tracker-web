import { Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Checkbox, FormControlLabel } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from "axios";
import { useState } from "react";

export default function OperatorForm({ mode, onUpdate, operatorData, jwt }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
      hydrophone_operator_name: operatorData?.hydrophone_operator_name || '',
      contact_email: operatorData?.contact_email || '',
      contact_name: operatorData?.contact_name || '',
      website: operatorData?.website || '',
      in_directory: operatorData?.in_directory || false
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
                API_URL + 'admin/operators',
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
          requestData.hydrophone_operator_id = operatorData.hydrophone_operator_id;
          try{
              const response = await axios.put(
                API_URL + 'admin/operators',
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
        handleClose(); // Close the dialog 
    };

    const handleChange = (event) => {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (event) => {
      const { name, checked } = event.target;
      setFormData({ ...formData, [name]: checked });
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
                                    name="hydrophone_operator_name"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.hydrophone_operator_name}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Organization Website"
                                    name="website"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Contact Name"
                                    name="contact_name"  
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.contact_name}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Contact Email"
                                    name="contact_email" 
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.contact_email}
                                    onChange={handleChange}
                                />
                                <Typography style={{ marginTop: '20px' }}>Do you agree to these details being shared in the password-protected 
                                  Hydrophone Operator directory, so that other NoiseTracker Hydrophone Operators 
                                  may contact you for questions regarding your hydrophones or data? 
                                  These details will NOT be shared publicly.
                                </Typography>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                        name="in_directory"
                                        checked={formData.in_directory}
                                        onChange={handleCheckboxChange}
                                    />}
                                  label="I agree"
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
