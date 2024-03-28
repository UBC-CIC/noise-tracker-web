import { IconButton } from "@mui/material"
import MicIcon from '@mui/icons-material/Mic';
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

export default function AdminSidebar({ onButtonClick }){
    const buttonSx = {
        borderRadius: '0', 
        color: 'black', 
        '&:hover': {
            backgroundColor: '#e0e0e0', 
        },
        '&:active': {
            backgroundColor: '#e0e0e0', 
        },
        width: '100%',
        justifyContent: 'flex-start',
    };

    const labelSx = {
        marginLeft: '10%', 
        fontSize: '16px', 
        fontWeight: 'bold',
    };

    return (
        <div className="admin-sidebar-container">
            <IconButton sx={buttonSx} onClick={() => onButtonClick('general')}>
                <HomeIcon /><span style={labelSx}>General</span>
            </IconButton>

            <IconButton sx={buttonSx} onClick={() => onButtonClick('hydrophones')}>
                <MicIcon /><span style={labelSx}>Hydrophones</span>
            </IconButton>

            <IconButton sx={buttonSx} onClick={() => onButtonClick('operators')}>
                <PeopleAltIcon /><span style={labelSx}>Operators</span>
            </IconButton>
        </div>
    );
}