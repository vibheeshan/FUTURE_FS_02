import React, { useState, useEffect } from 'react';

function Analytics({ token, refreshKey }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [refreshKey]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leads/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (error) {
      setError('Network error');
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  const statusConfig = {
    new: { label: 'New', color: '#10b981', icon: '✨' },
    contacted: { label: 'Contacted', color: '#3b82f6', icon: '📞' },
    qualified: { label: 'Qualified', color: '#8b5cf6', icon: '✓' },
    proposal: { label: 'Proposal', color: '#f59e0b', icon: '📄' },
    converted: { label: 'Converted', color: '#06b6d4', icon: '🎉' },
    lost: { label: 'Lost', color: '#ef4444', icon: '✗' }
  };

  return (
    <div className="analytics-container">
      <div className="page-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="subtitle">Track your lead performance and conversion metrics</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>Total Leads</h3>
            <p className="metric-value">{analytics.totalLeads}</p>
            <span className="metric-label">All time</span>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>Converted</h3>
            <p className="metric-value">{analytics.convertedLeads}</p>
            <span className="metric-label">{analytics.conversionRate}% conversion rate</span>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>Recent Leads</h3>
            <p className="metric-value">{analytics.recentLeads}</p>
            <span className="metric-label">Last 30 days</span>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>New Leads</h3>
            <p className="metric-value">{analytics.newLeads}</p>
            <span className="metric-label">Awaiting contact</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Leads by Status</h3>
          <div className="chart-content">
            {analytics.leadsByStatus.map((item) => {
              const config = statusConfig[item._id] || statusConfig.new;
              const percentage = ((item.count / analytics.totalLeads) * 100).toFixed(1);
              
              return (
                <div key={item._id} className="chart-bar-item">
                  <div className="chart-bar-label">
                    <span className="chart-icon">{config.icon}</span>
                    <span>{config.label}</span>
                    <span className="chart-count">{item.count}</span>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: config.color
                      }}
                    >
                      <span className="chart-bar-value">{percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <h3>Leads by Source</h3>
          <div className="chart-content">
            {analytics.leadsBySource.map((item, index) => {
              const percentage = ((item.count / analytics.totalLeads) * 100).toFixed(1);
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
              const color = colors[index % colors.length];
              
              return (
                <div key={item._id} className="chart-bar-item">
                  <div className="chart-bar-label">
                    <span>{item._id}</span>
                    <span className="chart-count">{item.count}</span>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    >
                      <span className="chart-bar-value">{percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="insights-card">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-item">
            <div className="insight-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <h4>Conversion Performance</h4>
              <p>
                {analytics.conversionRate >= 20 
                  ? '🎉 Excellent! Your conversion rate is above industry average.'
                  : analytics.conversionRate >= 10
                  ? '👍 Good conversion rate. Keep nurturing your leads.'
                  : '💡 Consider improving your follow-up process to increase conversions.'}
              </p>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h4>Lead Activity</h4>
              <p>
                You have {analytics.newLeads} new lead{analytics.newLeads !== 1 ? 's' : ''} waiting for contact. 
                {analytics.newLeads > 0 && ' Reach out soon to improve conversion chances!'}
              </p>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h4>Top Source</h4>
              <p>
                {analytics.leadsBySource.length > 0 
                  ? `Most leads are coming from ${analytics.leadsBySource[0]._id}. Consider focusing marketing efforts here.`
                  : 'Start tracking your lead sources for better insights.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
