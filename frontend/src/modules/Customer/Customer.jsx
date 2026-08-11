import React, { useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import MonthlyCustomers from './MonthlyCustomers';

const Customer = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
  if (userPermissions && userPermissions.data && userPermissions.data.viewCustomer === false) {
    return (
      <div className="p-6 text-center bg-cosmic-card border border-cosmic-border rounded-2xl max-w-md mx-auto mt-10">
        <h3 className="text-sm font-extrabold text-cosmic-text mb-2 flex items-center justify-center space-x-1.5">
          <span>🔒 Access Restricted</span>
        </h3>
        <p className="text-xs text-cosmic-muted">Your role profile does not have permission to view Customer cohorts or reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MonthlyCustomers />
    </div>
  );
};

export default Customer;
