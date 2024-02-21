import React from "react";
import { Typography, TextField, Button } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import sampleHydrophoneData from "../sampledata/sampleHydrophoneData";
import sampleHOData from "../sampledata/sampleHOData";
import CreateOperator from "./adminSettings/createOperator";
import ModifyOperator from "./adminSettings/modifyOperator";
import OperatorForm from "./adminSettings/operatorForm";
import { useState } from "react";

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
