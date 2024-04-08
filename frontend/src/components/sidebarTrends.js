import { Typography } from "@mui/material";

export default function SidebarTrends(){
    return(
        <div style={{ paddingLeft: '20px' }}>
            <Typography className="sidebar-typography-padding">
            Longer-term noise trends will become available in the coming months.
            </Typography>
            <Typography className="sidebar-typography-padding">
                <strong>Learn more about tracking underwater noise trends in our Education Hub.</strong>
            </Typography>
        </div>
    );
}