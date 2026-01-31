import React, { useState } from 'react';

function LeadDetail({ lead, token, onClose, onUpdate, onDelete, isNew = false }) {
  const [editMode, setEditMode] = useState(isNew);
  const [formData, setFormData] = useState(
    isNew ? {
      name: '',
      email: '',
      phone: '',
      company: '',
      source: 'Website',
      status: 'new',
      message: '',
      budget: ''
    } : {
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source,
      status: lead.status,
      message: lead.message || '',
      budget: lead.budget || ''
    }
  );
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = isNew ? '/api/leads' : `/api/leads/${lead._id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onUpdate();
        if (isNew) {
          onClose();
        } else {
          setEditMode(false);
        }
      } else {
        alert('Failed to save lead');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/leads/${lead._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: noteContent })
      });

      if (response.ok) {
        setNoteContent('');
        onUpdate();
      } else {
        alert('Failed to add note');
      }
    } catch (error) {
      console.error('Add note error:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content lead-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{isNew ? 'New Lead' : editMode ? 'Edit Lead' : 'Lead Details'}</h2>
            {!isNew && !editMode && (
              <p className="modal-subtitle">Created {formatDate(lead.createdAt)}</p>
            )}
          </div>
          <button className="btn-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {editMode ? (
            <div className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Source</label>
                <select name="source" value={formData.source} onChange={handleChange}>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Email Campaign">Email Campaign</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label>Budget ($)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group full-width">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name</label>
                  <p>{lead.name}</p>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p><a href={`mailto:${lead.email}`}>{lead.email}</a></p>
                </div>
                <div className="detail-item">
                  <label>Phone</label>
                  <p>{lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Company</label>
                  <p>{lead.company || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Source</label>
                  <p><span className="source-tag">{lead.source}</span></p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p>
                    <span className={`status-badge status-${lead.status}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </p>
                </div>
                {lead.budget && (
                  <div className="detail-item">
                    <label>Budget</label>
                    <p>${lead.budget.toLocaleString()}</p>
                  </div>
                )}
                {lead.message && (
                  <div className="detail-item full-width">
                    <label>Message</label>
                    <p className="message-text">{lead.message}</p>
                  </div>
                )}
              </div>

              <div className="notes-section">
                <h3>Notes & Follow-ups</h3>
                
                <div className="add-note">
                  <textarea
                    placeholder="Add a note about this lead..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows="3"
                  />
                  <button 
                    className="btn-primary"
                    onClick={handleAddNote}
                    disabled={!noteContent.trim() || loading}
                  >
                    {loading ? 'Adding...' : 'Add Note'}
                  </button>
                </div>

                <div className="notes-list">
                  {lead.notes && lead.notes.length > 0 ? (
                    lead.notes.slice().reverse().map((note, index) => (
                      <div key={index} className="note-item">
                        <div className="note-header">
                          <strong>{note.createdBy?.name || 'User'}</strong>
                          <span className="note-date">{formatDate(note.createdAt)}</span>
                        </div>
                        <p>{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="empty-notes">No notes yet. Add one to track your follow-ups.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {editMode ? (
            <>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  if (isNew) {
                    onClose();
                  } else {
                    setEditMode(false);
                  }
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : (isNew ? 'Create Lead' : 'Save Changes')}
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-danger" 
                onClick={() => onDelete(lead._id)}
              >
                Delete
              </button>
              <div>
                <button className="btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button className="btn-primary" onClick={() => setEditMode(true)}>
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeadDetail;
