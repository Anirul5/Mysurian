import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="static" sx={{boxShadow: 'none', padding: '0 25px', backgroundColor: '#fff'}}>
      <Toolbar>
        <Button variant="h6" component={Link} to="/"  color="inherit">
          Mysurian
        </Button>
        <Typography variant="h6" sx={{ flexGrow: 1 }} />
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/gyms">
          Gyms
        </Button>
        <Button color="inherit" component={Link} to="/hotels">
          Hotels
        </Button>
        <Button color="inherit" component={Link} to="/restaurants">
          Restaurants
        </Button> 
        <Button color="inherit" component={Link} to="/events">
          Events     
        </Button>
      </Toolbar>
    </AppBar>
  );
}