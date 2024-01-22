import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';

export default function OceanMap({ onToggleSidebar, hydrophoneData }){
    const mapRef = useRef();

  useEffect(() => {
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/Graphic', 'esri/geometry/Point', 'esri/Basemap'], { css: true })
      .then(([Map, MapView, Graphic, Point, Basemap]) => {
        const basemap = new Basemap({
            portalItem: {
              id: "67ab7f7c535c4687b6518e6d2343e8a2"  // Oceans webmap
            }
          });

        const map = new Map({
          basemap: basemap // Use the basemap 
        });

        const view = new MapView({
          container: mapRef.current,
          map,
          center: [-123.113952, 49.2608724], // set initial center
          zoom: 8 // set initial zoom
        });

        hydrophoneData.forEach((hydrophone) => {
          // Create a point geometry for the icon
          const point = new Point({
              longitude: hydrophone.coordinates[1],
              latitude: hydrophone.coordinates[0]
            });
    
            // Create a symbol for the icon (you can use your own custom icon)
            const symbol = {
              type: 'simple-marker',
              color: 'blue',
              size: '20px',
              outline: {
                color: 'white',
                width: 2
              },
              cursor: 'pointer'
            };
    
            // Create a graphic using the point and symbol
            const graphic = new Graphic({
              geometry: point,
              symbol: symbol
            });
    
            // Add the graphic to the map
            view.graphics.add(graphic);

            // Add hover and click event listeners to the graphic
            view.on('click', (event) => handleIconClick(event, graphic, view));
            view.on('pointer-move', (event) => handleIconHover(event, graphic, view));
      });
      })
      .catch((err) => console.error(err));
  }, []);

  // Function to handle icon click
  const handleIconClick = (event, graphic, view) => {
    // Use view.hitTest to find intersected graphics
    view.hitTest(event).then((response) => {
      const clickedGraphics = response.results;

      if (clickedGraphics.length > 0 && clickedGraphics[0].graphic === graphic) {
        // Get the hydrophone data associated with the clicked graphic
        const clickedHydrophoneData = hydrophoneData.find((hydrophone) =>
        hydrophone.coordinates[0] === graphic.geometry.latitude &&
        hydrophone.coordinates[1] === graphic.geometry.longitude
        );

      if (clickedHydrophoneData) {
        onToggleSidebar(clickedHydrophoneData.name);
        // Log hydrophone data
        console.log("Hydrophone Data: ", clickedHydrophoneData);
      }

        // Get the geometry of the clicked graphic
        const clickedGeometry = clickedGraphics[0].graphic.geometry;

        // Zoom to the extent of the clicked graphic
        view.goTo({
          target: clickedGeometry,
          zoom: 10 // You can adjust the zoom level as needed
        });
      }
    });
  };

  // Function to handle icon hover
  const handleIconHover = (event, graphic, view) => {
    // Use view.hitTest to find intersected graphics
    view.hitTest(event).then((response) => {
      const hoveredGraphics = response.results;

      if (hoveredGraphics.length > 0) {
        // Set cursor to 'pointer' when hovering over the graphic
        mapRef.current.style.cursor = 'pointer';
      } else {
        // Set cursor back to default when not hovering over the graphic
        mapRef.current.style.cursor = 'default';
      }
    });
  };

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};
