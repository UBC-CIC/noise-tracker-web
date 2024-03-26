import { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import OperatorProfileInformation from '../components/operatorProfileInformation'
import OperatorProfileDownload from '../components/operatorProfileDownload';
import OperatorProfileSettings from '../components/operatorProfileSettings';
import OperatorProfileDirectory from '../components/operatorProfileDirectory';

export default function OperatorProfile({ jwt }){
    const tabs = ["Information", "Settings", "Download", "Directory"];

    const [selectedTab, setSelectedTab] = useState("Information"); 

    const handleTabChange = (event, newValue) => {
      setSelectedTab(newValue);
    };

    const renderTabContent = () => {
        switch (selectedTab) {
          case 'Information':
            return <OperatorProfileInformation jwt={jwt} />;
          case 'Settings':
            return <OperatorProfileSettings jwt={jwt} />;
          case 'Download':
            return <OperatorProfileDownload jwt={jwt} />;
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