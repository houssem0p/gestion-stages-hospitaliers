import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authAPI from '../../services/api';
import './Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [composeForm, setComposeForm] = useState({
    receiver_id: '',
    message_type: 'student_mentor',
    subject: '',
    content: '',
    internship_id: ''
  });
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (showCompose) {
      loadRecipients();
    }
  }, [showCompose]);

  const loadRecipients = async () => {
    setLoadingRecipients(true);
    try {
      const res = await authAPI.get('/messages/recipients');
      setRecipients(res.data.data || []);
    } catch (err) {
      console.error('Failed to load recipients', err);
      alert('Failed to load recipients: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingRecipients(false);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inbox') {
        const res = await authAPI.get('/messages/inbox');
        setMessages(res.data.data || []);
      } else {
        const res = await authAPI.get('/messages/sent');
        setSentMessages(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
      alert('Failed to load messages: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await authAPI.get('/messages/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error('Failed to load unread count', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!composeForm.receiver_id || !composeForm.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      await authAPI.post('/messages', composeForm);
      alert('Message sent successfully!');
      setShowCompose(false);
      setComposeForm({
        receiver_id: '',
        message_type: 'student_mentor',
        subject: '',
        content: '',
        internship_id: ''
      });
      loadMessages();
      loadUnreadCount();
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send message: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await authAPI.put(`/messages/${messageId}/read`);
      loadMessages();
      loadUnreadCount();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await authAPI.put('/messages/read-all');
      loadMessages();
      loadUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await authAPI.delete(`/messages/${messageId}`);
      loadMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Failed to delete message', err);
      alert('Failed to delete message: ' + (err.response?.data?.message || err.message));
    }
  };

  const openMessage = (message) => {
    setSelectedMessage(message);
    if (!message.is_read && activeTab === 'inbox') {
      handleMarkAsRead(message.id);
    }
  };

  const getMessageTypeLabel = (type) => {
    const labels = {
      'student_mentor': 'Student ↔ Mentor',
      'student_hospital': 'Student ↔ Hospital',
      'mentor_hospital': 'Mentor ↔ Hospital',
      'admin_broadcast': 'Admin Broadcast'
    };
    return labels[type] || type;
  };

  const getRelationshipLabel = (type) => {
    const labels = {
      'student': 'Étudiant',
      'doctor': 'Médecin',
      'teacher': 'Enseignant',
      'hospital': 'Hôpital'
    };
    return labels[type] || type;
  };

  const getMessageTypeForRelationship = (relationshipType, userRole) => {
    if (userRole === 'student') {
      if (relationshipType === 'doctor') return 'student_mentor';
      if (relationshipType === 'teacher') return 'student_mentor';
      if (relationshipType === 'hospital') return 'student_hospital';
    } else if (userRole === 'doctor') {
      if (relationshipType === 'student') return 'student_mentor';
      if (relationshipType === 'teacher') return 'mentor_hospital';
    } else if (userRole === 'teacher') {
      if (relationshipType === 'student') return 'student_mentor';
      if (relationshipType === 'doctor') return 'mentor_hospital';
    }
    return 'student_mentor';
  };

  const displayMessages = activeTab === 'inbox' ? messages : sentMessages;

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h2>💬 Messagerie</h2>
        <div className="messages-actions">
          {activeTab === 'inbox' && unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
              Marquer tout comme lu ({unreadCount})
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowCompose(true)}>
            ✉️ Nouveau message
          </button>
        </div>
      </div>

      <div className="messages-layout">
        {/* Messages List */}
        <div className="messages-sidebar">
          <div className="messages-tabs">
            <button
              className={`tab ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('inbox');
                setSelectedMessage(null);
              }}
            >
              📥 Boîte de réception
              {activeTab === 'inbox' && unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>
            <button
              className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('sent');
                setSelectedMessage(null);
              }}
            >
              📤 Messages envoyés
            </button>
          </div>

          {loading ? (
            <div className="loading">Chargement...</div>
          ) : displayMessages.length === 0 ? (
            <div className="empty-state">
              <p>Aucun message</p>
            </div>
          ) : (
            <div className="messages-list">
              {displayMessages.map(message => (
                <div
                  key={message.id}
                  className={`message-item ${!message.is_read && activeTab === 'inbox' ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                  onClick={() => openMessage(message)}
                >
                  <div className="message-item-header">
                    <strong>
                      {activeTab === 'inbox' 
                        ? `${message.sender_first_name} ${message.sender_last_name}`
                        : `${message.receiver_first_name} ${message.receiver_last_name}`
                      }
                    </strong>
                    {!message.is_read && activeTab === 'inbox' && (
                      <span className="unread-dot"></span>
                    )}
                  </div>
                  <div className="message-item-subject">
                    {message.subject || '(Sans objet)'}
                  </div>
                  <div className="message-item-preview">
                    {message.content.substring(0, 60)}...
                  </div>
                  <div className="message-item-time">
                    {new Date(message.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="messages-content">
          {selectedMessage ? (
            <div className="message-detail">
              <div className="message-detail-header">
                <div>
                  <h3>{selectedMessage.subject || '(Sans objet)'}</h3>
                  <div className="message-meta">
                    <span>
                      <strong>De:</strong> {selectedMessage.sender_first_name} {selectedMessage.sender_last_name} ({selectedMessage.sender_email})
                    </span>
                    <span>
                      <strong>À:</strong> {selectedMessage.receiver_first_name} {selectedMessage.receiver_last_name} ({selectedMessage.receiver_email})
                    </span>
                    <span>
                      <strong>Type:</strong> {getMessageTypeLabel(selectedMessage.message_type)}
                    </span>
                    {selectedMessage.internship_title && (
                      <span>
                        <strong>Stage:</strong> {selectedMessage.internship_title}
                      </span>
                    )}
                    <span>
                      <strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="message-actions">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
              <div className="message-body">
                <pre>{selectedMessage.content}</pre>
              </div>
            </div>
          ) : (
            <div className="no-message-selected">
              <p>Sélectionnez un message pour le lire</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouveau message</h3>
              <button className="close-btn" onClick={() => setShowCompose(false)}>✕</button>
            </div>
            <form onSubmit={handleSendMessage} className="compose-form">
              <div className="form-group">
                <label>Stage (optionnel - pour filtrer les destinataires)</label>
                <select
                  value={composeForm.internship_id}
                  onChange={(e) => {
                    setComposeForm({...composeForm, internship_id: e.target.value, receiver_id: ''});
                    loadRecipients();
                  }}
                >
                  <option value="">Tous les stages</option>
                  {[...new Set(recipients.map(r => ({ id: r.internship_id, title: r.internship_title })))]
                    .filter(i => i.id)
                    .map(internship => (
                      <option key={internship.id} value={internship.id}>
                        {internship.title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Destinataire *</label>
                {loadingRecipients ? (
                  <div>Chargement des destinataires...</div>
                ) : recipients.length === 0 ? (
                  <div style={{ color: '#e74c3c', padding: '8px', background: '#ffeaea', borderRadius: '4px' }}>
                    Aucun destinataire disponible. Vous devez être assigné à un stage pour envoyer des messages.
                  </div>
                ) : (
                  <select
                    value={composeForm.receiver_id}
                    onChange={(e) => {
                      const selected = recipients.find(r => r.id == e.target.value);
                      setComposeForm({
                        ...composeForm,
                        receiver_id: e.target.value,
                        message_type: getMessageTypeForRelationship(selected?.relationship_type, user?.role),
                        internship_id: selected?.internship_id || composeForm.internship_id
                      });
                    }}
                    required
                  >
                    <option value="">Sélectionnez un destinataire</option>
                    {recipients
                      .filter(r => !composeForm.internship_id || r.internship_id == composeForm.internship_id)
                      .map(recipient => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.first_name} {recipient.last_name} ({recipient.email}) 
                          {recipient.internship_title && ` - ${recipient.internship_title}`}
                          {recipient.relationship_type && ` [${getRelationshipLabel(recipient.relationship_type)}]`}
                        </option>
                      ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Type de message</label>
                <select
                  value={composeForm.message_type}
                  onChange={(e) => setComposeForm({...composeForm, message_type: e.target.value})}
                >
                  <option value="student_mentor">Student ↔ Mentor</option>
                  <option value="student_hospital">Student ↔ Hospital</option>
                  <option value="mentor_hospital">Mentor ↔ Hospital</option>
                  {user?.role === 'super_admin' && (
                    <option value="admin_broadcast">Admin Broadcast</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>Sujet</label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                  placeholder="Sujet du message"
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={composeForm.content}
                  onChange={(e) => setComposeForm({...composeForm, content: e.target.value})}
                  required
                  rows="8"
                  placeholder="Tapez votre message ici..."
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompose(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;

