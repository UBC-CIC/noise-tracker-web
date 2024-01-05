import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';

import InteractiveMap from './pages/InteractiveMap';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InteractiveMap/>}/>
      </Routes>
    </Router>
  );
}

export default App;
