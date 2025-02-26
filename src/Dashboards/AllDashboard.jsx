import React from 'react';
import { Route, Routes, useMatch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AdminDashboard from './AdminDashBoard/AdminDashboard';
import DistributerDashboard from './DistributerDashboard/DistributerDashboard';
import CoopmemberDashboard from './ProcurementDashboard/ProcurementDashboard';

const AllDashboard = () => {
  let match = useMatch('/dashboard/*');

  return (
    <>
      <Helmet>
        <title>NMGA - Dashboard</title>
        <meta name="description" content="NMGA Dashboard - Access your personalized dashboard for market access and business management" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/distributor/*" element={<DistributerDashboard />} />
        <Route path="/co-op-member/*" element={<CoopmemberDashboard />} />
      </Routes>
    </>
  );
}

export default AllDashboard;
