import { styled } from '@mui/material/styles';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';

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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ background: '#f2f2f2' }}>
                  <StyledTableCell>Hydrophone</StyledTableCell>
                  <StyledTableCell>Location</StyledTableCell>
                  <StyledTableCell>Summary</StyledTableCell>
                  <StyledTableCell>Metrics</StyledTableCell>
                  <StyledTableCell>Contact</StyledTableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      );
}