import { useState, useEffect } from 'react';
import { Tabs, Tab } from '@mui/material';
import axios from 'axios';
import OperatorProfileInformation from '../components/operatorProfileInformation'
import OperatorProfileDownload from '../components/operatorProfileDownload';
import OperatorProfileDirectory from '../components/operatorProfileDirectory';

export default function OperatorProfile({ jwt }){
    const API_URL = process.env.REACT_APP_API_URL;

    const tabs = ["Information", "Download", "Directory"];

    const [selectedTab, setSelectedTab] = useState("Information"); 

    const [hydrophoneData, setHydrophoneData] = useState([]);

    // States to track loading statuses
    const [loadingHydrophoneData, setLoadingHydrophoneData] = useState(true); 

    useEffect(() => {
        fetchHydrophoneData();
      }, []);
  
    const fetchHydrophoneData = async () => {
      try{
          setLoadingHydrophoneData(true);

          const response = await axios.get(
          API_URL + 'operator/hydrophones',
          {
              headers: {
              'Authorization': jwt
              }
          }
          );

          const data = response.data;
          console.log(data);
          setHydrophoneData(data);
      }
      catch(error){
        console.error("Error fetching hydrophone data: ", error);
      } 
      finally {
          setLoadingHydrophoneData(false); // Set loading to false when data fetching completes 
      }
    } 

    const handleTabChange = (event, newValue) => {
      setSelectedTab(newValue);
    };

    const renderTabContent = () => {
        switch (selectedTab) {
          case 'Information':
            return <OperatorProfileInformation jwt={jwt} hydrophoneData={hydrophoneData} loading={loadingHydrophoneData} />;
          case 'Download':
            return <OperatorProfileDownload jwt={jwt} hydrophoneData={hydrophoneData} loading={loadingHydrophoneData} />;
          case 'Directory':
            return <OperatorProfileDirectory jwt={jwt} />;
          default:
            return null;
        }
      };

    return(
        <div>
            <div className="operator-profile-tabs">
                <Tabs value={selectedTab} onChange={handleTabChange}>
                    {tabs.map((tab, index) => (
                        <Tab key={index} label={tab} value={tab} />
                    ))}
                </Tabs>
            </div>
            {renderTabContent()}
        </div>
    );
}