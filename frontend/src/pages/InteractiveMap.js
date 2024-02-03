import React, { useState } from 'react';
import Map from "../components/map";
import Sidebar from '../components/sidebar';
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';

export default function InteractiveMap(){
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