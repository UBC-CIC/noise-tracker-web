import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Map from "../components/map";
import Sidebar from '../components/sidebar';
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';
import axios from 'axios';

export default function InteractiveMap(){
    const API_URL = process.env.REACT_APP_API_URL;

    const { hydrophoneName, metricName } = useParams();

    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedHydrophone, setSelectedHydrophone] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [hydrophoneData, setHydrophoneData] = useState([]);

    useEffect(() => {
      fetchHydrophoneData();
    }, []);

    const fetchHydrophoneData = async () => {
      try{
        const response = await axios.get(
          API_URL + 'public/hydrophones',
        );

        const data = response.data;

        setHydrophoneData(data);
      } 
      
      catch(error){
        console.error("Error fetching hydrophone data: ", error);
      } 
    }


    const handleToggleSidebar = (hydrophoneName) => {
        const selectedHydrophone = hydrophoneData.find(hydrophone => hydrophone.site === hydrophoneName);
        
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
          {showSidebar && <Sidebar onCloseSidebar={handleCloseSidebar} hydrophoneData={selectedHydrophone} selectedMetric={selectedMetric} />}
        </div>
      );      
}