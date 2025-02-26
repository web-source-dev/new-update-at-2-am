import React, { useEffect, useState } from 'react';
import { Route, Routes, useMatch, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import axios from 'axios';
import Logout from '../DashBoardComponents/Logout';
import ProfileManagement from '../AdminDashBoard/AdminPages/ProfileManagement';
import AnnouncementToast from '../../Components/Toast/announcmentToast';
import MemberOverview from './memberPages/MemberOverview';
import MemberCommitments from './memberPages/MemberCommitments';
import MemberFavorites from './memberPages/MemberFavorites';
import MemberAnalytics from './memberPages/MemberAnalytics';
import DashboardHome from './memberPages/DashboardHome';
import MemberSettings from './memberPages/MemberSettings';
import NotificationIcon from '../../Components/Notification/NotificationIcon';
import DisplaySplashContent from '../../Components/SplashPage/DisplaySplashContent';
import { Helmet } from 'react-helmet';
import DetailedAnalytics from './memberPages/DetailedAnalytics';

const MemberDashboard = () => {
  let match = useMatch('/dashboard/co-op-member/*');
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();
  const [splashContent, setSplashContent] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId || localStorage.getItem('user_role') === 'distributor') {
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
    { path: 'overview', label: 'Overview' },
    { path: 'commitments', label: 'My Commitments' },
    { path: 'favorites', label: 'Favorite Deals' },
    { path: 'analytics', label: 'Analytics' },
    { path: `profile/${userId}`, label: 'Profile' },
    { path: 'detailed-analytics', label: 'Detailed Analytics' },
  ];

  return (
    <>
      <Helmet>
        <title>NMGA - Procurement Dashboard</title>
        <meta name="description" content="NMGA Procurement Dashboard - Manage procurement processes, track orders, and optimize your supply chain" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <DisplaySplashContent content={splashContent} />
      <div style={{ display: 'flex', width: '100%' }}>
        <Sidebar match={match} links={links} />
        <div style={{ flexGrow: 1, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <NotificationIcon />
            <Logout />
          </div>

          <Routes>
            <Route path="/" element={<MemberOverview userId={userId} />} />
            <Route path="overview" element={<>
              <AnnouncementToast event="member_dashboard" />
              <MemberOverview userId={userId} />
            </>} />
            <Route path="commitments" element={<>
              <AnnouncementToast event="commitments" />
              <MemberCommitments userId={userId} />
            </>} />
            <Route path="favorites" element={<>
              <AnnouncementToast event="favorites" />
              <MemberFavorites userId={userId} />
            </>} />
            <Route path="analytics" element={<>
              <AnnouncementToast event="analytics" />
              <MemberAnalytics userId={userId} />
            </>} />
            <Route path="profile/:userId" element={<>
              <AnnouncementToast event="profile" />
              <ProfileManagement />
            </>} />
            <Route path="settings" element={<MemberSettings userId={userId} />} />
            <Route path="detailed-analytics" element={<DetailedAnalytics userId={userId} />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default MemberDashboard;
