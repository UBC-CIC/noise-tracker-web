import Login from "../components/login";

export default function LoginPage({ loginStatus, setLoginStatus }){
    return(
        <Login loginStatus={loginStatus} setLoginStatus={setLoginStatus}/>
    );
}