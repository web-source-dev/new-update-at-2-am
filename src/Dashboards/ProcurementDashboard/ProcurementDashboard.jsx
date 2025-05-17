import React, { useEffect, useState } from 'react';
import { Route, Routes, useMatch, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import axios from 'axios';
import Logout from '../DashBoardComponents/Logout';
import ProfileManagement from '../AdminDashBoard/AdminPages/ProfileManagement';
import AnnouncementToast from '../../Components/Toast/announcmentToast';
import MemberOverview from './memberPages/MemberOverview';
import MemberCommitments from './memberPages/MemberCommitments';
// import MemberFavorites from './memberPages/MemberFavorites';
import MemberAnalytics from './memberPages/MemberAnalytics';
import MemberSettings from './memberPages/MemberSettings';
import NotificationIcon from '../../Components/Notification/NotificationIcon';
import DisplaySplashContent from '../../Components/SplashPage/DisplaySplashContent';
import { Helmet } from 'react-helmet';
import DetailedAnalytics from './memberPages/DetailedAnalytics';
import { Button } from '@mui/material';
import SplashAgain from '../Components/SplashAgain';
import AddMembers from './memberPages/AddMembers';
const MemberDashboard = () => {
  let match = useMatch('/dashboard/co-op-member/*');
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();
  const [splashContent, setSplashContent] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId || localStorage.getItem('user_role') === 'distributor') {
      navigate('/login');
    }
  }, [navigate]);
  
  const userData = async () => {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/v2/profile/${userId}`);
      setUser(response.data);
  }

  useEffect(() => {
    const fetchSplashContent = async () => {
      const userRole = localStorage.getItem('user_role');
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/splash`, {
        headers: { 'user-role': userRole }
      });
      console.log('Splash content response:', response.data);
      console.log('Splash content length:', response.data.length);
      setSplashContent(response.data);
    };
    userData();
    fetchSplashContent();
  }, []);

  const links = [
    { path: 'overview', label: 'Overview' },
    { path: 'commitments', label: 'My Commitments' },
    { path: `profile/${userId}`, label: 'Profile' },
];
if (!user?.addedBy) {
 links.push({ path: 'analytics', label: 'Analytics' });
   links.push({ path: 'add-members', label: 'Add Members' });
 links.push({ path: 'detailed-analytics', label: 'Detailed Analytics' });
    }

  return (
    <>
      <Helmet>
        <title>NMGA - Procurement Dashboard</title>
        <meta name="description" content="NMGA Procurement Dashboard - Manage procurement processes, track orders, and optimize your supply chain" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {splashContent.length > 0 && <DisplaySplashContent content={splashContent} />}
      <div style={{ display: 'flex', width: '100%' }}>
        <Sidebar match={match} links={links} />
        <div style={{ flexGrow: 1, padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button 
  onClick={() => navigate(`offers/view/splash-content?id=${userId}&session=${userId}&role=distributor?offer=true`)}
  sx={{
    border: '2px solid #007bff',
    color: '#007bff',
    backgroundColor: 'white',
    padding: { xs: '4px 4px', md: '10px 10px' },
    cursor: 'pointer',
    borderRadius: 25,
    fontSize: { xs: '12px', md: '16px' },
    fontWeight: 'bold',
    textTransform: 'uppercase',
    transition: 'background-color 0.3s ease',
    marginRight: '4px',
    '&:hover': {
      backgroundColor: '#0056b3',
      color: 'white',
    },
  }}
>
Advertisements
</Button>

<Button 
  onClick={() => navigate('/deals-catlog')}
  sx={{
    border: '2px solid #007bff',
    color: '#007bff',
    backgroundColor: 'white',
    padding: { xs: '4px 4px', md: '10px 10px' },
    cursor: 'pointer',
    borderRadius: 25,
    fontSize: { xs: '12px', md: '16px' },
    fontWeight: 'bold',
    textTransform: 'uppercase',
    transition: 'background-color 0.3s ease',
    marginRight: '4px',
    '&:hover': {
      backgroundColor: '#0056b3',
      color: 'white',
    },
  }}
>
  Explore Deals
</Button>

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
            {/* <Route path="favorites" element={<>
              <AnnouncementToast event="favorites" />
              <MemberFavorites userId={userId} />
            </>} /> */}
            <Route path="analytics" element={<>
              <AnnouncementToast event="analytics" />
              <MemberAnalytics userId={userId} />
            </>} />
            <Route path="profile/:userId" element={<>
              <AnnouncementToast event="profile" />
              <ProfileManagement />
            </>} />
            <Route path="offers/view/splash-content" element={<>
              <SplashAgain />

            </>} />
            <Route path="settings" element={<MemberSettings userId={userId} />} />
            <Route path="detailed-analytics" element={<DetailedAnalytics userId={userId} />} />
            <Route path="add-members" element={
              <>
              <AnnouncementToast event="add-members" />
              {!user?.addedBy && <AddMembers />}
              </>
              } />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default MemberDashboard;
