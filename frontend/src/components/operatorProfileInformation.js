import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';

export default function OperatorProfileInformation(){
    const [isButtonSelected, setIsButtonSelected] = useState(false);
    const [selectedHydrophones, setSelectedHydrophones] = useState([]);

    const handleButtonClick = (hydrophoneIndex) => {
        setSelectedHydrophones((prevSelected) => {
            if (prevSelected.includes(hydrophoneIndex)) {
                // Hydrophone is already selected, remove it
                return prevSelected.filter((index) => index !== hydrophoneIndex);
            } else {
                // Hydrophone is not selected, add it
                return [...prevSelected, hydrophoneIndex];
            }
        });
    };

    return (
        <div style={{ paddingLeft: '20px' }}>
            <Typography style={{ fontSize: '24px', paddingBottom: '20px' }}>
                Welcome to your operator profile.
            </Typography>
            <Typography style={{ fontSize: '24px' }}>Hydrophones</Typography>

            <TableContainer component={Paper} style={{ marginTop: '20px', width: '95%' }}>
                <Table>
                    {sampleHydrophoneData.map((hydrophone, index) => (
                        <React.Fragment key={index}>
                            <TableRow>
                                <TableCell>
                                    <strong>{hydrophone.name}</strong>
                                    <span style={{ float: 'right' }}>
                                        <Button onClick={() => handleButtonClick(index)}>
                                            {selectedHydrophones.includes(index) ? 'Hide Details' : 'Show Details'}
                                        </Button>
                                    </span>
                                </TableCell>
                            </TableRow>
                            {selectedHydrophones.includes(index) && (
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Location: {hydrophone.coordinates}</TableCell>
                                    </TableRow>
                                    {hydrophone.metrics.map((metric, metricIndex) => (
                                        <TableRow key={metricIndex}>
                                            <TableCell>
                                                {metric}
                                                <span style={{ float: 'right' }}>
                                                    <IconButton component={Link} to={`/map`}>
                                                        <ArrowForwardIosIcon />
                                                    </IconButton>
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            )}
                        </React.Fragment>
                    ))}
                </Table>
            </TableContainer>
        </div>
    );
}