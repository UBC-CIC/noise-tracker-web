import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Typography } from "@mui/material"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

const Login = ({ loginStatus, setLoginStatus, jwt, setJwt, group, setGroup }) => {
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState(null);
    const [pageState, setPageState] = useState("login");
    const [cognitoUser, setCognitoUser] = useState('');
    const navigate = useNavigate(); 
    let username;
    let password;
    let confirmPassword;
    let email;
    let verificationCode;
    let newPassword;
    let confirmNewPassword;

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
              const userGroup = session.getAccessToken().payload['cognito:groups']?.[0]
              setGroup(userGroup);
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
        if (!username || !password) {
            setError({ message: "Please enter both username and password." });
            return;
        }
    
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
              const jwtToken = session.getAccessToken().getJwtToken();
              const userGroup = session.getAccessToken().payload['cognito:groups']?.[0]
              if (userGroup) {
                setGroup(userGroup);
                setJwt(jwtToken);
                setLoginStatus(true);
                navigate("/map");
              } else {
                setError({ message: "Invalid user group." });
              }
            },
            onFailure: (err) => {
                // Handle other authentication failures
                console.log("Error: ", err);
                setError({ message: "Your username or password is incorrect." });
            },
            newPasswordRequired: () => {   
                // User needs to set a new password
                setCognitoUser(cognitoUser);
                setPageState("newPassword"); // Change page state to prompt for new password
                setError(null);
            }
          });
    }

    const forgotPassword = async () => {                
        setPageState("forgotPassword");
        setError(null);
    }

    const backToSignIn = async () => {                
        setPageState("login");
        setError(null);
    }

    const sendCode = async () => { 
        if (!email) {
            setError({ message: "Please enter your email." });
            return;
        }

        const userData = {
            Username: email,
            Pool: userPool,
        };
    
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.forgotPassword({
            onSuccess: function (data) {
                // Password reset code sent successfully
                setCognitoUser(cognitoUser);
                setPageState("resetPassword")
                setError(null)
            },
            onFailure: function (err) {
                // Error sending password reset code
                if (err.code === "UserNotFoundException") {
                    setError({ message: "User not found." });
                }
                console.log(err);
            },
        });
    }

    const resetPassword = async (cognitoUser) => { 
        if (!verificationCode || !newPassword || !confirmNewPassword) {
            setError({ message: "Please fill in all fields." });
            return;
        }

        if (newPassword === confirmNewPassword){
            cognitoUser.confirmPassword(verificationCode, newPassword, {
                onSuccess: function (data) {
                    setAlert("Your password has been reset successfully.");
                    setPageState("login");
                    setError(null);
                },
                onFailure: function (err) {
                    if (err.code === "InvalidPasswordException") {
                        setError({ message: "Invalid password. All passwords must have: minimum length of 8 characters, at least one lowercase letter, at least one uppercase letter, at least one digit, and at least one symbol." });
                    } 
                    else if (err.code === "CodeMismatchException") {
                        setError({ message: "Invalid verification code" });
                    }   
                    console.log(err);
                },
            });
        }
        else{
            setError({ message: "The passwords do not match" });
        }
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
        setError(null);
        if (password === confirmPassword){
            cognitoUser.completeNewPasswordChallenge(password, {}, {
                onSuccess: (session) => {
                    // Handle successful password change
                    const jwtToken = session.getAccessToken().getJwtToken();
                    const userGroup = session.getAccessToken().payload['cognito:groups']?.[0]
                    if (userGroup) {
                        setGroup(userGroup);
                        setJwt(jwtToken);
                        setLoginStatus(true);
                        navigate("/map");
                    } else {
                        setError({ message: "Invalid user group." });
                        setPageState("login");
                    }
                },
                onFailure: (err) => {
                    // Handle failure in setting new password
                    if (err.code === "InvalidPasswordException") {
                        setError({ message: "Invalid password. All passwords must have: minimum length of 8 characters, at least one lowercase letter, at least one uppercase letter, at least one digit, and at least one symbol." });
                    }   
                    console.log(err);
                }
            });
        }
        else{
            setError({ message: "The passwords do not match" });
        }
    };
    

    const LogoutButton = () => {
        return (
            <Button 
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
            <Box className="login-container">
                {pageState === "login" &&
                <>
                    {alert && (
                        <Alert severity="success">{alert}</Alert>
                    )}
                    <TextField 
                        onChange={(event)=>{username=event.target.value}}
                        id="usernameinput" 
                        label="Username" 
                        variant="outlined" 
                        sx={{m:1}}
                    >
                    </TextField>
                    <TextField
                        onChange={(event)=>{password=event.target.value}}
                        id="pwinput" 
                        label="Password" 
                        type="password"
                        variant="outlined" 
                        sx={{m:1}}
                    >
                    </TextField>
                    {error && (
                        <Alert severity="error">{error.message}</Alert>
                    )}
                    <Button 
                        variant="contained" 
                        onClick={() => {signIn()}}
                        sx={{m:1}}
                    >Login
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={() => {forgotPassword()}}
                        sx={{m:1}}
                    >Forgot Password?
                    </Button>
                </>
                }
            {pageState === "newPassword" && 
                // Prompt for new password
                <>
                    <TextField
                        onChange={(event) => { password=event.target.value }}
                        id="newPasswordInput"
                        label="New Password"
                        type="password"
                        variant="outlined"
                        sx={{ m: 1 }}
                    />
                    <TextField
                        onChange={(event) => { confirmPassword=event.target.value }}
                        id="confirmNewPasswordInput"
                        label="Confirm New Password"
                        type="password"
                        variant="outlined"
                        sx={{ m: 1 }}
                    />
                    {error && (
                        <Alert severity="error">{error.message}</Alert>
                    )}
                    <Button
                        variant="contained"
                        onClick={() => {handleNewPassword(cognitoUser)} }
                        sx={{ m: 1 }}
                    >
                        Set New Password
                    </Button>
                </>
                }
                {pageState === "forgotPassword" && 
                <>
                    <Typography style={{ width: '50%' }}>Enter your username and we'll send you a code to help you reset your password.</Typography>
                    {error && (
                        <Alert severity="error">{error.message}</Alert>
                    )}
                    <TextField style={{ width: '50%' }}
                        onChange={(event)=>{email=event.target.value}}
                        id="emailinput" 
                        label="Email" 
                        variant="outlined" 
                        sx={{m:1}}
                    ></TextField>
                    <Button style={{ width: '50%' }}
                        variant="contained"
                        onClick={() => {backToSignIn()}}
                        sx={{ m: 1 }}
                    >
                        Back
                    </Button>
                    <Button style={{ width: '50%' }}
                        variant="contained"
                        onClick={() => {sendCode()}}
                        sx={{ m: 1 }}
                    >
                        Send Code
                    </Button>
                </>
                }
                {pageState === "resetPassword" && 
                <>
                    <Typography style={{ width: '50%' }}>A password reset code has been sent to your email. Enter it below to reset your password.</Typography>
                    {error && (
                        <Alert severity="error">{error.message}</Alert>
                    )}
                    <TextField style={{ width: '50%' }}
                        onChange={(event)=>{verificationCode=event.target.value}}
                        id="verificationCode" 
                        label="Code" 
                        variant="outlined" 
                        sx={{m:1}}
                    ></TextField>
                    <TextField style={{ width: '50%' }}
                        onChange={(event) => { newPassword=event.target.value }}
                        id="changePasswordInput"
                        label="New Password"
                        type="password"
                        variant="outlined"
                        sx={{ m: 1 }}
                    />
                    <TextField style={{ width: '50%' }}
                        onChange={(event) => { confirmNewPassword=event.target.value }}
                        id="confirmChangePasswordInput"
                        label="Confirm New Password"
                        type="password"
                        variant="outlined"
                        sx={{ m: 1 }}
                    />
                    <Button style={{ width: '50%' }}
                        variant="contained"
                        onClick={() => {resetPassword(cognitoUser)}}
                        sx={{ m: 1 }}
                    >
                        Change Password
                    </Button>
                </>
                }
            </Box>
        )
    }

    return(
        <Box className="login-container">
            {!loginStatus && <LoginPage />}
            {(loginStatus && (pageState === 0)) && (
                <div>
                    <div className="login-page-flex-end">
                        <LogoutButton />
                    </div>
                </div>
            )}
        </Box>
    )
}

export default Login