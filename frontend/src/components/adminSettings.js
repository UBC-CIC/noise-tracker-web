import React from "react";
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import sampleHOData from "../sampledata/sampleHOData";
import OperatorForm from "./adminSettings/operatorForm";

export default function AdminSettings() {
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
                    <StyledTableCell>Hydrophone Names</StyledTableCell>
                    <StyledTableCell>Contact</StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    </TableRow>
                </TableHead>
                {sampleHOData.map((operatorData, index) => (
                    <TableRow key={index} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <StyledTableCell>{operatorData.operator}</StyledTableCell>
                    <StyledTableCell>
                        <ul>
                        {operatorData.hydrophones.map((hydrophone) => (
                            <li key={hydrophone.name}>{hydrophone.name}</li>
                        ))}
                        </ul>
                    </StyledTableCell>
                    <StyledTableCell>{operatorData.contact}</StyledTableCell>
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
