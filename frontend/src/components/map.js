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

  const handleIconClick = (hydrophone, map) => {
    const zoomLevel = 9;

    onToggleSidebar(hydrophone.name);
    map.flyTo(hydrophone.coordinates, zoomLevel);
  };

  return (
    <MapContainer center={position} zoom={7} style={{ flex: 1, height: '100vh' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {hydrophoneData.map((hydrophone, index) => (
        <Marker
          key={index}
          position={hydrophone.coordinates}
          icon={hydrophoneIcon}
          eventHandlers={{
            click: (e) => handleIconClick(hydrophone, e.target._map),
          }}
        >
        </Marker>
      ))}
    </MapContainer>
  );
};

