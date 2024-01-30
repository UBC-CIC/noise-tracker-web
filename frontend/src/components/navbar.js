import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const pages = ["Map", "About", "Education Hub", "Login"];
const loggedInPages = ["Map", "About", "Education Hub", "Operator Profile", "Signout"]; 

const NavBar = ({ loginStatus }) => {
  const tabs = loginStatus ? loggedInPages : pages;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          NoiseTracker
        </Typography>
        {tabs.map((tab, index) => (
          <Button
            key={index}
            color="inherit"
            component={Link}
            to={`/${tab.toLowerCase()}`}
          >
            {tab}
          </Button>
        ))}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
