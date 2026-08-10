import mongoose from 'mongoose';

const RolePermissionSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  permissions: {
    dashboard: {
      executive: { type: Boolean, default: false },
      sales: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
      seo: { type: Boolean, default: false },
      customer: { type: Boolean, default: false },
      funnel: { type: Boolean, default: false },
      operations: { type: Boolean, default: false },
      ai: { type: Boolean, default: false }
    },
    data: {
      view: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
      download: { type: Boolean, default: false },
      drillDown: { type: Boolean, default: false },
      viewCost: { type: Boolean, default: false },
      viewRevenue: { type: Boolean, default: false },
      viewProfit: { type: Boolean, default: false },
      viewCustomer: { type: Boolean, default: false }
    },
    management: {
      users: { type: Boolean, default: false },
      roles: { type: Boolean, default: false },
      kpis: { type: Boolean, default: false },
      targets: { type: Boolean, default: false },
      reports: { type: Boolean, default: false },
      ai: { type: Boolean, default: false },
      notifications: { type: Boolean, default: false },
      integrations: { type: Boolean, default: false },
      apis: { type: Boolean, default: false }
    },
    crud: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      approve: { type: Boolean, default: false },
      publish: { type: Boolean, default: false }
    }
  }
});

export default mongoose.model('RolePermission', RolePermissionSchema);
