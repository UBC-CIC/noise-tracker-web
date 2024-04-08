import React, { useState, useEffect } from 'react';
import { Typography, Checkbox, FormControlLabel, Button, CircularProgress } from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';
import axios from 'axios';

export default function OperatorProfileDownload({ jwt }) {
    const API_URL = process.env.REACT_APP_API_URL;

    // Create a state to store selected metrics for each hydrophone
    const [checkedHydrophones, setCheckedHydrophones] = useState({}); // State to hold checked status

    // Create a state to store start and end date times 
    const [startDateTime, setStartDateTime] = useState(null);
    const [endDateTime, setEndDateTime] = useState(null);

    const [hydrophoneData, setHydrophoneData] = useState([]);
    const [downloadURL, setDownloadURL] = useState(null);

    // States to track loading statuses
    const [loadingHydrophoneData, setLoadingHydrophoneData] = useState(false); 
    const [loadingPresignedURL, setLoadingPresignedURL] = useState(false); 


    useEffect(() => {
        fetchHydrophoneData();
      }, []);
  
    const fetchHydrophoneData = async () => {
    try{
        setLoadingHydrophoneData(true);

        const response = await axios.get(
        API_URL + 'operator/hydrophones',
        {
            headers: {
            'Authorization': jwt
            }
        }
        );

        const data = response.data;
        setHydrophoneData(data);
    } 
    
    catch(error){
        console.error("Error fetching hydrophone data: ", error);
    } 
    finally {
        setLoadingHydrophoneData(false); // Set loading to false when data fetching completes 
    }
    }

    const fetchPresignedURL = async () => {
        try{
            setLoadingPresignedURL(true);

            const params = new URLSearchParams();
            Object.entries(checkedHydrophones).forEach(([site, checked]) => {
                if (checked) {
                    params.append('hydrophones', site);
                }
            });

            params.append('startTime', startDateTime);
            params.append('endTime', endDateTime);
        
            const response = await axios.get(
                API_URL + 'operator/download',
                {
                headers: {
                    'Authorization': jwt
                },
                params: params
                }
            );

            const data = response.data;
            console.log(data);
            setDownloadURL(data);
        } 
        
        catch(error){
            console.error("Error fetching pre-signed URL: ", error);
        } 
        finally {
            setLoadingPresignedURL(false); // Set loading to false when data fetching completes 
        }
    }

    const handleCheckboxChange = (event, site) => {
        setCheckedHydrophones({ ...checkedHydrophones, [site]: event.target.checked });
    };

    const handleStartDateTimeChange = (date) => {
        const formattedDate = date.$d.toISOString();
        setStartDateTime(formattedDate);
    };

    const handleEndDateTimeChange = (date) => {
        const formattedDate = date.$d.toISOString();
        setEndDateTime(formattedDate);
    };

    const handleDownloadClick = () => {
        fetchPresignedURL();
    };

    const dateTimePickerStyling = { 
        width: '25%',
        minWidth: '300px',
        paddingBottom: '20px', 
    };

    return (
        <div style={{ paddingLeft: '20px' }}>
            <Typography style={{ fontSize: '24px', paddingBottom: '20px' }}>
                Select which hydrophones' data you would like to download.
            </Typography>

            {loadingHydrophoneData ? ( // Render circular progress if loading is true
                <CircularProgress color="success" />
            ) : (
                <div>
                {hydrophoneData.map((hydrophone) => (
                    <div key={hydrophone.site} style={{ paddingBottom: '20px' }}>
                        <div key={hydrophone.site} style={{ paddingBottom: '20px', display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                                checked={checkedHydrophones[hydrophone.site] || false}
                                onChange={(event) => handleCheckboxChange(event, hydrophone.site)}
                            />
                            <Typography variant="h6">{hydrophone.site}</Typography>
                        </div>
                    </div>
                ))}
                </div>
            )}

            <Typography style={{ fontSize: '24px', paddingBottom: '20px', paddingTop: '20px' }}>
                Select the time period that you would like to download from.
            </Typography>

            <div style={dateTimePickerStyling}>       
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                        <DateTimePicker 
                            label="Select the starting date time" 
                            value={startDateTime}
                            onChange={handleStartDateTimeChange}
                        />
                    </DemoContainer>
                </LocalizationProvider>
            </div>

            <div style={dateTimePickerStyling}>       
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                        <DateTimePicker 
                            label="Select the ending date time"
                            value={endDateTime}
                            onChange={handleEndDateTimeChange}
                        />
                    </DemoContainer>
                </LocalizationProvider>
            </div>

            {loadingPresignedURL ? (
                <div>
                    <CircularProgress color="success" />
                    <Typography>Generating a download URL. This may take a while.</Typography>
                </div>
            ) : (
                <div>
                    {downloadURL ? (
                        <div>
                            <Typography>Download URL generated. Click below to begin download.</Typography>
                            <a href={downloadURL} target="_blank" rel="noopener noreferrer">
                                <Button sx={{ mt: 2, mb: 2 }} variant="contained">
                                    Download
                                </Button>
                            </a>
                        </div>
                    ) : (
                        <Button sx={{ mt: 2, mb: 2 }} variant="contained" onClick={handleDownloadClick}>
                            Generate Download URL
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
