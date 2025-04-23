import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import theme from './theme'; // Import the custom theme
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import TeamLeaderDashboard from './components/TeamLeaderDashboard';
import TeamMemberDashboard from './components/TeamMemberDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}> {/* Apply the theme */} 
      <CssBaseline /> {/* Normalize CSS */} 
      <Router>
        <Main />
      </Router>
    </ThemeProvider>
  );
}

function Main() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user in storage and not on login page, redirect to login
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  }, [navigate, location.pathname]);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Redirect based on role
    switch (userData.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'teamleader':
        navigate('/leader');
        break;
      case 'teammember':
        navigate('/member');
        break;
      default:
        navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {user && (
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Team Project Management
            </Typography>
            <Typography sx={{ mr: 2 }}>
              Welcome, {user.firstName}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      )}
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
        <Routes>
          <Route path="/" element={user ? <Navigate to={getDefaultRoute(user.role)} /> : <LoginPage onLogin={handleLogin} />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/leader" element={user?.role === 'teamleader' ? <TeamLeaderDashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/member" element={user?.role === 'teammember' ? <TeamMemberDashboard user={user} /> : <Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

const getDefaultRoute = (role) => {
  switch (role) {
    case 'admin': return '/admin';
    case 'teamleader': return '/leader';
    case 'teammember': return '/member';
    default: return '/';
  }
};

export default App;
