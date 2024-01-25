import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';

import NavBar from './components/navbar';
import InteractiveMap from './pages/InteractiveMap';
import LoginPage from './pages/LoginPage';

function App() {
  const [loginStatus, setLoginStatus] = useState(false);

  return (
    <Router>
      <NavBar loginStatus={loginStatus} />
      <Routes>
        {loginStatus ? (
          <>
            <Route path="/" element={<InteractiveMap />} />
            <Route path="/map" element={<InteractiveMap />} />
            <Route path="/signout" element={<LoginPage loginStatus={false} setLoginStatus={setLoginStatus} />} />
          </>
        ) : (
          <>
            <Route path="/" element={<InteractiveMap />} />
            <Route path="/map" element={<InteractiveMap />} />
            <Route path="/login"element={<LoginPage loginStatus={loginStatus} setLoginStatus={setLoginStatus} />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
