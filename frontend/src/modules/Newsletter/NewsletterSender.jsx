import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import './NewsletterSender.css';

const NewsletterSender = () => {
  const [scheduleName, setScheduleName] = useState('');
  const [hour, setHour] = useState('HH');
  const [minute, setMinute] = useState('MM');
  const [ampm, setAmpm] = useState('AM');
  const [emails, setEmails] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [dashboards, setDashboards] = useState({
    all: true,
    sales: false,
    dailySales: false,
    newsletter: false,
    dailySalesTemplate: false,
    newsletterTemplate: false
  });

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter' && emails.trim() !== '') {
      e.preventDefault();
      if (!emailList.includes(emails.trim())) {
        setEmailList([...emailList, emails.trim()]);
      }
      setEmails('');
    }
  };

  const removeEmail = (indexToRemove) => {
    setEmailList(emailList.filter((_, index) => index !== indexToRemove));
  };

  const handleDashboardToggle = (key) => {
    if (key === 'all') {
      const newValue = !dashboards.all;
      setDashboards({
        all: newValue,
        sales: newValue ? false : dashboards.sales,
        dailySales: newValue ? false : dashboards.dailySales,
        newsletter: newValue ? false : dashboards.newsletter,
        dailySalesTemplate: newValue ? false : dashboards.dailySalesTemplate,
        newsletterTemplate: newValue ? false : dashboards.newsletterTemplate
      });
    } else {
      setDashboards(prev => {
        const updated = { ...prev, [key]: !prev[key] };
        // If any specific option is selected, uncheck "All Dashboards"
        if (updated[key]) {
          updated.all = false;
        }
        // If all specific options are unselected, maybe check "All Dashboards" (optional logic)
        return updated;
      });
    }
  };

  const getSelectedDashboardsText = () => {
    if (dashboards.all) return 'All Dashboards';
    const selected = [];
    if (dashboards.sales) selected.push('Sales Dashboard');
    if (dashboards.dailySales) selected.push('Daily Sales Dashboard');
    if (dashboards.newsletter) selected.push('Newsletter Performance');
    if (dashboards.dailySalesTemplate) selected.push('DailySalesEmailTemplate.html');
    if (dashboards.newsletterTemplate) selected.push('NewsletterEmailTemplate.html');
    
    if (selected.length === 0) return 'Select Dashboard(s)';
    if (selected.length === 1) return selected[0];
    return `${selected.length} Selected`;
  };

  const handleRegister = async () => {
    try {
      const selectedDashboards = [];
      if (dashboards.sales) selectedDashboards.push('Sales Dashboard');
      if (dashboards.dailySales) selectedDashboards.push('Daily Sales Dashboard');
      if (dashboards.newsletter) selectedDashboards.push('Newsletter Performance');
      if (dashboards.dailySalesTemplate) selectedDashboards.push('DailySalesEmailTemplate.html');
      if (dashboards.newsletterTemplate) selectedDashboards.push('NewsletterEmailTemplate.html');
      
      if (dashboards.all || selectedDashboards.length === 0) {
        selectedDashboards.push('All Dashboards');
      }

      const scheduleData = {
        scheduleName,
        dashboards: selectedDashboards,
        time: `${hour}:${minute} ${ampm}`,
        recipients: emailList.length > 0 ? emailList : (emails ? [emails] : [])
      };
      
      await api.createSchedule(scheduleData);
      alert('HTML Template Sender Registered Successfully!');
    } catch (error) {
      console.error('Error scheduling template:', error);
      alert('Failed to register template. Please check console.');
    }
  };

  return (
    <div className="ns-card">
      <div className="ns-header">
        <h2 className="ns-title">
          <svg className="ns-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          Automatic Template HTML Sender
        </h2>
        <p className="ns-subtitle">Schedule dynamic, real-time HTML email templates (e.g. Sales Data) directly to recipients.</p>
      </div>

      <div className="ns-form-grid">
        <div className="ns-field">
          <label>SCHEDULE NAME</label>
          <input 
            type="text" 
            placeholder="Weekly KPI Summary..." 
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
          />
        </div>

        <div className="ns-field" ref={dropdownRef}>
          <label>SELECT DASHBOARD(S)</label>
          <div className="ns-custom-select" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span>{getSelectedDashboardsText()}</span>
            <svg className={`ns-chevron ${isDropdownOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          {isDropdownOpen && (
            <div className="ns-dropdown-menu">
              <label className="ns-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={dashboards.all} 
                  onChange={() => handleDashboardToggle('all')}
                />
                <span className="ns-checkmark"></span>
                All Dashboards
              </label>
              <label className="ns-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={dashboards.sales} 
                  onChange={() => handleDashboardToggle('sales')}
                />
                <span className="ns-checkmark"></span>
                Sales Dashboard
              </label>
              <label className="ns-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={dashboards.dailySales} 
                  onChange={() => handleDashboardToggle('dailySales')}
                />
                <span className="ns-checkmark"></span>
                Daily Sales Dashboard
              </label>
              <label className="ns-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={dashboards.newsletter} 
                  onChange={() => handleDashboardToggle('newsletter')}
                />
                <span className="ns-checkmark"></span>
                Newsletter Performance
              </label>
              <label className="ns-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={dashboards.dailySalesTemplate} 
                  onChange={() => handleDashboardToggle('dailySalesTemplate')}
                />
                <span className="ns-checkmark"></span>
                DailySalesEmailTemplate.html
              </label>
              <label className="ns-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={dashboards.newsletterTemplate} 
                  onChange={() => handleDashboardToggle('newsletterTemplate')}
                />
                <span className="ns-checkmark"></span>
                NewsletterEmailTemplate.html
              </label>
            </div>
          )}
        </div>

        <div className="ns-field">
          <label>SEND TIME (UTC)</label>
          <div className="ns-time-wrapper">
            <select value={hour} onChange={(e) => setHour(e.target.value)}>
              <option value="HH" disabled>HH</option>
              {[...Array(12)].map((_, i) => {
                const val = (i + 1).toString().padStart(2, '0');
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
            <span className="ns-colon">:</span>
            <select value={minute} onChange={(e) => setMinute(e.target.value)}>
              <option value="MM" disabled>MM</option>
              {['00', '15', '30', '45'].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
            <select value={ampm} onChange={(e) => setAmpm(e.target.value)}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ns-form-grid" style={{ gridTemplateColumns: '1fr', marginTop: '10px' }}>
        <div className="ns-field">
          <label>RECIPIENTS EMAIL (PRESS ENTER)</label>
          <div className="ns-email-input-container">
            {emailList.map((email, index) => (
              <span key={index} className="ns-email-badge">
                {email}
                <button onClick={() => removeEmail(index)}>&times;</button>
              </span>
            ))}
            <input 
              type="text" 
              placeholder={emailList.length === 0 ? "name@company.com" : ""} 
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              style={{ flex: 1, minWidth: '150px', border: 'none', background: 'transparent' }}
            />
          </div>
        </div>
      </div>

      <div className="ns-footer">
        <button className="ns-register-btn" onClick={handleRegister}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          Register HTML Template Sender
        </button>
      </div>
    </div>
  );
};

export default NewsletterSender;
