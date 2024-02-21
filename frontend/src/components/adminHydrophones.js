import { styled } from '@mui/material/styles';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';
import CreateHydrophone from './adminSettings/createHydrophone';
import ModifyHydrophone from './adminSettings/modifyHydrophone';
import HydrophoneForm from './adminSettings/hydrophoneForm';

export default function AdminHydrophones(){
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
                  <StyledTableCell>Location</StyledTableCell>
                  <StyledTableCell>Summary</StyledTableCell>
                  <StyledTableCell>Metrics</StyledTableCell>
                  <StyledTableCell>Contact</StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleHydrophoneData.map((hydrophone, index) => (
                  <TableRow key={hydrophone.name} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <TableCell>{hydrophone.name}</TableCell>
                    <TableCell>{hydrophone.coordinates}</TableCell>
                    <TableCell>Summary goes here</TableCell>
                    <TableCell>
                      <div>
                        <p>Public:</p>
                        <ul>
                          {hydrophone.metrics.map((metric, metricIndex) => (
                            <li key={metricIndex}>{metric}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p>Private:</p>
                        <ul>
                          <li>N/A</li>
                        </ul>
                      </div>
                    </TableCell>
                    <TableCell>contact@gmail.com</TableCell>
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