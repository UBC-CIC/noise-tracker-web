
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import HydrophoneForm from './adminSettings/hydrophoneForm';
import DeleteForm from './adminSettings/deleteForm';
import axios from 'axios';

export default function AdminHydrophones({ jwt }){
    const API_URL = process.env.REACT_APP_API_URL;

    const [hydrophoneData, setHydrophoneData] = useState([]);
    const [operatorData, setOperatorData] = useState([]);
    const [loading, setLoading] = useState(false); // State to track loading status

    useEffect(() => {
      setLoading(true); // Set loading to true when data fetching starts
      fetchHydrophoneData();
      fetchOperators();
    }, []);

    const fetchHydrophoneData = async () => {
      try{
        const response = await axios.get(
          API_URL + 'admin/hydrophones',
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
        setLoading(false); // Set loading to false when data fetching completes 
      }
    }

    const fetchOperators = async () => {
      try{
              const response = await axios.get(
                  API_URL + 'admin/operators?query=getOperatorData',
                  {
                    headers: {
                      'Authorization': jwt
                    }
                  }
              );
              
              const data = response.data;
              setOperatorData(data); 
      }
      catch(error){
          console.log("Error fetching operators: ", error);
      }
  };


    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
          backgroundColor: '#024959',
          color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
          fontSize: 14,
        },
        '&:first-child': { 
          position: 'sticky',
          left: 0,
          backgroundColor: '#f9f9f9',
          zIndex: 1,
        },
        '&:nth-last-child(2)': {
          position: 'sticky',
          right: '72px',
          backgroundColor: '#f9f9f9',
          zIndex: 1,
        },
        '&:last-child': { 
          position: 'sticky',
          right: 0,
          backgroundColor: '#f9f9f9',
          zIndex: 1,
        },
      }));

    return (
        <div style={{
          margin: '3%',
          flex: 1,
          justifyContent: 'center',
        }}>
          <HydrophoneForm mode="create" onUpdate={fetchHydrophoneData} jwt={jwt} operatorData={operatorData} />
          {loading ? ( // Render circular progress if loading is true
                <center>
                    <CircularProgress color="success" />
                </center>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto' }}>
            <TableContainer component={Paper} stickyHeader>
              <Table>
                <TableHead>
                  <TableRow style={{ background: '#f2f2f2' }}>
                    <StyledTableCell>Hydrophone</StyledTableCell>
                    <StyledTableCell>Hydrophone ID</StyledTableCell>
                    <StyledTableCell>Operator</StyledTableCell>
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
                    <StyledTableCell>Edit</StyledTableCell>
                    <StyledTableCell>Delete</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hydrophoneData.map((hydrophone, index) => (
                    <TableRow key={hydrophone.hydrophone_id} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                      <StyledTableCell>{hydrophone.site}</StyledTableCell>
                      <StyledTableCell>{hydrophone.hydrophone_id}</StyledTableCell>
                      <StyledTableCell>{hydrophone.hydrophone_operator_name}</StyledTableCell>
                      <StyledTableCell>{hydrophone.coordinates}</StyledTableCell>
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
                        <HydrophoneForm 
                          mode="modify" 
                          onUpdate={fetchHydrophoneData} 
                          hydrophoneData={{
                            "hydrophone_id": hydrophone.hydrophone_id,
                            "hydrophone_operator_id": hydrophone.hydrophone_operator_id,
                            "hydrophone_operator_name": hydrophone.hydrophone_operator_name,
                            "site": hydrophone.site,
                            "coordinates": hydrophone.coordinates,
                            "model": hydrophone.model,
                            "mounting_type": hydrophone.mounting_type,
                            "sampling_frequency": hydrophone.sampling_frequency,
                            "depth": hydrophone.depth,
                            "first_deployment_date": hydrophone.first_deployment_date,
                            "last_deployment_date": hydrophone.last_deployment_date,
                            "range": hydrophone.range,
                            "angle_of_view": hydrophone.angle_of_view,
                            "height_from_seafloor": hydrophone.height_from_seafloor,
                            "file_length": hydrophone.file_length,
                            "file_format": hydrophone.file_format,
                            "directory": hydrophone.directory,
                            "file_name": hydrophone.file_name,
                            "timezone": hydrophone.timezone,
                            "storage_interval": hydrophone.storage_interval,
                            "last_data_upload": hydrophone.last_data_upload,
                            "calibration_available": hydrophone.calibration_available
                          }}
                          jwt={jwt}
                          operatorData={operatorData}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                          <DeleteForm 
                            mode="hydrophone" 
                            itemId={hydrophone.hydrophone_id} 
                            onDelete={fetchHydrophoneData}
                            jwt={jwt}/>
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