import React, { useState } from 'react';
import Map from "../components/map";
import Sidebar from '../components/sidebar';

export default function InteractiveMap(){
    const sampleHydrophoneData = [{"name": "Hydrophone 1", "coordinates":[49.2608724, -123.113952], "lastUpdated": "January 10, 2024", "metrics": ["Sound Levels", "Spectral Averages", "Trends", "Station Information"]},
                                    {"name": "Hydrophone 2", "coordinates":[49.693333, -124.810168], "lastUpdated": "January 11, 2024", "metrics": ["Sound Levels", "Spectral Averages", "Trends", "Station Information"]},
                                    {"name": "Hydrophone 3", "coordinates":[50.693333, -125.810168], "lastUpdated": "January 9, 2024", "metrics": ["Sound Levels", "Spectral Averages", "Trends", "Station Information"]}]

    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedHydrophone, setSelectedHydrophone] = useState(null);

    const handleToggleSidebar = (hydrophoneName) => {
        const selectedHydrophone = sampleHydrophoneData.find(hydrophone => hydrophone.name === hydrophoneName);
        setShowSidebar(true);
        setSelectedHydrophone(selectedHydrophone);
    };

    const handleCloseSidebar = () => {
        setShowSidebar(false);
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
          <div style={{ flex: showSidebar ? '1' : '100%', height: '100%' }}>
            <Map onToggleSidebar={handleToggleSidebar} hydrophoneData={sampleHydrophoneData} />
          </div>
          {showSidebar && <Sidebar onCloseSidebar={handleCloseSidebar} hydrophoneData={selectedHydrophone} />}
        </div>
      );      
}