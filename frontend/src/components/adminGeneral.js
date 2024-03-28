import { Typography } from "@mui/material";

export default function AdminGeneral(){
    return(
        <div>
            <Typography 
              variant='h4' 
              sx={{
                pt: { xs: '10px', md: '20px' },
                pl: { xs: '10px', md: '20px' },
                pb: { xs: '25px', md: '50px' }
              }}>
                Welcome to the NoiseTracker Admin Dashboard!
            </Typography>
        </div>
    );
}