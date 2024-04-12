import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { Button } from '@mui/material';

export default function SidebarSpectrogram({ spectrogramData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = spectrogramData?.presignedUrls || [];
  
  useEffect(() => {
    setCurrentIndex(0);
  }, [spectrogramData]);

  const handleNext = () => {
    const nextIndex = currentIndex - 1;
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = currentIndex + 1;
    setCurrentIndex(prevIndex);
  };

  const currentItem = data[currentIndex];
  const currentUrl = currentItem?.presignedUrl;
  const currentDate = currentItem?.date;
  const formattedDate = currentDate?.slice(0, 10); 

  return (
    <div>
      <div style={{ paddingTop: '20px', width: '100%', height: 'auto', overflow: 'hidden' }}>
        <img src={currentUrl} alt="Spectrogram" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
        <Button variant="contained" disabled={currentIndex === data.length-1} onClick={handlePrev}>Previous</Button>
        <Typography variant="h6"><strong>{formattedDate}</strong></Typography>
        <Button variant="contained" disabled={currentIndex === 0} onClick={handleNext}>Next</Button>
      </div>
      <Typography style={{ paddingTop: '20px' }}>
        *All times are shown in Pacific Standard Time (PST)
      </Typography>
      <Typography style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        This is a spectrogram showing the acoustic soundscape over a 24 hour time period on {formattedDate}. Time is represented on the horizontal axis, 
        frequency on the vertical axis, and the amplitude of the sound is represented on a colour spectrum. 
      </Typography>
      <Typography style={{ paddingBottom: '20px' }}>
        Learn more about how to interpret and use spectrograms in our Education Hub.
      </Typography>
    </div>
  );
}

  