import { useState, useEffect } from 'react';
import { Table, TableContainer, TableHead, TableRow, Paper, CircularProgress, TableBody } from '@mui/material';
import OperatorForm from "./adminSettings/operatorForm";
import DeleteForm from './adminSettings/deleteForm';
import axios from "axios";
import StyledTableCell from './adminTableCellStyle';

export default function AdminSettings({ jwt }) {
  const API_URL = process.env.REACT_APP_API_URL;

  const [operatorData, setOperatorData] = useState([]);
  const [loading, setLoading] = useState(false); // State to track loading status

  useEffect(() => {
    setLoading(true); // Set loading to true when data fetching starts
    fetchOperatorData();
  }, []);

  const fetchOperatorData = async () => {
    try{
      const response = await axios.get(
        API_URL + 'admin/operators',
        {
          headers: {
            'Authorization': jwt
          }
        }
      );

      const data = response.data;
      // Sort operator data alphabetically by operator organization names
      data.sort((a, b) => (a.hydrophone_operator_name > b.hydrophone_operator_name) ? 1 : -1);
      setOperatorData(data);
    } 
    
    catch(error){
      console.error("Error fetching hydrophone data: ", error);
    }
    finally {
      setLoading(false); // Set loading to false when data fetching completes 
    }
  }

    

    return(
        <div className="admin-content-area">
            <OperatorForm mode="create" onUpdate={fetchOperatorData} jwt={jwt} />
            {loading ? ( // Render circular progress if loading is true
                <center>
                    <CircularProgress color="success" />
                </center>
            ) : (
              <TableContainer component={Paper}>
              <Table>
                  <TableHead>
                      <TableRow>
                      <StyledTableCell>Organization</StyledTableCell>
                      <StyledTableCell>Operator ID</StyledTableCell>
                      <StyledTableCell>Hydrophones</StyledTableCell>
                      <StyledTableCell>Contact Name</StyledTableCell>
                      <StyledTableCell>Contact Email</StyledTableCell>
                      <StyledTableCell>Organization Website</StyledTableCell>
                      <StyledTableCell>Opted in to Directory</StyledTableCell>
                      <StyledTableCell>Edit</StyledTableCell>
                      <StyledTableCell>Delete</StyledTableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
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
                        <StyledTableCell>{operator.contact_name}</StyledTableCell>
                        <StyledTableCell>{operator.contact_email}</StyledTableCell>
                        <StyledTableCell>{operator.website}</StyledTableCell>
                        <StyledTableCell>{operator.in_directory ? 'Yes' : 'No'}</StyledTableCell>
                        <StyledTableCell>
                            <OperatorForm 
                              mode="modify" 
                              onUpdate={fetchOperatorData}
                              operatorData={{
                                "hydrophone_operator_id": operator.hydrophone_operator_id,
                                "hydrophone_operator_name": operator.hydrophone_operator_name, 
                                "contact_name": operator.contact_name,
                                "contact_email": operator.contact_email,
                                "website": operator.website,
                                "in_directory": operator.in_directory,
                              }}
                              jwt={jwt}
                            />
                        </StyledTableCell>
                        <StyledTableCell>
                            <DeleteForm 
                              mode="operator" 
                              itemId={operator.hydrophone_operator_id} 
                              onDelete={fetchOperatorData}
                              jwt={jwt}/>
                        </StyledTableCell>
                        </TableRow>
                    ))}
                  </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
    );
}
