import { Typography } from "@mui/material";
import sampleHydrophoneData from '../sampledata/sampleHydrophoneData';

export default function OperatorProfileSettings(){
    return(
        <div style={{ paddingLeft: '20px' }}>
            <Typography style={{ fontSize: '24px', paddingBottom: '20px' }}>
                View which metrics are shared publicly.
            </Typography>

            {sampleHydrophoneData.map((hydrophone) => (
                <div key={hydrophone.name} style={{ paddingBottom: '20px' }}>
                    <Typography variant="h6">{hydrophone.name}</Typography>
                    <Typography style={{ paddingTop: '10px' }}>Public</Typography>
                    {hydrophone.metrics && hydrophone.metrics.length > 0 ? (
                        <ul>
                            {hydrophone.metrics.map((metric, index) => (
                                <li key={index}>{metric}</li>
                            ))}
                        </ul>
                    ) : (
                        <Typography>No metrics available for this hydrophone</Typography>
                    )}
                    <Typography>Private</Typography>
                    <ul>
                        <li>N/A</li>
                    </ul>
                </div>
            ))}
        </div>
    );
}