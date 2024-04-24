import { Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Checkbox, FormControlLabel, Alert } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from "axios";
import { useState } from "react";

export default function OperatorForm({ mode, onUpdate, operatorData, jwt }) {
  const API_URL = process.env.REACT_APP_API_URL;

  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    hydrophone_operator_name: operatorData?.hydrophone_operator_name || '',
    contact_email: operatorData?.contact_email || '',
    contact_name: operatorData?.contact_name || '',
    website: operatorData?.website || '',
    in_directory: operatorData?.in_directory || false
  });

  const [formErrors, setFormErrors] = useState({
    hydrophone_operator_name: '',
    contact_email: '',
    contact_name: '',
    website: ''
  });

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

    const handleRequest = async (method) => {
      try {
          const response = await axios[method](
              API_URL + 'admin/operators',
              requestData,
              {
                headers: {
                  'Authorization': jwt
                }
              }
          );
          onUpdate();
          handleClose();
      } catch (error) {
        switch (true) {
          case error?.response?.data?.includes("User account already exists"):
              setError("Error creating operator: User account already exists");
              console.error("Error creating operator: ", error);
              break;
          case error?.response?.data?.includes("validation error detected"):
              setError("Error creating operator: Email cannot contain spaces");
              console.error("Error creating operator: ", error);
              break;
          default:
              setError("Error creating operator: " + error.response.data);
              console.error("Error creating operator: ", error);
        }
        return;
      }
    }


    if (mode === 'create') {
      await handleRequest('post');
    } 
    else if (mode === 'modify') {
        requestData.hydrophone_operator_id = operatorData.hydrophone_operator_id;
        await handleRequest('put');
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormData({ ...formData, [name]: checked });
  };

  const validateForm = () => {
    let valid = true;
    const errors = {};

    if (!formData.hydrophone_operator_name.trim()) {
        errors.hydrophone_operator_name = 'Organization is required';
        valid = false;
    }

    if (!formData.contact_email.trim()) {
        errors.contact_email = 'Contact email is required';
        valid = false;
    }

    if (!formData.contact_name.trim()) {
        errors.contact_name = 'Contact name is required';
        valid = false;
    }

    if (!formData.website.trim()) {
        errors.website = 'Organization website is required';
        valid = false;
    }

    setFormErrors(errors);
    return valid;
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
                        {error && <Alert severity="error">{error}</Alert>} 
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TextField
                                    label="Organization"
                                    name="hydrophone_operator_name"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.hydrophone_operator_name}
                                    onChange={handleChange}
                                    error={!!formErrors.hydrophone_operator_name}
                                    helperText={formErrors.hydrophone_operator_name}
                                />
                                <TextField
                                    label="Organization Website"
                                    name="website"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.website}
                                    onChange={handleChange}
                                    error={!!formErrors.website}
                                    helperText={formErrors.website}
                                />
                                <TextField
                                    label="Contact Name"
                                    name="contact_name"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.contact_name}
                                    onChange={handleChange}
                                    error={!!formErrors.contact_name}
                                    helperText={formErrors.contact_name}
                                />
                                <TextField
                                    label="Contact Email"
                                    name="contact_email"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={formData.contact_email}
                                    onChange={handleChange}
                                    error={!!formErrors.contact_email}
                                    helperText={formErrors.contact_email}
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
