import { Typography } from "@mui/material";
import GaugeChart from 'react-gauge-chart'

export default function SidebarOverview(){
    return(
        <div>
            <GaugeChart id="gauge-chart1" 
                nrOfLevels={10} 
                percent={0.86} 
                textColor="#000000"
            />
            <Typography style={{ paddingTop: '10px', paddingBottom: '20px' }}>
                Latest broadband noise level of 68 dB (re 1uPa) is louder than 86% of recordings for the past month. 
                The term broadband refers to the full range of frequencies that this hydrophone can record.
            </Typography>

            <GaugeChart id="gauge-chart2" 
            nrOfLevels={10} 
            percent={0.43} 
            textColor="#000000"
            marginInPercent={0.08}
            />
            <Typography>10-100Hz</Typography>
            <Typography style={{ paddingTop: '10px', paddingBottom: '20px' }}>
            This is the typical communication range for larger baleen whale species such as fin whales. 
            The latest noise level of  91 dB (re 1uPa) is louder than 60% of recordings within this frequency band for the past month.
            </Typography>

            <GaugeChart id="gauge-chart3" 
            nrOfLevels={10} 
            percent={0.65} 
            textColor="#000000"
            marginInPercent={0.08}
            />
            <Typography>100-1000Hz</Typography>
            <Typography style={{ paddingTop: '10px', paddingBottom: '20px' }}>
            This is the typical communication range for smaller baleen whale species such as humpback whales. 
            The latest noise level of  65 dB (re 1uPa) is louder than 65% of recordings within this frequency band for the past month.
            </Typography>

            <GaugeChart id="gauge-chart4" 
            nrOfLevels={10} 
            percent={0.71} 
            textColor="#000000"
            marginInPercent={0.08}
            />
            <Typography>0.5-15kHz</Typography>
            <Typography style={{ paddingTop: '10px', paddingBottom: '20px' }}>
            This is the typical communication range for larger dolphin species such as killer whales. 
            The latest noise level of  47 dB (re 1uPa) is louder than 71% of recordings within this frequency band for the past month.
            </Typography>

            <GaugeChart id="gauge-chart5" 
            nrOfLevels={10} 
            percent={0.52} 
            textColor="#000000"
            marginInPercent={0.08}
            />
            <Typography>15-150kHz</Typography>
            <Typography style={{ paddingTop: '10px', paddingBottom: '20px' }}>
            This is the typical echolocation range for larger dolphin species such as killer whales, and the communication range for smaller dolphin and porpoise species. 
            The latest noise level of  38 dB (re 1uPa) is louder than 52% of recordings within this frequency band for the past month.
            </Typography>

            <Typography style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            Note: This hydrophone has a recording frequency range of (lower limit Hz) to (upper limit kHz).
            </Typography>
            <Typography style={{ paddingBottom: '20px' }}>
            Learn more about understanding decibels and frequency ranges in our Education Hub.
            </Typography>
        </div>
    );
}