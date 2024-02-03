import { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import OperatorProfileInformation from '../components/operatorProfileInformation'

export default function OperatorProfile(){
    const tabs = ["Information", "Settings", "Download"];

    const [selectedTab, setSelectedTab] = useState("Information"); 

    const handleTabChange = (event, newValue) => {
      setSelectedTab(newValue);
    };

    const renderTabContent = () => {
        switch (selectedTab) {
          case 'Information':
            return <OperatorProfileInformation />;
          case 'Settings':
            return;
          case 'Download':
            return null;
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