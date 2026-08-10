import React, { useState, useEffect } from 'react';
import { DateFilterProvider } from './contexts/DateFilterContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
const Executive = React.lazy(() => import('./modules/Executive/Executive'));
const Sales = React.lazy(() => import('./modules/Sales/Sales'));
const Marketing = React.lazy(() => import('./modules/Marketing/Marketing'));
const Newsletter = React.lazy(() => import('./modules/Newsletter/Newsletter'));
const SEO = React.lazy(() => import('./modules/SEO/SEO'));
const Customer = React.lazy(() => import('./modules/Customer/Customer'));
const Funnel = React.lazy(() => import('./modules/Funnel/Funnel'));
const Operations = React.lazy(() => import('./modules/Operations/Operations'));
const AIInsights = React.lazy(() => import('./modules/AIInsights/AIInsights'));
const ReportsBuilder = React.lazy(() => import('./modules/Reports/ReportsBuilder'));
const AdminControl = React.lazy(() => import('./modules/Admin/AdminControl'));
const AISettings = React.lazy(() => import('./modules/AISettings/AISettings'));
import Login from './components/Login';
import { api } from './services/api';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import './App.css';


const getFirstPermittedModule = (permissions) => {
  const defaultModules = ['executive', 'sales', 'marketing', 'newsletter', 'seo', 'customer', 'funnel', 'operations', 'ai-insights'];
  if (!permissions || !permissions.dashboard) return 'executive';

  for (const mod of defaultModules) {
    const permKey = mod === 'ai-insights' ? 'ai' : mod;
    if (permissions.dashboard[permKey] !== false) {
      return mod;
    }
  }
  return 'executive';
};

const DashboardSkeleton = () => (
  <div className="animate-pulse p-2 space-y-6 w-full max-w-7xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="h-32 bg-cosmic-card/50 border border-cosmic-border rounded-2xl w-full"></div>
      <div className="h-32 bg-cosmic-card/50 border border-cosmic-border rounded-2xl w-full"></div>
      <div className="h-32 bg-cosmic-card/50 border border-cosmic-border rounded-2xl w-full"></div>
      <div className="h-32 bg-cosmic-card/50 border border-cosmic-border rounded-2xl w-full hidden lg:block"></div>
    </div>
    <div className="h-[400px] bg-cosmic-card/50 border border-cosmic-border rounded-2xl w-full"></div>
  </div>
);

function MainAppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('astroved_user') && !!localStorage.getItem('astroved_token'));
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('astroved_user') ? JSON.parse(localStorage.getItem('astroved_user')) : null
  );
  const [userPermissions, setUserPermissions] = useState(
    localStorage.getItem('astroved_permissions') ? JSON.parse(localStorage.getItem('astroved_permissions')) : null
  );
  const [currentModule, setCurrentModule] = useState(() => {
    const perms = localStorage.getItem('astroved_permissions') ? JSON.parse(localStorage.getItem('astroved_permissions')) : null;
    return getFirstPermittedModule(perms);
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = (user, permissions, token) => {
    setCurrentUser(user);
    setUserPermissions(permissions);
    localStorage.setItem('astroved_user', JSON.stringify(user));
    localStorage.setItem('astroved_permissions', JSON.stringify(permissions));
    if (token) localStorage.setItem('astroved_token', token);
    localStorage.setItem('astroved_login_time', Date.now().toString());
    setCurrentModule(getFirstPermittedModule(permissions));
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    if (currentUser && currentUser.empId) {
      try {
        await api.logout(currentUser.empId);
      } catch (err) {
        console.error('Failed to change user status on logout:', err);
      }
    }
    setCurrentUser(null);
    setUserPermissions(null);
    localStorage.removeItem('astroved_user');
    localStorage.removeItem('astroved_permissions');
    localStorage.removeItem('astroved_login_time');
    localStorage.removeItem('astroved_token');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const checkLogout = () => {
      const loginTime = localStorage.getItem('astroved_login_time');
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        // 4 hours = 4 * 60 * 60 * 1000 = 14400000 ms
        if (elapsed >= 14400000) {
          handleLogout();
        }
      } else {
        localStorage.setItem('astroved_login_time', Date.now().toString());
      }
    };

    checkLogout();
    const intervalId = setInterval(checkLogout, 60000);
    return () => clearInterval(intervalId);
  }, [isLoggedIn, currentUser]);

  // Render correct dashboard module
  const renderModule = () => {
    const isAdmin = currentUser && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin' || currentUser.role === 'System Admin');

    // 1. Guard admin panel modules
    if (!isAdmin && [
      'user-management', 'roles-permissions', 'kpi-management',
      'target-management', 'report-scheduler', 'ai-settings', 'system-settings', 'integrations'
    ].includes(currentModule)) {
      return <Executive />;
    }

    const adminPanelMap = {
      'user-management': ['users', 'roles'],
      'roles-permissions': ['roles'],
      'kpi-management': ['kpis'],
      'target-management': ['targets'],
      'report-scheduler': ['reports'],
      'system-settings': ['apis'],
      'integrations': ['integrations']
    };
    if (adminPanelMap[currentModule]) {
      const keys = adminPanelMap[currentModule];
      if (userPermissions && userPermissions.management) {
        const isPermitted = keys.some(key => userPermissions.management[key] !== false);
        if (!isPermitted && !isAdmin) {
          return (
            <div className="p-6 text-center bg-cosmic-card border border-cosmic-border rounded-2xl max-w-md mx-auto mt-10">
              <h3 className="text-sm font-extrabold text-cosmic-text mb-2">Access Denied</h3>
              <p className="text-xs text-cosmic-muted">Your role profile does not have permission to view this management panel.</p>
            </div>
          );
        }
      }
    }

    // 2. Guard dashboard view permissions based on roles settings
    const permissionMap = {
      executive: 'executive',
      sales: 'sales',
      marketing: 'marketing',
      newsletter: 'newsletter',
      seo: 'seo',
      customer: 'customer',
      funnel: 'funnel',
      operations: 'operations',
      'ai-insights': 'ai'
    };
    if (permissionMap[currentModule]) {
      const permKey = permissionMap[currentModule];
      if (userPermissions && userPermissions.dashboard && userPermissions.dashboard[permKey] === false) {
        return (
          <div className="p-6 text-center bg-cosmic-card border border-cosmic-border rounded-2xl max-w-md mx-auto mt-10">
            <h3 className="text-sm font-extrabold text-cosmic-text mb-2">Access Denied</h3>
            <p className="text-xs text-cosmic-muted">Your role profile does not have permission to view the {currentModule.replace('-', ' ')} dashboard.</p>
          </div>
        );
      }
    }

    switch (currentModule) {
      case 'executive':
        return <Executive />;
      case 'sales':
        return <Sales />;
      case 'marketing':
        return <Marketing setCurrentModule={setCurrentModule} />;
      case 'newsletter':
        return <Newsletter />;
      case 'seo':
        return <SEO />;
      case 'customer':
        return <Customer />;
      case 'funnel':
        return <Funnel />;
      case 'operations':
        return <Operations />;
      case 'ai-insights':
      case 'alerts':
      case 'notifications':
        return <AIInsights setCurrentModule={setCurrentModule} />;
      case 'reports':
      case 'report-scheduler':
      case 'data-management':
      case 'daily-report':
      case 'weekly-report':
      case 'monthly-report':
      case 'quarterly-report':
      case 'yearly-report':
      case 'export-excel':
      case 'export-pdf':
      case 'export-csv':
        return <ReportsBuilder />;
      case 'user-management':
        return <AdminControl initialTab="users" />;
      case 'roles-permissions':
        return <AdminControl initialTab="roles" />;
      case 'kpi-management':
        return <AdminControl initialTab="kpis" />;
      case 'target-management':
        return <AdminControl initialTab="targets" />;
      case 'report-scheduler':
        return <AdminControl initialTab="scheduler" />;
      case 'ai-settings':
        return <AISettings />;
      case 'system-settings':
        return <AdminControl initialTab="system" />;
      case 'integrations':
        return <AdminControl initialTab="integrations" />;
      default:
        return <Executive />;
    }
  };

  const getModuleTitle = () => {
    const titles = {
      executive: 'Executive Performance ',
      sales: 'Sales Performance',
      marketing: 'Marketing Performance',
      newsletter: "Newsletter Performance",
      seo: 'SEO Performance',
      customer: 'Customer Retention',
      funnel: 'Funnel Analysis',
      operations: 'Operational Analysis',
      'ai-insights': 'AI Insights',
      reports: 'BI Reports Exporter',
      'report-scheduler': 'BI Report Scheduler',
      alerts: 'Strategic Anomaly Alerts',
      notifications: 'System Notifications',
      'data-management': 'Data Management',
      'user-management': 'User Management ',
      'roles-permissions': 'Roles & Permissions',
      'kpi-management': 'KPI Configurator',
      'target-management': 'Target Settings',
      'ai-settings': 'AI Settings & Engine',
      'system-settings': 'System Configuration',
      integrations: 'Third Party Integrations',
      'daily-report': 'Daily Report Scheduler',
      'weekly-report': 'Weekly Report Scheduler',
      'monthly-report': 'Monthly Report Scheduler',
      'quarterly-report': 'Quarterly Report Scheduler',
      'yearly-report': 'Yearly Report Scheduler',
      'export-excel': 'Export Data to Excel',
      'export-pdf': 'Export Data to PDF',
      'export-csv': 'Export Data to CSV'
    };
    return titles[currentModule] || 'Dashboard';
  };


  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex bg-cosmic-bg h-[100dvh] text-cosmic-text font-sans relative overflow-hidden">


      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        setCurrentModule={(mod) => {
          setCurrentModule(mod);
          setMobileMenuOpen(false); // Close mobile drawer on selection
        }}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        user={currentUser}
        permissions={userPermissions}
        onLogout={handleLogout}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        <Header
          title={getModuleTitle()}
          currentModule={currentModule}
          onSearch={(val) => console.log('Searching for:', val)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onNavigate={(targetTab) => {
            // Map the tab target to module
            if (targetTab === 'system-settings') {
              setCurrentModule('system-settings');
            }
          }}
          onLogout={handleLogout}
          user={currentUser}
        />

        <main className="p-4 md:p-6 overflow-y-auto overflow-x-hidden flex-1 scroll-smooth transform-gpu">
          <React.Suspense fallback={<DashboardSkeleton />}>
            {renderModule()}
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}


function App() {
  return (
    <ThemeProvider>
      <DateFilterProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: '#f8fafc',
              border: '1px solid rgba(104, 104, 249, 0.3)',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '16px',
              padding: '16px 24px',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(104, 104, 249, 0.15)',
              maxWidth: '400px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            duration: 4000,
          }}
        />
        <MainAppContent />
      </DateFilterProvider>
    </ThemeProvider>
  );
}


export default App;
