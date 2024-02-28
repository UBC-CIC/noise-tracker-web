import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import sampleHOData from "../sampledata/sampleHOData";
import OperatorForm from "./adminSettings/operatorForm";
import axios from "axios";

export default function AdminSettings() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [operatorData, setOperatorData] = useState([]);

  useEffect(() => {
    fetchOperatorData();
  }, []);

  const fetchOperatorData = async () => {
    try{
      const response = await axios.get(
        API_URL + 'operators'
      );

      const data = response.data;
      setOperatorData(data);
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

    return(
        <div style={{
            margin: '3%',
            flex: 1,
            justifyContent: 'center',
          }}>
            <OperatorForm mode="create" />
            <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow style={{ background: '#f2f2f2' }}>
                    <StyledTableCell>Operator</StyledTableCell>
                    <StyledTableCell>Operator ID</StyledTableCell>
                    <StyledTableCell>Hydrophones</StyledTableCell>
                    <StyledTableCell>Contact</StyledTableCell>
                    <StyledTableCell>Edit</StyledTableCell>
                    </TableRow>
                </TableHead>
                {operatorData.map((operator, index) => (
                    <TableRow key={index} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <StyledTableCell>{operator.hydrophone_operator_name}</StyledTableCell>
                    <StyledTableCell>{operator.hydrophone_operator_id}</StyledTableCell>
                    <StyledTableCell>
                        <ul>
                        {operator.hydrophone_info.map((hydrophone) => (
                            <li key={hydrophone}>{hydrophone === '' ? 'N/A' : hydrophone}</li>
                        ))}
                        </ul>
                    </StyledTableCell>
                    <StyledTableCell>{operator.contact_info}</StyledTableCell>
                    <StyledTableCell>
                        <OperatorForm mode="modify" />
                    </StyledTableCell>
                    </TableRow>
                ))}
            </Table>
          </TableContainer>
        </div>
    );
}
