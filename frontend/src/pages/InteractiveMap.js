import React from 'react';
import Map from "../components/map";

export default function InteractiveMap(){
    return(
        <div style={{ display: 'flex', height: '100vh' }}>
            <Map/>
        </div>
    );
}