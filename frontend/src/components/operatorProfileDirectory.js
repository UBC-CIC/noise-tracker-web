import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

export default function OperatorProfileDirectory({ jwt }){
    const API_URL = process.env.REACT_APP_API_URL;

    const [directoryData, setDirectoryData] = useState([]);
    const [loading, setLoading] = useState(false); // State to track loading status

    useEffect(() => {
      setLoading(true); // Set loading to true when data fetching starts
      fetchDirectoryData();
    }, []);

    const fetchDirectoryData = async () => {
      try{
        const response = await axios.get(
          API_URL + 'operator/operators',
          {
            headers: {
              'Authorization': jwt
            }
          }
        );

        const data = response.data;
        // Sort operator data alphabetically by operator organization names
        data.sort((a, b) => (a.hydrophone_operator_name > b.hydrophone_operator_name) ? 1 : -1);
        setDirectoryData(data);
      } 
      
      catch(error){
        console.error("Error fetching directory data: ", error);
      }
      finally {
        setLoading(false); // Set loading to false when data fetching completes 
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
          {loading ? ( // Render circular progress if loading is true
                <center>
                    <CircularProgress color="success" />
                </center>
          ) : (
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
                      <StyledTableCell>{operator.contact_email}</StyledTableCell>
                      </TableRow>
                  ))}
              </Table>
            </TableContainer>
          )}
        </div>
      );
}