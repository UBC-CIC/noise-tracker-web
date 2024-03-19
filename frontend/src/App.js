import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

import NavBar from './components/navbar';
import InteractiveMap from './pages/InteractiveMap';
import LoginPage from './pages/LoginPage';
import OperatorProfile from './pages/OperatorProfile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [loginStatus, setLoginStatus] = useState(false);
  const [jwt, setJwt] = useState('');

  const poolData = {
    UserPoolId: process.env.REACT_APP_USERPOOL_ID,
    ClientId: process.env.REACT_APP_USERPOOL_WEB_CLIENT_ID,
  };

  const userPool = new CognitoUserPool(poolData);

  const checkExistingSession = () => {
      // Check for existing session when the component mounts
      const cognitoUser = userPool.getCurrentUser();

      if (cognitoUser) {
        cognitoUser.getSession((err, session) => {
          if (err) {
            setLoginStatus(false);
          } else {
            const jwtToken = session.getAccessToken().getJwtToken();
            setJwt(jwtToken);
            setLoginStatus(true);
          }
        });
      }
    };

  useEffect(() => {
    checkExistingSession();
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  return (
    <Router>
      <NavBar loginStatus={loginStatus} />
      <Routes>
        <Route path="/" element={<InteractiveMap />} />
        <Route path="/map/*" element={<InteractiveMap />} />
        <Route path="/map/:hydrophoneName/:metricName" element={<InteractiveMap />} />
        {loginStatus ? (
          <>
            <Route path="/signout" element={<LoginPage loginStatus={false} setLoginStatus={setLoginStatus} jwt={jwt} setJwt={setJwt} />} />
            <Route path="/operatorprofile" element={<OperatorProfile jwt={jwt} />} />
            <Route path="/admin" element={<AdminDashboard jwt={jwt} />} />
          </>
        ) : (
          <>
            <Route path="/login"element={<LoginPage loginStatus={loginStatus} setLoginStatus={setLoginStatus} jwt={jwt} setJwt={setJwt} />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
