import React from 'react';
import KPICard from '../../components/KPICard';
import EChartWrapper from '../../charts/EChartWrapper';
import { getOperationsData } from '../../services/mockData';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { BookOpen, Server, Package, Ticket } from 'lucide-react';

const Operations = () => {
  const { startDate, endDate } = useDateFilter();
  const ops = getOperationsData(startDate, endDate);
  const { paymentSuccess, paymentFailureReasons, refunds, bookings, services, fulfillment, supportTickets, refundReasons, chargebacks } = ops;

  // Failure reasons Pie chart
  const failureOption = {
    title: {
      text: 'Payment Failure Causes',
      textStyle: { fontSize: 14 }
    },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: '0'
    },
    series: [
      {
        name: 'Failure Reason',
        type: 'pie',
        radius: '55%',
        center: ['50%', '45%'],
        itemStyle: {
          borderRadius: 8,
          borderColor: 'transparent',
          borderWidth: 2
        },
        data: paymentFailureReasons.map((reason, index) => {
          const colors = ['#f59e0b', '#ef4444', '#6366f1', '#06b6d4'];
          return {
            name: reason.reason,
            value: reason.count,
            itemStyle: { color: colors[index % colors.length] }
          };
        }),
        label: { show: false }
      }
    ]
  };

  // Refund reasons Pie chart
  const refundReasonsOption = {
    title: {
      text: 'Refund Reasons',
      textStyle: { fontSize: 14 }
    },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: '0',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 11 }
    },
    series: [
      {
        name: 'Refund Reason',
        type: 'pie',
        radius: '55%',
        center: ['50%', '45%'],
        itemStyle: {
          borderRadius: 8,
          borderColor: 'transparent',
          borderWidth: 2
        },
        data: refundReasons.map((reason, index) => {
          const colors = ['#f43f5e', '#8b5cf6', '#14b8a6', '#f59e0b'];
          return {
            name: reason.reason,
            value: reason.count,
            itemStyle: { color: colors[index % colors.length] }
          };
        }),
        label: { show: false }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <KPICard
          title="Payment Success Rate"
          value={paymentSuccess}
          compChange={0.5}
          formatType="percentage"
        />
        <KPICard
          title="Refunds Count"
          value={refunds.count}
          compChange={-4.5}
          formatType="number"
        />
        <KPICard
          title="Refunded Capital Value"
          value={refunds.amount}
          compChange={-8.2}
          formatType="currency"
        />
        <KPICard
          title="Refund Rate Ratio"
          value={refunds.rate}
          compChange={-0.1}
          formatType="percentage"
        />
        <KPICard
          title="Chargebacks Count"
          value={chargebacks.count}
          compChange={2.1}
          formatType="number"
        />
        <KPICard
          title="Chargebacks Value"
          value={chargebacks.amount}
          compChange={5.4}
          formatType="currency"
        />
      </div>

      {/* Bookings & Failures Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Statistics */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-cosmic-text font-semibold text-sm mb-4 flex items-center">
              <BookOpen size={16} className="text-cosmic-accent mr-1.5" />
              Consultation Bookings
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-cosmic-bg border border-cosmic-border">
                <span className="text-xs text-cosmic-muted">Total Consultations</span>
                <span className="text-sm font-bold text-cosmic-text">{bookings.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-xs text-cosmic-success">Completed</span>
                <span className="text-sm font-bold text-cosmic-success">{bookings.completed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-xs text-cosmic-accent">Pending Schedule</span>
                <span className="text-sm font-bold text-cosmic-accent">{bookings.pending.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <span className="text-xs text-cosmic-danger text-rose-500">Cancelled</span>
                <span className="text-sm font-bold text-cosmic-danger text-rose-500">{bookings.cancelled.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-cosmic-muted mt-4">
            92% session completion rate is above SLA benchmark (90%).
          </p>
        </div>

        {/* Failure Chart */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
          <EChartWrapper option={failureOption} height="260px" />
        </div>

        {/* System Service Health */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
          <h4 className="text-cosmic-text font-semibold text-sm mb-4 flex items-center">
            <Server size={16} className="text-indigo-400 mr-1.5" />
            Core Microservices Status
          </h4>
          <div className="space-y-3.5">
            {services.map((srv, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-cosmic-bg border border-cosmic-border">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    srv.status === 'Healthy' ? 'bg-cosmic-success bg-emerald-500' : 'bg-cosmic-accent bg-amber-500'
                  }`} />
                  <span className="text-xs font-semibold text-cosmic-text">{srv.name}</span>
                </div>
                <div className="text-right text-xs">
                  <span className="font-mono text-cosmic-muted">{srv.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Fulfillment Statistics */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-cosmic-text font-semibold text-sm mb-4 flex items-center">
              <Package size={16} className="text-blue-500 mr-1.5" />
              Order Fulfillment
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-cosmic-bg border border-cosmic-border">
                <span className="text-xs text-cosmic-muted">Total Orders</span>
                <span className="text-sm font-bold text-cosmic-text">{fulfillment.totalOrders.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-xs text-cosmic-success">Shipped</span>
                <span className="text-sm font-bold text-cosmic-success">{fulfillment.shipped.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-xs text-cosmic-accent">Pending Processing</span>
                <span className="text-sm font-bold text-cosmic-accent">{fulfillment.pending.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-cosmic-muted mt-4">
            92.1% fulfillment rate is healthy.
          </p>
        </div>

        {/* Refund Reasons Chart */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
          <EChartWrapper option={refundReasonsOption} height="260px" />
        </div>

        {/* Support Tickets */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-cosmic-text font-semibold text-sm mb-4 flex items-center">
              <Ticket size={16} className="text-fuchsia-500 mr-1.5" />
              Support Tickets
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-cosmic-bg border border-cosmic-border">
                <span className="text-xs text-cosmic-muted">Tickets Raised</span>
                <span className="text-sm font-bold text-cosmic-text">{supportTickets.raised.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-xs text-cosmic-success">Resolved</span>
                <span className="text-sm font-bold text-cosmic-success">{supportTickets.resolved.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-xs text-cosmic-accent">Pending</span>
                <span className="text-sm font-bold text-cosmic-accent">{supportTickets.pending.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-cosmic-bg border border-cosmic-border">
                <span className="text-xs text-cosmic-muted">Avg Resolution Time</span>
                <span className="text-sm font-bold text-indigo-400">{supportTickets.avgResolutionTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Operations;
