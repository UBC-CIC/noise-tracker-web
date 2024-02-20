import { styled } from '@mui/material/styles';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import sampleHydrophoneData from "../sampledata/sampleHydrophoneData";
import sampleHOData from '../sampledata/sampleHOData';

export default function OperatorProfileDirectory(){
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
                    </TableRow>
                ))}
            </Table>
          </TableContainer>
        </div>
      );
}