
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';
import HydrophoneForm from './adminSettings/hydrophoneForm';
import DeleteForm from './adminSettings/deleteForm';
import axios from 'axios';

export default function AdminHydrophones({ jwt }){
    const API_URL = process.env.REACT_APP_API_URL;

    const [hydrophoneData, setHydrophoneData] = useState([]);
    const [operatorData, setOperatorData] = useState([]);

    useEffect(() => {
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
      }));

    return (
        <div style={{
          margin: '3%',
          flex: 1,
          justifyContent: 'center',
        }}>
          <HydrophoneForm mode="create" onUpdate={fetchHydrophoneData} jwt={jwt} operatorData={operatorData} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ background: '#f2f2f2' }}>
                  <StyledTableCell>Hydrophone</StyledTableCell>
                  <StyledTableCell>Hydrophone ID</StyledTableCell>
                  <StyledTableCell>Operator</StyledTableCell>
                  <StyledTableCell>Model</StyledTableCell>
                  <StyledTableCell>Coordinates</StyledTableCell>
                  <StyledTableCell>Deployment Date</StyledTableCell>
                  <StyledTableCell>Angle of View (°)</StyledTableCell>
                  <StyledTableCell>Depth (m)</StyledTableCell>
                  <StyledTableCell>Range (m)</StyledTableCell>
                  <StyledTableCell>Sampling Frequency (kHz)</StyledTableCell>
                  <StyledTableCell>Edit</StyledTableCell>
                  <StyledTableCell>Delete</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hydrophoneData.map((hydrophone, index) => (
                  <TableRow key={hydrophone.hydrophone_id} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <StyledTableCell>{hydrophone.hydrophone_site}</StyledTableCell>
                    <StyledTableCell>{hydrophone.hydrophone_id}</StyledTableCell>
                    <StyledTableCell>{hydrophone.hydrophone_operator_name}</StyledTableCell>
                    <StyledTableCell>{hydrophone.hydrophone_name}</StyledTableCell>
                    <StyledTableCell>{hydrophone.hydrophone_coordinates}</StyledTableCell>
                    <StyledTableCell>{hydrophone.deployment_date}</StyledTableCell>
                    <StyledTableCell>{hydrophone.angle_of_view}</StyledTableCell>
                    <StyledTableCell>{hydrophone.depth}</StyledTableCell>
                    <StyledTableCell>{hydrophone.range}</StyledTableCell>
                    <StyledTableCell>{hydrophone.sampling_frequency}</StyledTableCell>
                    <StyledTableCell>
                      <HydrophoneForm 
                        mode="modify" 
                        onUpdate={fetchHydrophoneData} 
                        hydrophoneData={{
                          "hydrophone_id": hydrophone.hydrophone_id,
                          "hydrophone_operator_id": hydrophone.hydrophone_operator_id,
                          "hydrophone_operator_name": hydrophone.hydrophone_operator_name,
                          "hydrophone_name": hydrophone.hydrophone_name,
                          "hydrophone_site": hydrophone.hydrophone_site,
                          "hydrophone_coordinates": hydrophone.hydrophone_coordinates,
                          "sampling_frequency": hydrophone.sampling_frequency,
                          "depth": hydrophone.depth,
                          "deployment_date": hydrophone.deployment_date,
                          "range": hydrophone.range,
                          "angle_of_view": hydrophone.angle_of_view
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
      );
}