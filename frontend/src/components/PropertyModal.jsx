import React, { useState } from 'react';
import api from '../api';

export default function PropertyModal({ property, onClose, onEnquirySuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I am interested in ${property.title} in ${property.location}. Please share more details.`,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      setError('Please fill out all contact fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.submitEnquiry({
        propertyId: property._id,
        ...formData,
      });
      setSubmitted(true);
      if (onEnquirySuccess) onEnquirySuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content property-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal-body-split">
          {/* Left Column: Media & Details */}
          <div className="modal-detail-left">
            <div className="modal-image-wrapper">
              <img
                src={property.primaryImage || (property.images && property.images[0]) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
                alt={property.title}
                className="modal-hero-img"
              />
              <span className="modal-type-badge">{property.propertyType}</span>
              <span className="modal-listing-badge">{property.listingType}</span>
            </div>

            <div className="modal-info-section">
              <span className="modal-location">📍 {property.location}, {property.city}</span>
              <h2 className="modal-title">{property.title}</h2>
              <div className="modal-price-tag">
                {property.priceFormatted || `₹${property.price.toLocaleString('en-IN')}`}
              </div>

              {/* Key Specs */}
              <div className="modal-specs-bar">
                <div className="spec-box">
                  <span className="spec-val">🛏️ {property.bedrooms}</span>
                  <span className="spec-lbl">Bedrooms</span>
                </div>
                <div className="spec-box">
                  <span className="spec-val">🚿 {property.bathrooms}</span>
                  <span className="spec-lbl">Bathrooms</span>
                </div>
                <div className="spec-box">
                  <span className="spec-val">📐 {property.areaSqft}</span>
                  <span className="spec-lbl">Sq.Ft</span>
                </div>
                <div className="spec-box">
                  <span className="spec-val">✓ {property.status}</span>
                  <span className="spec-lbl">Status</span>
                </div>
              </div>

              {/* Description */}
              <div className="modal-desc">
                <h4>About this property</h4>
                <p>{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="modal-amenities">
                  <h4>Amenities & Highlights</h4>
                  <div className="amenity-pills">
                    {property.amenities.map((item, idx) => (
                      <span key={idx} className="amenity-pill">
                        ✦ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent info */}
              <div className="modal-agent-card">
                <div className="agent-avatar">👤</div>
                <div>
                  <strong>{property.agentName || 'EstateX Advisory Partner'}</strong>
                  <p>Verified Property Specialist · {property.agentPhone || '+91 98765 43210'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="modal-detail-right">
            <div className="enquiry-card">
              <h3>Connect with Agent</h3>
              <p className="enquiry-sub">Schedule an in-person tour or request digital brochures.</p>

              {submitted ? (
                <div className="enquiry-success">
                  <div className="success-icon">✓</div>
                  <h4>Enquiry Sent to MongoDB!</h4>
                  <p>
                    Thank you, <strong>{formData.name}</strong>! Your inquiry for <em>{property.title}</em> has been saved to the database. An agent will call you shortly at <strong>{formData.phone}</strong>.
                  </p>
                  <button className="reset-btn" onClick={() => setSubmitted(false)}>
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="enquiry-form">
                  {error && <div className="form-error-alert">{error}</div>}

                  <div className="form-group">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arvind Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. arvind@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="submit-enquiry-btn" disabled={submitting}>
                    {submitting ? 'Submitting to Database...' : 'Send Enquiry'}
                  </button>

                  <span className="privacy-note">
                    🔒 Direct connection to MongoDB backend · No spam guaranteed
                  </span>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
