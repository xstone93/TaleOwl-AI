// src/components/HamburgerMenu.js
import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const HamburgerMenu = ({ isAudioEnabled, toggleAudio, onBookListClick }) => { // Add onBookListClick prop
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div>
      <IconButton
        onClick={toggleDrawer}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'brown',
          border: '2px solid brown',
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <div style={{ width: 250, padding: 20 }}>
          <h2>Einstellungen</h2>
        </div>

        <div style={{ width: 250, padding: 20 }}>
          <FormControlLabel
            control={<Switch checked={isAudioEnabled} onChange={toggleAudio} />}
            label="Audioausgabe"
          />
          <button style={buttonStyle} onClick={onBookListClick}>Bibliothek</button>
        </div>
      </Drawer>
    </div>
  );
};

const buttonStyle = { // Add button style
  marginTop: '30px',
  padding: '10px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',

  // align the button center
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',


};

export default HamburgerMenu;
