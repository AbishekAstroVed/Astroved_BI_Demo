const originalFetch = window.fetch;
const fetch = (url, options = {}) => {
  const token = localStorage.getItem('astroved_token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return originalFetch(url, { ...options, headers });
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  // Auth
  login: (username, password) => fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: username, password })
  }).then(handleResponse),
  logout: (empId) => fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ empId })
  }).then(handleResponse),

  // Users
  getUsers: () => fetch('/api/admin/users').then(handleResponse),
  createUser: (user) => fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  }).then(handleResponse),
  updateUser: (empId, updates) => fetch(`/api/admin/users/${empId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).then(handleResponse),
  deleteUser: (empId) => fetch(`/api/admin/users/${empId}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Roles
  getRoles: () => fetch('/api/admin/roles').then(handleResponse),
  updateRole: (role, permissions) => fetch(`/api/admin/roles/${role}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permissions })
  }).then(handleResponse),

  // KPIs
  getKPIs: () => fetch('/api/admin/kpis').then(handleResponse),
  createKPI: (kpi) => fetch('/api/admin/kpis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(kpi)
  }).then(handleResponse),
  deleteKPI: (id) => fetch(`/api/admin/kpis/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Targets
  getTargets: () => fetch('/api/admin/targets').then(handleResponse),
  createTarget: (target) => fetch('/api/admin/targets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(target)
  }).then(handleResponse),
  updateTarget: (id, updates) => fetch(`/api/admin/targets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).then(handleResponse),
  deleteTarget: (id) => fetch(`/api/admin/targets/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Schedules
  getSchedules: () => fetch('/api/admin/schedules').then(handleResponse),
  createSchedule: (schedule) => fetch('/api/admin/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule)
  }).then(handleResponse),
  deleteSchedule: (id) => fetch(`/api/admin/schedules/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  triggerTestReport: (scheduleData) => fetch('/api/admin/schedules/trigger-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData)
  }).then(handleResponse),

  // Notifications
  getNotifications: () => fetch('/api/admin/notifications').then(handleResponse),
  updateNotifications: (settings) => fetch('/api/admin/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }).then(handleResponse),

  // AI Settings
  getAISettings: () => fetch('/api/admin/ai').then(handleResponse),
  updateAISettings: (settings) => fetch('/api/admin/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }).then(handleResponse),
  generateAIInsights: (startDate, endDate) => {
    let url = '/api/admin/ai/insights';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return fetch(url, { method: 'POST' }).then(handleResponse);
  },

  // Integrations
  getIntegrations: () => fetch('/api/admin/integrations').then(handleResponse),
  toggleIntegration: (id) => fetch(`/api/admin/integrations/${id}`, {
    method: 'PATCH'
  }).then(handleResponse),
  updateIntegrationConfig: (id, config) => fetch(`/api/admin/integrations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config })
  }).then(handleResponse),

  // Audit Logs
  getAuditLogs: () => fetch('/api/admin/audit').then(handleResponse),
  createAuditLog: (log) => fetch('/api/admin/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log)
  }).then(handleResponse),

  // System Config
  getSystemConfig: () => fetch('/api/admin/system').then(handleResponse),
  updateSystemConfig: (config) => fetch('/api/admin/system', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  }).then(handleResponse),

  // Dashboard Metrics
  getExecutiveDashboard: (startDate, endDate) => fetch(`/api/dashboard/executive?startDate=${startDate}&endDate=${endDate}`).then(handleResponse),
  getDailySalesDashboard: (dailyDate) => fetch(`/api/dashboard/sales/daily?dailyDate=${dailyDate}`).then(handleResponse),
  getMonthlySalesDashboard: (startDate, endDate) => fetch(`/api/dashboard/sales/monthly?startDate=${startDate}&endDate=${endDate}`).then(handleResponse),
  getMarketingDashboard: (startDate, endDate) => fetch(`/api/dashboard/marketing?startDate=${startDate}&endDate=${endDate}`).then(handleResponse),
  syncMetaAds: () => fetch('/api/dashboard/marketing/meta/sync', { method: 'POST' }).then(handleResponse),
  syncGoogleAds: () => fetch('/api/dashboard/marketing/google/sync', { method: 'POST' }).then(handleResponse),
  updateCampaignStatus: (id, updates) => fetch(`/api/dashboard/marketing/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).then(handleResponse),
  createCampaign: (campaignData) => fetch('/api/dashboard/marketing/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaignData)
  }).then(handleResponse),
  getNewsletterDashboard: (startDate, endDate, categories, eventName) => {
    let url = `/api/dashboard/newsletter?startDate=${startDate}&endDate=${endDate}`;
    if (categories && categories.length > 0) {
      url += `&categories=${categories.join(',')}`;
    }
    if (eventName && eventName !== 'All') {
      url += `&eventName=${encodeURIComponent(eventName)}`;
    }
    return fetch(url).then(handleResponse);
  },
  getAllEventNames: () => fetch('/api/dashboard/newsletter/events').then(handleResponse),
  getSEODashboard: (startDate, endDate) => fetch(`/api/dashboard/seo?startDate=${startDate}&endDate=${endDate}`).then(handleResponse),
  getCustomerDashboard: (startDate, endDate) => fetch(`/api/dashboard/customer?startDate=${startDate}&endDate=${endDate}`).then(handleResponse),
  getCustomerMetrics: (period, startDate, endDate) => {
    let url = `/api/dashboard/customer-metrics?period=${period}`;
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    return fetch(url).then(handleResponse);
  },

  // Import / Export
  exportCollectionUrl: (collection, format = 'csv') => `/api/admin/export/${collection}?format=${format}`,
  importCollection: (collection, format, data) => fetch(`/api/admin/import/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format, data })
  }).then(handleResponse),
  restoreDatabaseBackup: (backupData) => fetch('/api/admin/system/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backupData)
  }).then(handleResponse)
};
