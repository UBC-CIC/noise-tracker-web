import { IconButton } from "@mui/material"
import MicIcon from '@mui/icons-material/Mic';
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

export default function AdminSidebar({ onButtonClick }){
    const buttonStyle = {
        borderRadius: '0', 
        color: 'black', 
        '&:hover': {
            backgroundColor: '#e0e0e0', 
        },
        '&:active': {
            backgroundColor: '#e0e0e0', 
        },
    };

    return(
        <div style={{ 
            position: 'relative', 
            width: '10%',
            minWidth: '200px', 
            maxWidth: '200px',
            backgroundColor: '#f0f0f0', 
            padding: '2%',

            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start', 
            alignItems: 'flex-start',
            }}>
            <IconButton style={buttonStyle} onClick={() => onButtonClick('general')}>
                <HomeIcon /> <span style={{ marginLeft: '10%', fontFamily: 'Arial, sans-serif', fontSize: '16px', fontWeight: 'bold' }}>General</span>
            </IconButton>

            <IconButton style={buttonStyle} onClick={() => onButtonClick('hydrophones')}>
                <MicIcon /> <span style={{ marginLeft: '10%', fontFamily: 'Arial, sans-serif', fontSize: '16px', fontWeight: 'bold' }}>Hydrophones</span>
            </IconButton>

            <IconButton style={buttonStyle} onClick={() => onButtonClick('operators')}>
                <PeopleAltIcon /> <span style={{ marginLeft: '10%', fontFamily: 'Arial, sans-serif', fontSize: '16px', fontWeight: 'bold' }}>Operators</span>
            </IconButton>
        </div>
    )
}