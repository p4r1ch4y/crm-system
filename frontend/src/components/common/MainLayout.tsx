import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import DarkModeToggle from './DarkModeToggle';
import NotificationBell from './NotificationBell';
import { socketService } from '../../services/socket.service';

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize socket connection when layout mounts
    if (accessToken) {
      socketService.initialize(accessToken);
    }

    return () => {
      socketService.disconnect();
    };
  }, [accessToken]);

  const handleLogout = async () => {
    socketService.disconnect();
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">CRM System</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {[
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/leads', label: 'Leads' },
                  { to: '/tasks', label: 'Tasks' },
                  { to: '/activities', label: 'Activities' },
                  ...(user && (user.role === 'ADMIN' || user.role === 'MANAGER') ? [{ to: '/logs', label: 'Logs' }] : []),
                ].map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ` +
                      (isActive
                        ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-900 dark:text-gray-100 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400')
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative flex items-center space-x-4">
                <NotificationBell />
                <DarkModeToggle />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="badge badge-primary">{user?.role}</span>
                <button onClick={handleLogout} className="btn btn-secondary text-sm">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
