import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6', // A nice blue
    },
    secondary: {
      main: '#19857b', // A teal color
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f4f6f8', // Lighter grey background
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#333',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded corners for cards
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Subtle shadow
        },
      },
    },
     MuiCardHeader: {
       styleOverrides: {
         title: {
           fontWeight: 600, // Bolder card titles
         },
       },
     },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Match card rounding
          textTransform: 'none', // Keep button text capitalization as is
        },
      },
    },
  },
});

export default theme; 