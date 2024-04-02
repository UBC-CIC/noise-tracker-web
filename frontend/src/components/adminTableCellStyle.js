import {TableCell, tableCellClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(() => ({
  '&:first-of-type': { 
    position: 'sticky',
    left: 0,
    backgroundColor: '#f9f9f9',
    zIndex: 1,
  },
  '&:nth-last-of-type(2)': {
    position: 'sticky',
    right: '72px',
    backgroundColor: '#f9f9f9',
    zIndex: 1,
  },
  '&:last-of-type': { 
    position: 'sticky',
    right: 0,
    backgroundColor: '#f9f9f9',
    zIndex: 1,
  },
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#024959',
  }
}));

export default StyledTableCell;