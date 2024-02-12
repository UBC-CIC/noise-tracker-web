import { Typography } from "@mui/material";
import sampleHydrophoneData from "../sampledata/sampleHydrophoneData";

export default function AdminSettings(){
    return(
        <div style={{ padding: '20px' }}>
            <Typography style={{ fontSize: '24px', paddingBottom: '20px' }}>
                Manage Hydrophone Operators and Hydrophones.
            </Typography>
        </div>
    );
}