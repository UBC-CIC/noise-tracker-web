import { createTheme } from '@mui/material/styles';

const primaryColor = '#4B9690';
const secondaryColor = '#0c4850';

const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor
    },
    secondary: {
      main: secondaryColor
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: secondaryColor,
          color: '#fff',
        },
        body: {
          fontSize: '14px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: primaryColor,
          color: '#fff',
          '&:hover': {
            backgroundColor: '#3a6f73', // Darker primary color when hovering
          },
        },
        outlined: {
          // Override styles for the outlined variant
          borderColor: '#fff', 
          backgroundColor: '#fff', 
          color: primaryColor,
          '&:hover': {
            backgroundColor: '#fff', 
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxSizing: 'border-box',
          width: '60%'
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: primaryColor,
          color: '#fff',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: primaryColor
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: primaryColor
          },
        },
      },
    },
  },
});

export default theme;