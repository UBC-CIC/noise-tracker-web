import { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import OperatorProfileInformation from '../components/operatorProfileInformation'
import OperatorProfileDownload from '../components/operatorProfileDownload';
import OperatorProfileSettings from '../components/operatorProfileSettings';
import OperatorProfileDirectory from '../components/operatorProfileDirectory';

export default function OperatorProfile(){
    const tabs = ["Information", "Settings", "Download", "Directory"];

    const [selectedTab, setSelectedTab] = useState("Information"); 

    const handleTabChange = (event, newValue) => {
      setSelectedTab(newValue);
    };

    const renderTabContent = () => {
        switch (selectedTab) {
          case 'Information':
            return <OperatorProfileInformation />;
          case 'Settings':
            return <OperatorProfileSettings />;
          case 'Download':
            return <OperatorProfileDownload />;
          case 'Directory':
            return <OperatorProfileDirectory />;
          default:
            return null;
        }
      };

    return(
        <div>
            <div style={{ paddingBottom: '16px' }}>
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