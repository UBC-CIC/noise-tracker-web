import { Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Checkbox, FormControlLabel } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import sampleHydrophoneData from "../../sampledata/sampleHydrophoneData";
import axios from "axios";
import { useState } from "react";

export default function OperatorForm({ mode, onUpdate, operatorData, jwt }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const [open, setOpen] = useState(false);
    const [organization, setOrganization] = useState(operatorData?.hydrophone_operator_name || '');
    const [contact, setContact] = useState(operatorData?.contact_email || '');
    const [contactName, setcontactName] = useState(operatorData?.contact_name || '');
    const [organizationWebsite, setorganizationWebsite] = useState(operatorData?.website || '');
    const [checked, setChecked] = useState(operatorData?.in_directory || false);

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
                  API_URL + 'admin/operators',
                  {
                    "hydrophone_operator_name": organization,
                    "contact_name": contactName,
                    "contact_email": contact,
                    "website": organizationWebsite,
                    "in_directory": checked,
                  },
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
          console.log("Checked value: ", checked);
            try{
                const response = await axios.put(
                  API_URL + 'admin/operators',
                  {
                    "hydrophone_operator_id": operatorData.hydrophone_operator_id,
                    "hydrophone_operator_name": organization,
                    "contact_name": contactName,
                    "contact_email": contact,
                    "website": organizationWebsite,
                    "in_directory": checked
                  },
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

    const handleOrganizationChange = (event) => {
        setOrganization(event.target.value);
    };

    const handleContactChange = (event) => {
        setContact(event.target.value);
    };

    const handleContactNameChange = (event) => {
      setcontactName(event.target.value);
    };

    const handleOrganizationWebsiteChange = (event) => {
      setorganizationWebsite(event.target.value);
    };

    const handleCheckboxChange = (event) => {
      setChecked(event.target.checked);
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
                                    label="Organization Website"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={organizationWebsite}
                                    onChange={handleOrganizationWebsiteChange}
                                />
                                <TextField
                                    label="Contact Name"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={contactName}
                                    onChange={handleContactNameChange}
                                />
                                <TextField
                                    label="Contact Email"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={contact}
                                    onChange={handleContactChange}
                                />
                                <Typography style={{ marginTop: '20px' }}>Do you agree to these details being shared in the password-protected 
                                  Hydrophone Operator directory, so that other NoiseTracker Hydrophone Operators 
                                  may contact you for questions regarding your hydrophones or data? 
                                  These details will NOT be shared publicly.
                                </Typography>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                        checked={checked}
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
