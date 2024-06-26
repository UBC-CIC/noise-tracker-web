import { useState } from "react";
import { Typography } from "@mui/material"
import AdminSidebar from "../components/adminSidebar"
import AdminGeneral from "../components/adminGeneral";
import AdminHydrophones from "../components/adminHydrophones";
import AdminSettings from "../components/adminSettings";

export default function AdminDashboard({ jwt }){
    const [selectedOption, setSelectedOption] = useState('general');

    const handleButtonClick = (option) => {
        setSelectedOption(option);
    };

    return(
        <div className="admin-dashboard-container">
            <AdminSidebar onButtonClick={handleButtonClick}/>

            <div className="admin-dashboard-content">
                {selectedOption === 'general' && <AdminGeneral />}
                {selectedOption === 'hydrophones' && <AdminHydrophones jwt={jwt} />}
                {selectedOption === 'operators' && <AdminSettings jwt={jwt} />}
            </div>
        </div>
    )
}