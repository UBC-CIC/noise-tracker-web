import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import sampleHydrophoneData from "../sampledata/sampleHydrophoneData";
import sampleHOData from '../sampledata/sampleHOData';
import axios from 'axios';

export default function OperatorProfileDirectory(){
    const API_URL = process.env.REACT_APP_API_URL;

    const [directoryData, setDirectoryData] = useState([]);

    useEffect(() => {
      fetchDirectoryData();
    }, []);

    const fetchDirectoryData = async () => {
      try{
        const response = await axios.get(
          API_URL + 'operator/operators'
        );

        const data = response.data;
        setDirectoryData(data);
      } 
      
      catch(error){
        console.error("Error fetching directory data: ", error);
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
          <TableContainer component={Paper}>
          <Table>
                <TableHead>
                    <TableRow style={{ background: '#f2f2f2' }}>
                    <StyledTableCell>Operator</StyledTableCell>
                    <StyledTableCell>Hydrophone Names</StyledTableCell>
                    <StyledTableCell>Contact</StyledTableCell>
                    </TableRow>
                </TableHead>
                {directoryData.map((operator, index) => (
                    <TableRow key={index} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <StyledTableCell>{operator.hydrophone_operator_name}</StyledTableCell>
                    <StyledTableCell>
                        <ul>
                        {operator.hydrophone_info.map((hydrophone) => (
                            <li key={hydrophone}>{hydrophone === '' ? 'N/A' : hydrophone}</li>
                        ))}
                        </ul>
                    </StyledTableCell>
                    <StyledTableCell>{operator.contact_info}</StyledTableCell>
                    </TableRow>
                ))}
            </Table>
          </TableContainer>
        </div>
      );
}