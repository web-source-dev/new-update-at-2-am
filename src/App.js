import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Box, Typography } from "@mui/material";
import { Helmet } from 'react-helmet';
import AllDashboard from './Dashboards/AllDashboard';
import './Components/Buttons/buttons.css';
import './Components/Inputs/input.css';
import SignupForm from './Forms/SignupForm';
import LoginForm from './Forms/LoginForm';
import ForgetPassword from './Forms/ForgetPassword';
import ResetPassword from './Forms/ResetPassword';
import CreatePassword from './Pages/CreatePassword';
import ViewDeal from './Dashboards/DistributerDashboard/DistributerPages/ViewDeal';
import DisplayDeals from './Pages/DisplayDeals';
import ViewSingleDeal from './Pages/ViewSingleDeal';
import CommitmentDetails from './Dashboards/DashBoardComponents/CommitmentDetails';
import CommitmentCharts from './Dashboards/DashBoardComponents/CommitmentCharts';
import PaymentPage from './Payments/PaymentPage';
import ThankYou from './Payments/ThankYou';
import Home from './Pages/home';
import AboutUs from './Pages/aboutus';
import ContactUs from './Pages/contactus';
import FAQ from './Pages/faq';
import HowItWorks from './Pages/howitworks';
import Pricing from './Pages/pricing';
import PrivacyPolicy from './Pages/privacypolicy';
import Support from './Pages/support';
import TermsOfService from './Pages/termsofservice';
import Header from './Components/HeaderFotter/Header';
import Footer from './Components/HeaderFotter/Footer';
import SingleDealCommitments from './Dashboards/DashBoardComponents/SingleDealCommitments';
import Disclaimer from './Pages/Disclaimer';
import AllTopMembers from './Pages/AllTopMembers';
import EachMemberDetail from './Pages/EachMemberDetail';
import TopMembers from './Pages/TopMembers';
import DealAnalytics from './Dashboards/Components/DealAnalytics';

// Layout component to handle conditional rendering of Header and Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  // List of routes where header and footer should not appear
  const noHeaderFooterRoutes = [
    '/dashboard',
    '/register',
    '/login',
    '/forget-password',
    '/reset-password',
    '/create-password',
    '/payment',
    '/thank-you'
  ];

  // Check if current path starts with any of the excluded routes
  const shouldShowHeaderFooter = !noHeaderFooterRoutes.some(route => 
    path.startsWith(route)
  );

  return (
    <>
      {shouldShowHeaderFooter && <Header />}
      {children}
      {shouldShowHeaderFooter && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <>
        <Router>
      <Helmet>
        <title>NMGA - Next Generation Market Access</title>
        <meta name="description" content="NMGA - Your platform for next generation market access and business solutions" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
      </Helmet>
      <Routes>
        {/* Public pages with header and footer */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><AboutUs /></Layout>} />
        <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route path="/howitworks" element={<Layout><HowItWorks /></Layout>} />
        <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
        <Route path="/privacypolicy" element={<Layout><PrivacyPolicy /></Layout>} />
        <Route path="/support" element={<Layout><Support /></Layout>} />
        <Route path="/termsofservice" element={<Layout><TermsOfService /></Layout>} />
        <Route path="/deals-catlog" element={<Layout><DisplayDeals /></Layout>} />
        <Route path="/deals-catlog/deals/:dealId" element={<Layout><ViewSingleDeal /></Layout>} />
        <Route path="/disclaimer" element={<Layout><Disclaimer /></Layout>} />

        {/* Routes without header and footer */}
        <Route path="/dashboard/*" element={<AllDashboard />} />
        <Route path="/register" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/login/reset-password/:token" element={<ResetPassword />} />
        <Route path="/distributor/view/deals/:dealId/commitments" element={<SingleDealCommitments />} />
        <Route path="/login/create-password" element={<CreatePassword />} />
        <Route path="/distributor/view-deal/:dealId" element={<ViewDeal />} />
        <Route path="/dashboard/distributer/orders/:dealId" element={<ViewSingleDeal />} />
        <Route path="/commitment-details/:commitmentId" element={<CommitmentDetails />} />
        <Route path="/distributor/view/deals/:dealId/commitments/:commitmentId" element={<CommitmentDetails />} />
        <Route path="/commitment-charts/:userId" element={<CommitmentCharts />} />
        <Route path="/payment/:commitmentId" element={<PaymentPage />} />
        <Route path="/thank-you" element={<ThankYou />} />
        
        {/* Member Routes */}
        <Route path="/all-members" element={<AllTopMembers />} />
        <Route path="/member-details/:memberId" element={<EachMemberDetail />} />
        <Route path="/top-members" element={<TopMembers />} />

        {/* Distributor Routes */}
        <Route path="/distributor/deal-analytics/:dealId" element={<DealAnalytics />} />

        {/* Admin Routes */}
        <Route path="/admin/deal-analytics/:dealId" element={<DealAnalytics />} />
      </Routes>
    </Router>
    <Box
  sx={{
    position: "fixed",
    bottom: 20,
    left: { xs: "71%", sm: "80%", md: "90%", lg: "93%" }, // Adjust position based on screen size
    transform: "translateX(-50%)",
    color: "#fff", // Default color
    px: 2,
    py: 1,
    borderRadius: 1,
    fontWeight: "bold",
    zIndex: 1000,
    mixBlendMode: 'multiply'
  }}
>
  <a href="https://rtnglobal.site" target="_blank" rel="noopener noreferrer">
    <img src="/RTNLOGO.jpg" width="200px" alt="RTN Global Logo" />
  </a>
</Box>


    </>
  );
}

export default App;