import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert } from "@mui/material"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

const Login = ({ loginStatus, setLoginStatus, jwt, setJwt }) => {
    const [showError, setShowError] = useState(false);
    const [pageState, setPageState] = useState(0);
    const [cognitoUser, setCognitoUser] = useState('');
    const navigate = useNavigate(); 
    let   username;
    let   password;

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

        // Check loginStatus and call signout if false
        if (!loginStatus) {
            signout();
        }
      }, []); // Empty dependency array ensures this effect runs only once when the component mounts

    const signIn = async () => {
        const authenticationData = {
            Username: username,
            Password: password,
          };
        
          const authenticationDetails = new AuthenticationDetails(authenticationData);
        
          const userData = {
            Username: username,
            Pool: userPool,
          };
        
          const cognitoUser = new CognitoUser(userData);
        
          cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (session) => {
              setLoginStatus(true);
              navigate("/map");
              const jwtToken = session.getAccessToken().getJwtToken();
              setJwt(jwtToken);
            },
            onFailure: (err) => {
                // Handle other authentication failures
                console.log("Error: ", err);
                setShowError(true);
            },
            newPasswordRequired: () => {   
                // User needs to set a new password
                setCognitoUser(cognitoUser);
                setPageState(1); // Change page state to prompt for new password
            }
          });
    }

    const signout = () => {
        const cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.signOut();
            setLoginStatus(false);
            navigate("/map");
        }
    };

    const handleNewPassword = (cognitoUser) => {
        cognitoUser.completeNewPasswordChallenge(password, {}, {
            onSuccess: (session) => {
                // Handle successful password change
                setLoginStatus(true);
                navigate("/map");
                const jwtToken = session.getAccessToken().getJwtToken();
                setJwt(jwtToken);
            },
            onFailure: (err) => {
                // Handle failure in setting new password
                console.log("Error: ", err);
                setShowError(true);
            }
        });
    };
    

    const LogoutButton = () => {
        return (
            <Button 
                className="containedbutton"
                variant="contained" 
                onClick={() => {signout()}}
                sx={{m:1}}
            >
                Sign Out
            </Button>
        );
    };

    const LoginPage = () => {
        return(
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="60vh"
            >
                {pageState === 0 ? (
                <>
                    <TextField
                        className="textbox" 
                        onChange={(event)=>{username=event.target.value}}
                        id="usernameinput" 
                        label="username" 
                        variant="outlined" 
                        sx={{m:1}}
                    >
                    </TextField>
                    <TextField
                        className="textbox" 
                        onChange={(event)=>{password=event.target.value}}
                        id="pwinput" 
                        label="password" 
                        type="password"
                        variant="outlined" 
                        sx={{m:1}}
                    >
                    </TextField>
                    {showError && (
                        <Alert severity="error">Your username or password are incorrect, please contact the system admin to reset your password</Alert>
                    )}
                    <Button 
                        className="containedbutton"
                        variant="contained" 
                        onClick={() => {signIn()}}
                        sx={{m:1}}
                    >Login
                    </Button>
                </>
            ) : (
                // Prompt for new password
                <div>
                    <TextField
                        className="textbox"
                        onChange={(event) => { password = event.target.value }}
                        id="newPasswordInput"
                        label="New Password"
                        type="password"
                        variant="outlined"
                        sx={{ m: 1 }}
                    />
                    <Button
                        className="containedbutton"
                        variant="contained"
                        onClick={() => { handleNewPassword(cognitoUser) }}
                        sx={{ m: 1 }}
                    >Set New Password
                    </Button>
                </div>
                )}
            </Box>
        )
    }

    return(
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
            style={{ marginTop: '20px' }}
        >
            {!loginStatus && <LoginPage />}
            {(loginStatus && (pageState === 0)) && (
                <div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                        <LogoutButton />
                    </div>
                </div>
            )}
        </Box>
    )
}

export default Login