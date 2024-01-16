import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Button, Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';

const hydrophoneIcon = new Icon({
  iconUrl: require("./hydrophoneIcon.png"),
  iconSize: [35,35]
})

export default function Map({ onToggleSidebar, hydrophoneData }) {
  const position = [49.2608724, -123.113952]; // Initial map position

  const handleAnalyticsButtonClick = (hydrophoneName) => {
    onToggleSidebar(hydrophoneName);
  };

  return (
    <MapContainer center={position} zoom={7} style={{ flex: 1, height: '100vh' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {hydrophoneData.map((hydrophone, index) => (
      <Marker key={index} position={hydrophone.coordinates} icon={hydrophoneIcon}>
        <Popup>
          <Typography style={{ textAlign: 'center' }}>{hydrophone.name}</Typography>
          <Typography variant="caption">Last updated: {hydrophone.lastUpdated}</Typography>
          <Button onClick={() => handleAnalyticsButtonClick(hydrophone.name)} style={{ display: 'block', margin: 'auto' }}>View Analytics</Button>
        </Popup>
      </Marker>
    ))}
    </MapContainer>
  );
};

