
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';
import HydrophoneForm from './adminSettings/hydrophoneForm';
import axios from 'axios';

export default function AdminHydrophones(){
    const API_URL = process.env.REACT_APP_API_URL;

    const [hydrophoneData, setHydrophoneData] = useState([]);

    useEffect(() => {
      fetchHydrophoneData();
    }, []);

    const fetchHydrophoneData = async () => {
      try{
        const response = await axios.get(
          API_URL + 'hydrophones'
        );

        const data = response.data;
        setHydrophoneData(data);
      } 
      
      catch(error){
        console.error("Error fetching hydrophone data: ", error);
      }
    }


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
          <HydrophoneForm mode="create" />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ background: '#f2f2f2' }}>
                  <StyledTableCell>Hydrophone</StyledTableCell>
                  <StyledTableCell>Hydrophone ID</StyledTableCell>
                  <StyledTableCell>Model</StyledTableCell>
                  <StyledTableCell>Coordinates</StyledTableCell>
                  <StyledTableCell>Deployment Date</StyledTableCell>
                  <StyledTableCell>Angle of View (°)</StyledTableCell>
                  <StyledTableCell>Depth (m)</StyledTableCell>
                  <StyledTableCell>Range (m)</StyledTableCell>
                  <StyledTableCell>Sampling Frequency</StyledTableCell>
                  <StyledTableCell>Edit</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hydrophoneData.map((hydrophone, index) => (
                  <TableRow key={hydrophone.hydrophone_name} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <TableCell>{hydrophone.hydrophone_site}</TableCell>
                    <TableCell>{hydrophone.hydrophone_id}</TableCell>
                    <TableCell>{hydrophone.hydrophone_name}</TableCell>
                    <TableCell>{hydrophone.hydrophone_coordinates}</TableCell>
                    <TableCell>{hydrophone.deployment_date}</TableCell>
                    <TableCell>{hydrophone.angle_of_view}</TableCell>
                    <TableCell>{hydrophone.depth}</TableCell>
                    <TableCell>{hydrophone.range}</TableCell>
                    <TableCell>{hydrophone.sampling_frequency}</TableCell>
                    <TableCell>
                      <HydrophoneForm mode="modify" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      );
}