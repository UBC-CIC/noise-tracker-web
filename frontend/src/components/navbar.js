import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';

const pages = ["Map", "About", "Education Hub", "Login"];
const loggedInPages = {
  OPERATOR_USER: ["Map", "About", "Education Hub", "Operator Profile", "Signout"],
  ADMIN_USER: ["Map", "About", "Education Hub", "Admin", "Signout"]
}; 
const NavBar = ({ loginStatus, group }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const tabs = loginStatus ? loggedInPages[group] || [] : pages;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <List>
      {tabs.map((tab, index) => (
        <ListItem key={index} component={Link} to={`/${tab.toLowerCase().replace(/\s+/g, '')}`}>
          <ListItemText primary={tab}/>
        </ListItem>
      ))}
    </List>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          NoiseTracker
        </Typography>
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              variant="temporary"
              anchor="right"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
            >
              {drawer}
            </Drawer>
          </>
        ) : (
          tabs.map((tab, index) => (
            <Button
              key={index}
              color="inherit"
              component={Link}
              to={`/${tab.toLowerCase().replace(/\s+/g, '')}`}
            >
              {tab}
            </Button>
          ))
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
