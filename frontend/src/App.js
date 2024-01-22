import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';

import NavBar from './components/navbar';
import InteractiveMap from './pages/InteractiveMap';

function App() {
  return (
    <Router>
      <NavBar/>
      <Routes>
        <Route path="/" element={<InteractiveMap/>}/>
        <Route path="/map" element={<InteractiveMap/>}/>
      </Routes>
    </Router>
  );
}

export default App;
