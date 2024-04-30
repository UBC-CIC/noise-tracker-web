import { Typography, CircularProgress } from "@mui/material";
import GaugeChart from 'react-gauge-chart'

export default function SidebarOverview({ gaugeData, gaugeLoading }){
    if ((!gaugeData || !gaugeData.average_spl) && !gaugeLoading) {
        return (
        <div>
            <Typography Typography className='sidebar-typography-padding'>No Recent Sound Pressure Level Data Available</Typography>
        </div>
        );
    }

    const processData = () => {
        if (!gaugeData) return [];
    
        const resultsArray = [];
        for (let i = 0; i < gaugeData?.recent_spl[0].values.length; i++) {
          const recentVal = gaugeData.recent_spl[0].values[i];
          const correspondingAvgSpl = gaugeData.average_spl?.find(avgSpl =>
            avgSpl.f_min === recentVal.f_min && avgSpl.f_max === recentVal.f_max
          );
    
          if (correspondingAvgSpl) {
            const result = ((recentVal.val - correspondingAvgSpl.val) / Math.abs(correspondingAvgSpl.val)) * 100;
            const recentDb = (10 * Math.log10(recentVal.val)).toFixed(0);
            resultsArray.push({
              f_min: recentVal.f_min,
              f_max: recentVal.f_max,
              result,
              recentDb,
            });
          }
        }
    
        return resultsArray;
    };


    const calculateFrequencyRange = (resultsArray) => {
        if (resultsArray.length === 0) {
            return { minFrequency: null, maxFrequency: null };
        }
    
        // Calculate least f_min and greatest f_max
        let lowerFrequency = Infinity;
        let upperFrequency = -Infinity;
    
        for (let i = 1; i < resultsArray.length; i++) {
            // Convert to numbers before comparing
            let f_min = Number(resultsArray[i].f_min);
            let f_max = Number(resultsArray[i].f_max);

            if (f_min < lowerFrequency) {
            lowerFrequency = f_min;
            }
            if (f_max > upperFrequency) {
            upperFrequency = f_max;
            }
        }
    
        return { lowerFrequency, upperFrequency };
    };

    const constrainValue = (value) => {
        // Calculate absolute value
        const absValue = Math.abs(value);
      
        // Constrain the value to be max 100
        const constrainedValue = Math.min(absValue, 100);

        // Convert from percent to decimal
        const decimalValue = constrainedValue / 100;
      
        return decimalValue;
    }

    const resultsArray = processData();
    
    const { lowerFrequency, upperFrequency } = calculateFrequencyRange(resultsArray);

    return(
        <div>
            {gaugeLoading ? ( // Render circular progress if loading is true
                <center>
                    <CircularProgress color="success" />
                </center>
          ) : (
            <div>
            <GaugeChart id="gauge-chart1" 
                nrOfLevels={10} 
                percent={constrainValue(resultsArray[4]?.result)} 
                textColor="#000000"
                formatTextValue={value => resultsArray[4]?.recentDb+' dB'}
            />
            <Typography style={{ paddingTop: '10px', paddingBottom: '20px' }}>
                Latest broadband noise level of <b>{resultsArray[4]?.recentDb} dB</b> (re 1uPa) is <b>{(Math.abs(resultsArray[4]?.result)).toFixed(0)}% {resultsArray[4]?.result > 0 ? "louder" : "quieter"}</b> than the average for the past month. 
                The term broadband refers to the full range of frequencies that this hydrophone can record.
            </Typography>

            <GaugeChart id="gauge-chart2" 
            nrOfLevels={10} 
            percent={constrainValue(resultsArray[0]?.result)} 
            textColor="#000000"
            formatTextValue={value => resultsArray[0]?.recentDb+' dB'}
            marginInPercent={0.08}
            />
            <Typography><b>{Number(resultsArray[0]?.f_min).toFixed(0)}-{Number(resultsArray[0]?.f_max).toFixed(0)}Hz</b></Typography>
            <Typography style={{ paddingTop: '10px', paddingBottom: '20px' }}>
            This is the typical communication range for larger baleen whale species such as fin whales. 
            The latest noise level of <b>{resultsArray[0]?.recentDb} dB</b> (re 1uPa) is <b>{(Math.abs(resultsArray[0]?.result)).toFixed(0)}% {resultsArray[0]?.result > 0 ? "louder" : "quieter"}</b> than the average within this frequency band for the past month.
            </Typography>

            <GaugeChart id="gauge-chart3" 
            nrOfLevels={10} 
            percent={constrainValue(resultsArray[1]?.result)} 
            textColor="#000000"
            formatTextValue={value => resultsArray[1]?.recentDb+' dB'}
            marginInPercent={0.08}
            />
            <Typography><b>{Number(resultsArray[1]?.f_min).toFixed(0)}-{Number(resultsArray[1]?.f_max).toFixed(0)}Hz</b></Typography>
            <Typography style={{ paddingTop: '10px', paddingBottom: '20px' }}>
            This is the typical communication range for smaller baleen whale species such as humpback whales. 
            The latest noise level of <b>{resultsArray[1]?.recentDb} dB</b> (re 1uPa) is <b>{(Math.abs(resultsArray[1]?.result)).toFixed(0)}% {resultsArray[1]?.result > 0 ? "louder" : "quieter"}</b> than the average within this frequency band for the past month.
            </Typography>

            <GaugeChart id="gauge-chart4" 
            nrOfLevels={10} 
            percent={constrainValue(resultsArray[2]?.result)} 
            textColor="#000000"
            formatTextValue={value => resultsArray[2]?.recentDb+' dB'}
            marginInPercent={0.08}
            />
            <Typography><b>{Number(resultsArray[2]?.f_min).toFixed(0)/1000}-{Number(resultsArray[2]?.f_max).toFixed(0)/1000}kHz</b></Typography>
            <Typography style={{ paddingTop: '10px', paddingBottom: '20px' }}>
            This is the typical communication range for larger dolphin species such as killer whales. 
            The latest noise level of <b>{resultsArray[2]?.recentDb} dB</b> (re 1uPa) is <b>{(Math.abs(resultsArray[2]?.result)).toFixed(0)}% {resultsArray[2]?.result > 0 ? "louder" : "quieter"}</b> than the average within this frequency band for the past month.
            </Typography>

            <GaugeChart id="gauge-chart5" 
            nrOfLevels={10} 
            percent={constrainValue(resultsArray[3]?.result)} 
            textColor="#000000"
            formatTextValue={value => resultsArray[3]?.recentDb+' dB'}
            marginInPercent={0.08}
            />
            <Typography><b>{Number(resultsArray[3]?.f_min).toFixed(0)/1000}-{Number(resultsArray[3]?.f_max).toFixed(0)/1000}kHz</b></Typography>
            <Typography style={{ paddingTop: '10px', paddingBottom: '20px' }}>
            This is the typical echolocation range for larger dolphin species such as killer whales, and the communication range for smaller dolphin and porpoise species. 
            The latest noise level of <b>{resultsArray[3]?.recentDb} dB</b> (re 1uPa) is <b>{(Math.abs(resultsArray[3]?.result)).toFixed(0)}% {resultsArray[3]?.result > 0 ? "louder" : "quieter"}</b> than the average within this frequency band for the past month.
            </Typography>
            <Typography style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            Note: This hydrophone has a recording frequency range of <b>{lowerFrequency}Hz</b> to <b>{upperFrequency}Hz</b>.
            </Typography>
            <Typography style={{ paddingBottom: '20px' }}>
            Learn more about understanding decibels and frequency ranges in our Education Hub.
            </Typography>
            </div>
          )}
        </div>
    );
}