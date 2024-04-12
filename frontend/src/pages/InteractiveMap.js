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
    const [selectedSpectrogram, setSelectedSpectrogram] = useState(null);
    const [selectedSpl, setSelectedSpl] = useState(null);

    const [selectedMetric, setSelectedMetric] = useState(null);
    const [hydrophoneData, setHydrophoneData] = useState([]);
    const [spectrogramData, setSpectrogramData] = useState([]);
    const [splData, setSplData] = useState([]);

    useEffect(() => {
      fetchHydrophoneData();
      fetchSpectrogramData();
      fetchSplData();
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

    const fetchSpectrogramData = async () => {
      try{
        const response = await axios.get(
          API_URL + 'public/spectrograms',
        );

        const data = response.data;

        setSpectrogramData(data);
      } 
      
      catch(error){
        console.error("Error fetching spectrogram data: ", error);
      } 
    }

    const fetchSplData = async () => {
      try{
        const response = await axios.get(
          API_URL + 'public/spl',
        );

        const data = response.data;

        setSplData(data);
      } 
      
      catch(error){
        console.error("Error fetching spl data: ", error);
      } 
    }


    const handleToggleSidebar = (hydrophoneId) => {
        const selectedHydrophone = hydrophoneData.find(hydrophone => hydrophone.hydrophone_id === hydrophoneId);
        const selectedSpectrogram = spectrogramData.find(spectrogram => spectrogram.hydrophone_id === hydrophoneId);
        const selectedSpl = splData.find(spl => spl.hydrophone_id === hydrophoneId);
        
        if (selectedHydrophone) {
          setShowSidebar(true);
          setSelectedHydrophone(selectedHydrophone);
          setSelectedSpectrogram(selectedSpectrogram);
          setSelectedSpl(selectedSpl);
          
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
              spectrogramData={selectedSpectrogram} 
              splData={selectedSpl}
              selectedMetric={selectedMetric} 
            />}
        </div>
      );      
}