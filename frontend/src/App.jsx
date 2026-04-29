import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import Loader from './components/ui/Loader';

// Pages
import Login from './pages/user-login/Login';
import SetupProfile from './pages/user-login/SetupProfile';
import Home from './pages/Home';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authUser, isCheckingAuth } = useAuthStore();
  
  if (isCheckingAuth) {
    return <Loader progress={50} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but hasn't setup profile
  if (authUser && (!authUser.username || !authUser.profilePicture)) {
    // Avoid infinite loop if we are already on setup
    if (window.location.pathname !== '/setup') {
       return <Navigate to="/setup" replace />;
    }
  }

  return children;
};

const App = () => {
  const { checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !window.location.pathname.includes('/login')) {
      return <Loader progress={100} />;
  }

  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#2A3942',
            color: '#E9EDEF',
          }
        }} 
      />
      <Router>
        <Routes>
          <Route path="/login" element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } />
          
          <Route path="/setup" element={
            <SetupRoute>
              <SetupProfile />
            </SetupRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          {/* Keep legacy route for safety */}
          <Route path="/user-login" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
};

// Redirect to home if already authenticated
const AuthRoute = ({ children }) => {
  const { isAuthenticated, authUser } = useAuthStore();
  if (isAuthenticated && authUser?.username && authUser?.profilePicture) {
    return <Navigate to="/" replace />;
  } else if (isAuthenticated && (!authUser?.username || !authUser?.profilePicture)) {
    return <Navigate to="/setup" replace />;
  }
  return children;
};

// Ensure setup route is only accessible to authenticated users without profile
const SetupRoute = ({ children }) => {
  const { isAuthenticated, authUser } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (authUser?.username && authUser?.profilePicture) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default App;