import React, { useState } from 'react';
import { Typography, Checkbox, FormControlLabel, Button } from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';

export default function OperatorProfileDownload() {
    // Create a state to store selected metrics for each hydrophone
    const [selectedMetrics, setSelectedMetrics] = useState({});

    // Create a state to store start and end date times 
    const [startDateTime, setStartDateTime] = useState(null);
    const [endDateTime, setEndDateTime] = useState(null);

    const handleCheckboxChange = (hydrophoneName, metric) => {
        setSelectedMetrics((prevSelectedMetrics) => {
            const hydrophoneSelectedMetrics = {
                ...prevSelectedMetrics,
                [hydrophoneName]: {
                    ...(prevSelectedMetrics[hydrophoneName] || {}),
                    [metric]: !prevSelectedMetrics[hydrophoneName]?.[metric],
                },
            };
            return hydrophoneSelectedMetrics;
        });
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
        // Add download logic here
    };

    return (
        <div style={{ paddingLeft: '20px' }}>
            <Typography style={{ fontSize: '24px', paddingBottom: '20px' }}>
                Select the metrics you would like to download.
            </Typography>

            {sampleHydrophoneData.map((hydrophone) => (
                <div key={hydrophone.name} style={{ paddingBottom: '20px' }}>
                    <Typography variant="h6">{hydrophone.name}</Typography>
                    {hydrophone.metrics && hydrophone.metrics.length > 0 ? (
                        hydrophone.metrics.map((metric) => (
                            <FormControlLabel
                                key={metric}
                                control={
                                    <Checkbox
                                        checked={selectedMetrics[hydrophone.name]?.[metric] || false}
                                        onChange={() => handleCheckboxChange(hydrophone.name, metric)}
                                    />
                                }
                                label={metric}
                            />
                        ))
                    ) : (
                        <Typography>No metrics available for this hydrophone</Typography>
                    )}
                </div>
            ))}

            <Typography style={{ fontSize: '24px', paddingBottom: '20px', paddingTop: '20px' }}>
                Select the time period that you would like to download from.
            </Typography>

            <div style={{ paddingBottom: '20px', width: '20%'}}>       
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

            <div style={{ paddingBottom: '50px', width: '20%'}}>       
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

            <Button variant="contained" onClick={handleDownloadClick}>
                Download
            </Button>
        </div>
    );
}
