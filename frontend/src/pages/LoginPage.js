import Login from "../components/login";

export default function LoginPage({ loginStatus, setLoginStatus, jwt, setJwt }){
    return(
        <Login loginStatus={loginStatus} setLoginStatus={setLoginStatus} jwt={jwt} setJwt={setJwt} />
    );
}