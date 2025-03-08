import React, { useEffect, useState } from 'react';
import { Route, Routes, useMatch, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import DefualtPage from './AdminPages/DefualtPage';
import UserManagment from './AdminPages/UserManagment';
import DisplayLogs from './AdminPages/DisplayLogs';
import ProfileManagement from './AdminPages/ProfileManagement';
import Announcements from './AdminPages/Announcements';
import Logout from '../DashBoardComponents/Logout';
import AnnouncementToast from '../../Components/Toast/announcmentToast';
import DealsManagment from './AdminPages/DealManagement';
import Analytics from './AdminPages/Analytics';
import AllCommitments from './AdminPages/AllCommitments';
import NotificationIcon from '../../Components/Notification/NotificationIcon';
import CreateSplashContent from '../../Components/SplashPage/CreateSplashContent';
import DisplaySplashContent from '../../Components/SplashPage/DisplaySplashContent';
import LoadSplash from '../../Components/SplashPage/LoadSplash';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import AllDealsAdmin from './AdminPages/AllDealsAdmin';
const AdminDashboard = () => {
  let match = useMatch('/dashboard/admin/*');
  const navigate = useNavigate();
  const [splashContent, setSplashContent] = useState([]);

  useEffect(() => {
    const adminId = localStorage.getItem('admin_id');
    if (!adminId || localStorage.getItem('user_role') !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSplashContent = async () => {
      const userRole = localStorage.getItem('user_role');
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/splash`, {
        headers: { 'user-role': userRole }
      });
      setSplashContent(response.data);
    };

    fetchSplashContent();
  }, []);

  const links = [
    { path: '', label: 'Dashboard' },
    { path: 'analytics', label: 'Analytics' },
    { path: 'usermanagement', label: 'User Manage' },
    { path: 'all-deals', label: 'All Committed Deals' },
    { path: 'logs', label: 'User Monitoring' },
    { path: 'splash-content', label: 'Splash Content' },
    { path: 'deal-management', label: 'Deal Management' },
    { path: 'announcements', label: 'Announcements' },
  ];

  return (
    <>
      <Helmet>
        <title>NMGA - Admin Dashboard</title>
        <meta name="description" content="NMGA Admin Dashboard - Manage users, monitor activities, and control system settings" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {splashContent.length > 0 && <DisplaySplashContent content={splashContent} />}
      <div style={{ display: 'flex', width: '100%' }}>
        <Sidebar match={match} links={links} />
        <div style={{ flexGrow: 1, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <NotificationIcon />
            <Logout />
          </div>
          <Routes>
            <Route path="" element={<>
              <AnnouncementToast event="login" />
              <DefualtPage />
            </>} />
            <Route path="analytics" element={<>
              <AnnouncementToast event="analytics" />
              <Analytics />
            </>} />
            <Route path="overview" element={<AllCommitments />} />
            <Route path="usermanagement" element={<>
              <AnnouncementToast event="user_management" />
              <UserManagment />
            </>} />
            <Route path="logs" element={<>
              <AnnouncementToast event="logs" />
              <DisplayLogs />
            </>} />
            <Route path="profile-management/:userId" element={<>
              <AnnouncementToast event="profile" />
              <ProfileManagement /> 
            </>} />
            <Route path="splash-content/*" element={<>
              <AnnouncementToast event="splash_content" />
              <Routes>
              <Route path="/" element={<LoadSplash />} />
                <Route path="create" element={<CreateSplashContent />} />
                <Route path="edit/:id" element={<CreateSplashContent />} />
              </Routes>
            </>} />
            <Route path="deal-management" element={<>
              <AnnouncementToast event="deal_management" />
              <DealsManagment />
            </>} />
            <Route path="announcements" element={<>
              <AnnouncementToast event="announcements" />
              <Announcements />
            </>} />
            <Route path="all-deals" element={<>
              <AnnouncementToast event="all_deals" />
              <AllDealsAdmin />
            </>} />
          </Routes>
        </div>
      </div>

    </>
  );
}

export default AdminDashboard;
