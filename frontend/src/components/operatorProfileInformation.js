import React, { useState } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, CircularProgress } from '@mui/material';
import StyledTableCell from './operatorTableCellStyle';
import DownloadIcon from '@mui/icons-material/Download';

export default function OperatorProfileInformation({ jwt, hydrophoneData, loading }){
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
        <div className="admin-content-area">
          {loading ? ( // Render circular progress if loading is true
                <center>
                    <CircularProgress color="success" />
                </center>
          ) : (
            <div>
            <Typography style={{ fontSize: '24px', paddingBottom: '20px' }}><b>{hydrophoneData[0]?.hydrophone_operator_name}</b></Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Hydrophone</StyledTableCell>
                    <StyledTableCell>Hydrophone ID</StyledTableCell>
                    <StyledTableCell>Coordinates</StyledTableCell>
                    <StyledTableCell>Model</StyledTableCell>
                    <StyledTableCell>Mounting Type</StyledTableCell>
                    <StyledTableCell>Height from Seafloor</StyledTableCell>
                    <StyledTableCell>Sampling Frequency (kHz)</StyledTableCell>
                    <StyledTableCell>Depth (m)</StyledTableCell>
                    <StyledTableCell>First Deployment Date</StyledTableCell>
                    <StyledTableCell>Last Deployment Date</StyledTableCell>
                    <StyledTableCell>Range (m)</StyledTableCell>
                    <StyledTableCell>Angle of View (°)</StyledTableCell>
                    <StyledTableCell>File Length</StyledTableCell>
                    <StyledTableCell>File Format</StyledTableCell>
                    <StyledTableCell>Directory</StyledTableCell>
                    <StyledTableCell>File Name</StyledTableCell>
                    <StyledTableCell>Timezone</StyledTableCell>
                    <StyledTableCell>Storage Interval</StyledTableCell>
                    <StyledTableCell>Last Data Upload</StyledTableCell>
                    <StyledTableCell>Calibration Available</StyledTableCell>
                    <StyledTableCell>Calibration File</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hydrophoneData.map((hydrophone, index) => (
                    <TableRow key={hydrophone.hydrophone_id} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                      <StyledTableCell>{hydrophone.site}</StyledTableCell>
                      <StyledTableCell>{hydrophone.hydrophone_id}</StyledTableCell>
                      <StyledTableCell>{hydrophone.latitude + ", " + hydrophone.longitude}</StyledTableCell>
                      <StyledTableCell>{hydrophone.model}</StyledTableCell>
                      <StyledTableCell>{hydrophone.mounting_type}</StyledTableCell>
                      <StyledTableCell>{hydrophone.height_from_seafloor}</StyledTableCell>
                      <StyledTableCell>{hydrophone.sampling_frequency}</StyledTableCell>
                      <StyledTableCell>{hydrophone.depth}</StyledTableCell>
                      <StyledTableCell>{hydrophone.first_deployment_date}</StyledTableCell>
                      <StyledTableCell>{hydrophone.last_deployment_date}</StyledTableCell>
                      <StyledTableCell>{hydrophone.range}</StyledTableCell>
                      <StyledTableCell>{hydrophone.angle_of_view}</StyledTableCell>
                      <StyledTableCell>{hydrophone.file_length}</StyledTableCell>
                      <StyledTableCell>{hydrophone.file_format}</StyledTableCell>
                      <StyledTableCell>{hydrophone.directory}</StyledTableCell>
                      <StyledTableCell>{hydrophone.file_name}</StyledTableCell>
                      <StyledTableCell>{hydrophone.timezone}</StyledTableCell>
                      <StyledTableCell>{hydrophone.storage_interval}</StyledTableCell>
                      <StyledTableCell>{hydrophone.last_data_upload}</StyledTableCell>
                      <StyledTableCell>{hydrophone.calibration_available ? 'Yes' : 'No'}</StyledTableCell>
                      <StyledTableCell>
                      {hydrophone.calibration_available ? (
                        <a href={hydrophone.presignedUrl} target="_blank" rel="noopener noreferrer">
                            <DownloadIcon style={{ color: '#6E6E6E' }}/>
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </div>
          )}
        </div>
    );
}