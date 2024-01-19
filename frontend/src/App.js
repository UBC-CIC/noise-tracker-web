import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';

import NavBar from './components/navbar';
import InteractiveMap from './pages/InteractiveMap';
import OceanMapPage from './pages/OceanMapPage';

function App() {
  return (
    <Router>
      <NavBar/>
      <Routes>
        <Route path="/" element={<InteractiveMap/>}/>
        <Route path="/home" element={<OceanMapPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;
