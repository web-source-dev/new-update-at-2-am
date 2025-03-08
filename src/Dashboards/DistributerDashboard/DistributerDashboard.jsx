import React, { useEffect, useState } from 'react';
import { Route, Routes, useMatch, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import axios from 'axios';
import Logout from '../DashBoardComponents/Logout';
import ProfileManagement from '../AdminDashBoard/AdminPages/ProfileManagement';
import CreateDeal from './DistributerPages/CreateDeal';
import ManageDeals from './DistributerPages/ManageDeals';
import EditDeal from './DistributerPages/EditDeal';
import AnnouncementToast from '../../Components/Toast/announcmentToast';
import BulkUpload from './DistributerPages/BulkUpload';
import Commitments from '../DashBoardComponents/Commitment';
import Orders from './DistributerPages/Orders';
import DefualtPage from './DistributerPages/DefualtPage';
import NotificationIcon from '../../Components/Notification/NotificationIcon';
import DisplaySplashContent from '../../Components/SplashPage/DisplaySplashContent';
import { Helmet } from 'react-helmet';
import AllDeals from './DistributerPages/AcceptAllCommitments';
const DistributerDashboard = () => {
  const navigate  = useNavigate();
  let match = useMatch('/dashboard/distributor/*');
  const userId = localStorage.getItem('user_id');
  const [splashContent, setSplashContent] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId || localStorage.getItem('user_role') === 'member') {
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
    { path: 'orders', label: 'Orders' },
    { path: `profile/${userId}`, label: 'Profile' },
    { 
      title: 'Deals',
      subLinks: [
        { path: `deal/create`, label: 'Create Deal' },
        { path: `deal/manage/${userId}`, label: 'Manage Deals' },
        { path: `deal/bulk`, label: 'Bulk Upload' },
      ]
    },
    { path: `all/committed/deals`, label: 'All Committed Deals' },
  ];

  return (
    <>
      <Helmet>
        <title>NMGA - Distributor Dashboard</title>
        <meta name="description" content="NMGA Distributor Dashboard - Manage your distribution network, track orders, and monitor sales performance" />
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
              <AnnouncementToast event="signup" />
              <DefualtPage />
            </>} />
            <Route path="orders" element={<>
              <AnnouncementToast event="orders" />
              <Orders />
            </>} />
            <Route path="profile/:userId" element={<>
              <AnnouncementToast event="profile" />
              <ProfileManagement />
            </>} />
            <Route path="deal/create" element={<>
              <AnnouncementToast event="deal_management" />
              <CreateDeal />
            </>} />
            <Route path="deal/manage/:userId" element={<>
              <AnnouncementToast event="deal_management" />
              <ManageDeals />
            </>} />
            <Route path="edit-deal/:dealId" element={<>
              <AnnouncementToast event="deal_management" />
              <EditDeal />
            </>} />
            <Route path="deal/bulk" element={<>
              <AnnouncementToast event="deal_management" />
              <BulkUpload />
            </>} />
            <Route path="allcommitments/view/:userId" element={<>
              <AnnouncementToast event="deal_management" />
              <Commitments />
            </>} />
            <Route path="allDeals" element={<>
              <AnnouncementToast event="deal_management" />
              <AllDeals />
            </>} />
          </Routes>
        </div>
      </div>

    </>
  );
}

export default DistributerDashboard;
