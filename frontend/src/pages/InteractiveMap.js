import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Map from "../components/map";
import Sidebar from '../components/sidebar';
import axios from 'axios';

export default function InteractiveMap(){
    const API_URL = process.env.REACT_APP_API_URL;

    const { hydrophoneName, metricName } = useParams();

    const [showSidebar, setShowSidebar] = useState(false);

    const [selectedHydrophone, setSelectedHydrophone] = useState(null);
    const [selectedSpectrogram, setSelectedSpectrogram] = useState(null);
    const [selectedSpl, setSelectedSpl] = useState(null);
    const [selectedGauge, setSelectedGauge] = useState(null);

    const [selectedMetric, setSelectedMetric] = useState(null);
    const [hydrophoneData, setHydrophoneData] = useState([]);
    const [spectrogramData, setSpectrogramData] = useState([]);
    const [splData, setSplData] = useState([]);
    const [gaugeData, setGaugeData] = useState([]);

    const [hydrophoneLoading, setHydrophoneLoading] = useState(true);
    const [spectrogramLoading, setSpectrogramLoading] = useState(true);
    const [splLoading, setSplLoading] = useState(true);
    const [gaugeLoading, setGaugeLoading] = useState(true);

    
    useEffect(() => {
      fetchData('hydrophones', setHydrophoneData, setHydrophoneLoading, 'hydrophone');
      fetchData('spectrograms', setSpectrogramData, setSpectrogramLoading, 'spectrogram');
      fetchData('spl', setSplData, setSplLoading, 'spl');
      fetchData('gauge', setGaugeData, setGaugeLoading, 'gauge');
    }, []);

    const fetchData = async (endpoint, setData, setLoading, errorMessage) => {
      try {
        const response = await axios.get(API_URL + 'public/' + endpoint);
        setData(response.data);
      } catch (error) {
        console.error(`Error fetching ${errorMessage} data: `, error);
      } finally {
        setLoading(false);
      }
    };

    const handleToggleSidebar = (hydrophoneId) => {
        const selectedHydrophone = hydrophoneData.find(hydrophone => hydrophone.hydrophone_id === hydrophoneId);
        
        if (selectedHydrophone) {
          setShowSidebar(true);
          setSelectedHydrophone(selectedHydrophone);
          
          /* const selectedMetric = selectedHydrophone.metrics.includes(metricName) ? metricName : null;

          if (selectedMetric) {
            setSelectedMetric(selectedMetric);
          } */
          
        } 
    };

    const handleCloseSidebar = () => {
        setShowSidebar(false);
    }

    /* useEffect(() => {
      if (hydrophoneName && metricName) {
          handleToggleSidebar(hydrophoneName, metricName);
      }
  }, [hydrophoneName, metricName]); */

    return (
        <div className="interactive-map-container">
          <div className={showSidebar ? "map-container-when-sidebar" : "map-container-no-sidebar"}>
            <Map onToggleSidebar={handleToggleSidebar} hydrophoneData={hydrophoneData} selectedHydrophoneFromProfile={selectedHydrophone}/>
          </div>
          {showSidebar && 
            <Sidebar 
            onCloseSidebar={handleCloseSidebar} 
            hydrophoneData={selectedHydrophone} 
            hydrophoneLoading={hydrophoneLoading} 
            spectrogramData={spectrogramData} 
            spectrogramLoading={spectrogramLoading} 
            splData={splData}
            splLoading={splLoading}
            gaugeData={gaugeData}
            gaugeLoading={gaugeLoading}
            selectedMetric={selectedMetric} 
          />}
        </div>
      );      
}