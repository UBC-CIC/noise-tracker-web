import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, AttributionControl } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Popup from './popup';

const hydrophoneIcon = new Icon({
  iconUrl: require("./images/hydrophoneIcon.png"),
  iconSize: [35,35]
})

const hydrophoneIconSelected = new Icon({
  iconUrl: require("./images/hydrophoneIconSelected.png"),
  iconSize: [35,35]
})

export default function Map({ onToggleSidebar, hydrophoneData, selectedHydrophoneFromProfile }) {
  const [selectedHydrophone, setSelectedHydrophone] = useState(null);

  const initialPosition = [49.2608724, -123.113952]; // Initial map position
  const initialZoom = 7;

  const handleIconClick = (hydrophone, map) => {
    // Update the selected hydrophone
    setSelectedHydrophone(hydrophone.site)

    // Icon zoom level
    const zoomLevel = 9;

    // Get current map zoom level
    const currentZoomLevel = map.getZoom();

    const sidebarPercentage = 0.35;

    // Determine the difference between current and icon zoom level
    const zoomDifference = zoomLevel - currentZoomLevel;

    // Determine if the map will have to zoom in or zoom out to reach icon zoom level
    const zoomIn = zoomDifference >= 0 ? true : false;

    // Get the bounds of the visible map area
    const bounds = map.getBounds();

    // Get the current total longitude (width) of the map 
    const westLongitude = bounds.getWest();
    const eastLongitude = bounds.getEast();
    const currentTotalLongitude = Math.abs(westLongitude - eastLongitude);
    
    // Get the toal longitude (width) of the map at the desired zoom level  
    const zoomAdjustedTotalLongitude = zoomIn ? currentTotalLongitude/(2**zoomDifference) : currentTotalLongitude*(2**Math.abs(zoomDifference));

    // Calculate the adjusted longitude based on the sidebar width
    const adjustedLongitude = parseFloat(hydrophone.coordinates.split(', ')[1]) + (zoomAdjustedTotalLongitude*(sidebarPercentage/2));

    // Update the coordinates with the adjusted longitude
    const adjustedCoordinates = [hydrophone.coordinates.split(', ')[0], adjustedLongitude];

    // Zoom in on icon
    map.flyTo(adjustedCoordinates, zoomLevel);

    // Open sidebar
    onToggleSidebar(hydrophone.site);
  };

/*   useEffect(() => {
    if (selectedHydrophoneFromProfile){
      setSelectedHydrophone(selectedHydrophoneFromProfile.name);
    }
    console.log("Selected hydrophone MAP: ", selectedHydrophone);
  }, [selectedHydrophoneFromProfile]);  */


  return (
    <div>
      <MapContainer center={initialPosition} zoom={initialZoom} className="map-container" attributionControl={false} maxZoom={13}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}        "
          attribution='CHS, Esri, GEBCO, Garmin, NaturalVue | CHS, Esri, GEBCO, Garmin, NGS'
        />
        <AttributionControl position="bottomright"/>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}        "
        />
        {hydrophoneData.map((hydrophone, index) => (
          <Marker
            key={index}
            position={hydrophone.coordinates.split(', ')}
            icon={hydrophone.site === selectedHydrophone ? hydrophoneIconSelected : hydrophoneIcon}
            eventHandlers={{
              click: (e) => handleIconClick(hydrophone, e.target._map),
            }}
          >
          </Marker>
        ))}
      </MapContainer>
      <Popup />
    </div>
  );
};
