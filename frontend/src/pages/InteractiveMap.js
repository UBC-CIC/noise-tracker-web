import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Map from "../components/map";
import Sidebar from '../components/sidebar';
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';

export default function InteractiveMap(){
    const { hydrophoneName, metricName } = useParams();

    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedHydrophone, setSelectedHydrophone] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState(null);

    const handleToggleSidebar = (hydrophoneName) => {
        const selectedHydrophone = sampleHydrophoneData.find(hydrophone => hydrophone.name === hydrophoneName);
        
        if (selectedHydrophone) {
          setShowSidebar(true);
          setSelectedHydrophone(selectedHydrophone);
          
          const selectedMetric = selectedHydrophone.metrics.includes(metricName) ? metricName : null;

          if (selectedMetric) {
            setSelectedMetric(selectedMetric);
          }
          
        } 
    };

    const handleCloseSidebar = () => {
        setShowSidebar(false);
    }

    useEffect(() => {
      if (hydrophoneName && metricName) {
          handleToggleSidebar(hydrophoneName, metricName);
      }
  }, [hydrophoneName, metricName]);

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
          <div style={{ flex: showSidebar ? '1' : '100%', height: '100%' }}>
            <Map onToggleSidebar={handleToggleSidebar} hydrophoneData={sampleHydrophoneData} selectedHydrophoneFromProfile={selectedHydrophone}/>
          </div>
          {showSidebar && <Sidebar onCloseSidebar={handleCloseSidebar} hydrophoneData={selectedHydrophone} selectedMetric={selectedMetric} />}
        </div>
      );      
}