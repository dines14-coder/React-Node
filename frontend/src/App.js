import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, IconButton } from '@mui/material';
// import { Menu } from '@mui/icons-material';
import { HiMenuAlt1 } from "react-icons/hi";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import UserDropdown from './components/UserDropdown';
import Dashboard from './components/Dashboard';
import OnboardingForms from './components/OnboardingForms';
import AddInfluencer from './components/AddInfluencer';
import StandaloneForm from './components/StandaloneForm';
import SubmittedForms from './components/SubmittedForms';
import NegotiationCost from './components/NegotiationCost';
import InfluencerDetail from './components/InfluencerDetail';
import ExistingInfluencers from './components/ExistingInfluencers';
import BarterList from './components/BarterList';
import Marketing from './components/Marketing';
import Masters from './components/Masters';
import CampaignStages from './components/CampaignStages';
import StageDetails from './components/StageDetails';
import StrategyDetails from './components/StrategyDetails';
import StrategyApproval from './components/StrategyApproval';
import InfluencerPlanning from './components/InfluencerPlanning';
import InfluencerShortlisting from './components/InfluencerShortlisting';
import BusinessApproval from './components/BusinessApproval';
import InfluencerFinalCosts from './components/InfluencerFinalCosts';
import InfluencerEmpanelment from './components/InfluencerEmpanelment';
import BudgetRelease from './components/BudgetRelease';
import PODispatch from './components/PODispatch';
import ProductRequirement from './components/ProductRequirement';
import ContentCoordination from './components/ContentCoordination';
import LogisticsTeam from './components/LogisticsTeam';
import ContentVideoLive from './components/ContentVideoLive';
import AssetCollection from './components/AssetCollection';
import BillingConfirmation from './components/BillingConfirmation';
import NotFound from './components/NotFound';
import './styles/sidebar.css';
import './styles/scrollbar.css';
import SampleTable from './components/SampleTable';

const theme = createTheme({
  typography: {
    fontSize: 12,
    body1: {
      fontSize: '14px',
    },
    body2: {
      fontSize: '13px',
    },
    h6: {
      fontSize: '15px',
    },
    // button: {
    //   fontSize: '14px',
    // },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          paddingTop: '5px',
          paddingBottom: '5px',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#1E5BA8',
      light: '#2E7BC0',
      dark: '#184580',
    },
    secondary: {
      main: '#FF9500',
      light: '#FFB143',
      dark: '#E68500',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
  },
});

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveMenu = () => {
    if (!user) return 'dashboard';
    const path = location.pathname;
    if (path === '/onboard-forms' || path.startsWith('/influencer/')) return 'onboarding';
    if (path === '/influencers-assign') return 'existing';
    if (path === '/barter-list') return 'barter';
    if (path === '/submitted-forms') return 'submitted';
    if (path === '/negotiation-cost') return 'negotiation';
    if (path.startsWith('/marketing')) return 'marketing';
    if (path === '/masters') return 'masters';
    return 'dashboard';
  };

  const setActiveMenu = (menuId) => {
    switch (menuId) {
      case 'dashboard': navigate('/'); break;
      case 'onboarding': navigate('/onboard-forms'); break;
      case 'existing': navigate('/influencers-assign'); break;
      case 'barter': navigate('/barter-list'); break;
      case 'submitted': navigate('/submitted-forms'); break;
      case 'negotiation': navigate('/negotiation-cost'); break;
      case 'marketing': navigate('/marketing'); break;
      case 'masters': navigate('/masters'); break;
      default: navigate('/'); break;
    }
  };

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const loginTime = localStorage.getItem('loginTime');

      if (token && userData && loginTime) {
        const currentTime = new Date().getTime();
        const loginTimestamp = parseInt(loginTime);
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (currentTime - loginTimestamp > twentyFourHours) {
          // Token expired, logout user
          handleLogout();
          return;
        }
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    checkTokenExpiration();

    // Check every minute for token expiration
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('loginTime', new Date().getTime().toString());
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    setUser(null);
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  const isStandaloneForm = location.pathname.startsWith('/form/');
  const isNotFoundRoute = !user && !isStandaloneForm &&
    !['/'].includes(location.pathname) &&
    !location.pathname.startsWith('/form/');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/form/:id/:type?/:existingId?" element={<StandaloneForm />} />
        {user ? (
          <Route path="/*" element={
            <div style={{ display: 'flex' }}>
              <Sidebar
                activeMenu={getActiveMenu()}
                setActiveMenu={setActiveMenu}
                user={user}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
              />
              <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="top-header">
                  <IconButton
                    onClick={toggleSidebar}
                    sx={{
                      // bgcolor: '#f8f9fa',
                      // border: '1px solid #e1e5e9',
                      color: 'gray',
                      '&:hover': {
                        bgcolor: '#e9ecef',
                        borderColor: '#333'
                      }
                    }}
                  >
                    <HiMenuAlt1 />
                  </IconButton>
                  <UserDropdown user={user} onLogout={handleLogout} />
                </div>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/demo" element={<SampleTable />} />
                  <Route path="/onboard-forms" element={<OnboardingForms user={user} />} />
                  <Route path="/onboard-forms/new" element={<AddInfluencer />} />
                  <Route path="/influencer/:id" element={<InfluencerDetail />} />
                  <Route path="/existing-influencers" element={<ExistingInfluencers user={user} />} />
                  <Route path="/influencers-assign" element={<ExistingInfluencers user={user} />} />
                  <Route path="/barter-list" element={<BarterList />} />
                  <Route path="/submitted-forms" element={<SubmittedForms />} />
                  <Route path="/negotiation-cost" element={<NegotiationCost />} />
                  <Route path="/marketing" element={<Marketing />} />
                  <Route path="/marketing/edit/:id" element={<CampaignStages />} />
                  <Route path="/marketing/edit/:id/stage/:stageId" element={<StageDetails />} />
                  <Route path="/marketing/edit/:id/strategy/:stageId" element={<StrategyDetails />} />
                  <Route path="/marketing/edit/:id/approval/:stageId" element={<StrategyApproval />} />
                  <Route path="/marketing/edit/:id/planning/:stageId" element={<InfluencerPlanning />} />
                  <Route path="/marketing/edit/:id/shortlisting/:stageId" element={<InfluencerShortlisting />} />
                  <Route path="/marketing/edit/:id/business-approval/:stageId" element={<BusinessApproval />} />
                  <Route path="/marketing/edit/:id/final-costs/:stageId" element={<InfluencerFinalCosts />} />
                  <Route path="/marketing/edit/:id/empanelment/:stageId" element={<InfluencerEmpanelment />} />
                  <Route path="/marketing/edit/:id/budget-release/:stageId" element={<BudgetRelease />} />
                  <Route path="/marketing/edit/:id/po-dispatch/:stageId" element={<PODispatch />} />
                  <Route path="/marketing/edit/:id/product-requirement/:stageId" element={<ProductRequirement />} />
                  <Route path="/marketing/edit/:id/content-coordination/:stageId" element={<ContentCoordination />} />
                  <Route path="/marketing/edit/:id/logistics/:stageId" element={<LogisticsTeam />} />
                  <Route path="/marketing/edit/:id/content-live/:stageId" element={<ContentVideoLive />} />
                  <Route path="/marketing/edit/:id/asset-collection/:stageId" element={<AssetCollection />} />
                  <Route path="/marketing/edit/:id/billing-confirmation/:stageId" element={<BillingConfirmation />} />
                  <Route path="/masters" element={<Masters />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          } />
        ) : (
          <>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
