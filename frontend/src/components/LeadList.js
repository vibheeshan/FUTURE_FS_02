import React, { useState, useEffect } from 'react';
import LeadDetail from './LeadDetail';

function LeadList({ token, refreshKey, onRefresh }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [refreshKey, searchTerm, filterStatus, filterSource]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = '/api/leads?';
      if (searchTerm) url += `search=${searchTerm}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterSource) url += `source=${filterSource}&`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.data);
      } else {
        setError('Failed to fetch leads');
      }
    } catch (error) {
      setError('Network error');
      console.error('Fetch leads error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onRefresh();
        setSelectedLead(null);
      } else {
        alert('Failed to delete lead');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Network error');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: 'New', color: '#10b981' },
      contacted: { label: 'Contacted', color: '#3b82f6' },
      qualified: { label: 'Qualified', color: '#8b5cf6' },
      proposal: { label: 'Proposal', color: '#f59e0b' },
      converted: { label: 'Converted', color: '#06b6d4' },
      lost: { label: 'Lost', color: '#ef4444' }
    };

    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className="status-badge" style={{ backgroundColor: config.color }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading && leads.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="lead-list-container">
      <div className="page-header">
        <div>
          <h1>Lead Management</h1>
          <p className="subtitle">Manage and track your client leads</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Lead
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>

        <select 
          className="filter-select"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
        >
          <option value="">All Sources</option>
          <option value="Website">Website</option>
          <option value="Referral">Referral</option>
          <option value="Social Media">Social Media</option>
          <option value="Email Campaign">Email Campaign</option>
          <option value="Other">Other</option>
        </select>

        {(searchTerm || filterStatus || filterSource) && (
          <button 
            className="btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('');
              setFilterSource('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Source</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <p>No leads found</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Your First Lead
                  </button>
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id} onClick={() => setSelectedLead(lead)}>
                  <td>
                    <div className="lead-name">
                      <div className="avatar">{lead.name.charAt(0).toUpperCase()}</div>
                      <strong>{lead.name}</strong>
                    </div>
                  </td>
                  <td>{lead.email}</td>
                  <td>{lead.company || '-'}</td>
                  <td>
                    <span className="source-tag">{lead.source}</span>
                  </td>
                  <td>{getStatusBadge(lead.status)}</td>
                  <td>{formatDate(lead.createdAt)}</td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                      }}
                      title="View Details"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
      </div>

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          token={token}
          onClose={() => setSelectedLead(null)}
          onUpdate={onRefresh}
          onDelete={handleDelete}
        />
      )}

      {showCreateModal && (
        <LeadDetail
          token={token}
          onClose={() => setShowCreateModal(false)}
          onUpdate={onRefresh}
          isNew={true}
        />
      )}
    </div>
  );
}

export default LeadList;
