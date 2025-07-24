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
import DefualtPage from './DistributerPages/DefualtPage';
import NotificationIcon from '../../Components/Notification/NotificationIcon';
import DisplaySplashContent from '../../Components/SplashPage/DisplaySplashContent';
import { Helmet } from 'react-helmet';
import AllDeals from './DistributerPages/AcceptAllCommitments';
import AllMembersForDistributor from '../../TopMembersDistributer/AllMembersforDistributor';
import ViewSingleMember from '../../TopMembersDistributer/viewSingleMember';
import { Button } from '@mui/material';
import SplashAgain from '../Components/SplashAgain';
import CoopMembersPage from '../Pages/CoopMembersPage';
import AssignSupplierPage from '../Pages/AssignSupplierPage';
import { Navigate } from 'react-router-dom';
import Compare from '../../Compare/Compare';
import MemberCommitments from './DistributerPages/MemberCommitments';
import MemberDetails from './DistributerPages/MemberDetails';
import MediaManager from '../../Components/MediaManager/MediaManager';
const DistributerDashboard = () => {
  const navigate  = useNavigate();
  let match = useMatch('/dashboard/distributor/*');
  const userId = localStorage.getItem('user_id');
  const [splashContent, setSplashContent] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    const adminLogin = localStorage.getItem('adminLogin');
    
    // If not logged in, check URL parameters
    if ((!userId || (userRole !== 'distributor' && adminLogin !== 'true')) && window.location.search) {
      // URL parameters will be handled by AllDashboard component
      // Just wait a moment for them to be processed
      setTimeout(() => {
        const newUserId = localStorage.getItem('user_id');
        const newUserRole = localStorage.getItem('user_role');
        const newAdminLogin = localStorage.getItem('adminLogin');
        
        if (!newUserId || (newUserRole !== 'distributor' && newAdminLogin !== 'true')) {
          navigate('/login');
        }
      }, 100);
    } else if (!userId || (userRole !== 'distributor' && adminLogin !== 'true')) {
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
    { path: `Stores/Contacts`, label: 'Stores/Contacts' },
    { path: `coop-members`, label: 'Suppliers' },
    { path: `distributor/compare`, label: 'Compare Supply' },
    { path: `media`, label: 'Media' },
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center',borderBottom: '1px solid #e0e0e0',paddingBottom: '10px' }}>
          <Button
              onClick={() => {
                const userId = localStorage.getItem('user_id');
                const token = localStorage.getItem('token');
                const userRole = localStorage.getItem('user_role');
                
                const authParams = `id=${userId}&session=${userId}&role=distributor&offer=true&token=${encodeURIComponent(token)}&user_role=${encodeURIComponent(userRole)}&user_id=${encodeURIComponent(userId)}`;
                navigate(`offers/view/splash-content?${authParams}`);
              }}
              sx={{
                border: '2px solid',
                borderColor: 'primary.contrastText',
                color: 'primary.contrastText',
                backgroundColor: 'white',
                padding: 1,
                cursor: 'pointer',
                borderRadius: 25,
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'background-color 0.3s ease',
                marginRight: '20px',  
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              Advertisements
            </Button>
            <NotificationIcon />
            <Logout />
          </div>
          <Routes>
            <Route path="" element={<>
              <AnnouncementToast event="signup" />
              <DefualtPage />
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
            <Route path="all/committed/deals" element={<>
              <AnnouncementToast event="deal_management" />
              <AllDeals />
            </>} />
            <Route path="all/co-op-membors/:distributorId" element={<>
              <AnnouncementToast event="deal_management" />
              <AllMembersForDistributor />
            </>} />
            <Route path="view/co-op-membors/:distributorId/member/:memberId" element={<>
              <AnnouncementToast event="deal_management" />
              <ViewSingleMember />
            </>} />
            <Route path="offers/view/splash-content" element={<>
              <AnnouncementToast event="deal_management" />
              <SplashAgain />
            </>} />
            <Route path="coop-members" element={<>
              <AnnouncementToast event="deal_management" />
              <CoopMembersPage />
            </>} />
            <Route path="assign-supplier/:memberId" element={<>
              <AnnouncementToast event="deal_management" />
              <AssignSupplierPage />
            </>} />
            <Route path="distributor/compare" element={<>
              <AnnouncementToast event="deal_management" />
              <Compare />
            </>} />
            <Route path="media" element={<>
              <AnnouncementToast event="media" />
              <MediaManager />
            </>} />
            <Route path="Stores/Contacts" element={<>
              <AnnouncementToast event="deal_management" />
              <MemberCommitments />
            </>} />
            <Route path="Stores/Contacts/:memberId" element={<>
              <AnnouncementToast event="deal_management" />
              <MemberDetails />
            </>} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default DistributerDashboard;
