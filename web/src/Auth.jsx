import { createContext, useContext, useEffect, useState } from "react";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const POOL_ID = import.meta.env.VITE_POOL_ID || 'eu-west-2_NHFK9ZIHw';
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || 'av2na55klmkv01n7ud0t68ltj';

const poolData = {
  UserPoolId: POOL_ID,
  ClientId: CLIENT_ID
};

const userPool = new CognitoUserPool(poolData);

export function signIn(username, password) {
  const authenticationDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const idToken = result.getIdToken().getJwtToken();
        sessionStorage.setItem("idToken", idToken);
        sessionStorage.setItem("name", username);
        resolve(result);
      },
      onFailure: (err) => reject(err),
    });
  });
}

export function signOut() {
  sessionStorage.removeItem("idToken");
  sessionStorage.removeItem("name");
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
}

export function isSignedIn() {
  const idToken = sessionStorage.getItem("idToken");
  if (!idToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(idToken);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Invalid token", error);
    return false;
  }
}

export function getIdToken() {
  return sessionStorage.getItem("idToken");
}

export function getUsername() {
  return sessionStorage.getItem("name");
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  //const { showAlert } = useAlert();
  //const router = useRouter();

  useEffect(() => {
    if (isSignedIn()) {
      setIsLoggedIn(true);
    }
    setAuthChecked(true);
  }, []);

  // Check every minute if we're signed in
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSignedIn()) {
        signOut();
        setIsLoggedIn(false);
        window.location.href = "/";
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  /*useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [authChecked, isLoggedIn, router]);*/

  async function login(username, password) {
    try {
      await signIn(username, password);
      setIsLoggedIn(true);
    } catch (error) {
      //showAlert('Login failed', 'error', 3000);
      console.log(error);
    }
  }

  function logout() {
    signOut();
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, authChecked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // Update authentication state
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-gray-100 dark:bg-gray-700 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
    >
      Logout
    </button>
  );
}

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  //const { darkMode, setDarkMode } = useDarkMode();

  //const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') ? localStorage.getItem('darkMode') === 'true' : false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  /*useEffect(() => {
    const storedTheme = ;
    if (storedTheme) {
      console.log( "Login Stored theme is " + storedTheme);
      
      setDarkMode(storedTheme === 'true');
    }
  }, []);*/

  /* useEffect(() => {
     console.log("Login : Dark mode changed to " + darkMode);
     localStorage.setItem('darkMode', darkMode);
   }, [darkMode]);
 */

  /*function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const username = form.elements.email.value;
    const password = form.elements.password.value;

    login(username, password);
    const intendedRoute = localStorage.getItem("intendedRoute") || "/";
    localStorage.removeItem("intendedRoute");
    router.push(intendedRoute); // Update authentication state
  }*/

  function handleSubmit(event) {
    event.preventDefault();

    login(username, password);

    const intendedRoute = localStorage.getItem("intendedRoute") || "/";
    localStorage.removeItem("intendedRoute");
    navigate(intendedRoute); // ✅ Redirect to originally intended page
  };


  return (
    <div className={`flex w-full items-center justify-center min-h-screen transition-colors bg-gray-100 text-gray-900`}>
      <Card className={`w-full max-w-sm p-6 rounded-2xl shadow-lg bg-white`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold text-gray-900`}>Login</h2>

        </div>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-gray-900`}>Username</label>
              <Input type="text" placeholder="Enter your email" className={`mt-1 w-full text-gray-900`} value={username}
                onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label className={`block text-gray-900`}>Password</label>
              <Input type="password" placeholder="Enter your password" className={`mt-1 w-full text-gray-900`} value={password}
                onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
