import express from 'express';
import {
  getExecutiveDashboard,
  getDailySalesDashboard,
  getMonthlySalesDashboard,
  getMarketingDashboard,
  syncMetaAds,
  syncGoogleAds,
  updateMarketingCampaign,
  createMarketingCampaign,
  getSEODashboard,
  getCustomerDashboard,
  getCustomerMetrics,
  getMSSQLData,
  getNewsletterDashboard,
  getAllEventNames
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/executive', getExecutiveDashboard);
router.get('/sales/daily', getDailySalesDashboard);
router.get('/sales/monthly', getMonthlySalesDashboard);
router.get('/marketing', getMarketingDashboard);
router.post('/marketing/meta/sync', syncMetaAds);
router.post('/marketing/google/sync', syncGoogleAds);
router.patch('/marketing/campaigns/:id', updateMarketingCampaign);
router.post('/marketing/campaigns', createMarketingCampaign);
router.get('/seo', getSEODashboard);
router.get('/customer', getCustomerDashboard);
router.get('/customer-metrics', getCustomerMetrics);
router.get('/mssql', getMSSQLData);
router.get('/newsletter', getNewsletterDashboard);
router.get('/newsletter/events', getAllEventNames);

export default router;
