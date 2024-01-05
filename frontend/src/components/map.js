import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Button, Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';

const hydrophoneIcon = new Icon({
  iconUrl: require("./hydrophoneIcon.png"),
  iconSize: [35,35]
})

export default function Map() {
  const position = [49.2608724, -123.113952]; // Initial map position

  return (
    <MapContainer center={position} zoom={7} style={{ flex: 1 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} icon={hydrophoneIcon}> 
        <Popup>
          <Typography>Hydrophone</Typography>
          <Button>View Analytics</Button>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

