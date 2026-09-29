import React, { useState } from 'react';
import api from '../api';

export default function AddPropertyModal({ onClose, onPropertyAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'Apartment',
    listingType: 'Sale',
    price: '',
    location: '',
    city: 'Hyderabad',
    bedrooms: '3',
    bathrooms: '3',
    areaSqft: '',
    primaryImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    amenities:
      '24/7 Security, Power Backup, Covered Parking, Swimming Pool',
    agentName: 'EstateX Advisory Partner',
    agentPhone: '+91 98765 43210',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleImages = [
    {
      label: 'Modern Villa',
      url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Luxury Apartment',
      url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Penthouse',
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Contemporary Home',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.price ||
      !formData.location ||
      !formData.areaSqft
    ) {
      setError(
        'Please provide the property title, price, location, and area.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        areaSqft: Number(formData.areaSqft),
        amenities: formData.amenities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const res = await api.createProperty(payload);

      if (onPropertyAdded) {
        onPropertyAdded(res.data);
      }

      onClose();
    } catch (err) {
      setError(
        err.message ||
          'Unable to publish the property. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content add-property-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="modal-header">
          <h2>List Your Property</h2>
          <p>
            Add your property details and publish your listing on EstateX.
          </p>
        </div>

        {error && (
          <div className="form-error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-property-form">

          {/* Basic Property Information */}
          <div className="form-section-title">
            Property Information
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Property Title *</label>

              <input
                type="text"
                required
                placeholder="e.g. Royal Palms Luxury Duplex"
                value={formData.title}
                onChange={(e) =>
                  handleChange('title', e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Neighborhood / Location *</label>

              <input
                type="text"
                required
                placeholder="e.g. Kokapet, Gachibowli, Banjara Hills"
                value={formData.location}
                onChange={(e) =>
                  handleChange('location', e.target.value)
                }
              />
            </div>
          </div>

          {/* Property Type / Listing / Price */}
          <div className="form-row-3">

            <div className="form-group">
              <label>Property Type</label>

              <select
                value={formData.propertyType}
                onChange={(e) =>
                  handleChange('propertyType', e.target.value)
                }
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="House">House</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div className="form-group">
              <label>Listing Type</label>

              <select
                value={formData.listingType}
                onChange={(e) =>
                  handleChange('listingType', e.target.value)
                }
              >
                <option value="Sale">For Sale</option>
                <option value="Rent">For Rent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price in INR (₹) *</label>

              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 15000000"
                value={formData.price}
                onChange={(e) =>
                  handleChange('price', e.target.value)
                }
              />
            </div>

          </div>

          {/* Property Specifications */}
          <div className="form-section-title">
            Property Specifications
          </div>

          <div className="form-row-3">

            <div className="form-group">
              <label>Bedrooms</label>

              <select
                value={formData.bedrooms}
                onChange={(e) =>
                  handleChange('bedrooms', e.target.value)
                }
              >
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>

            <div className="form-group">
              <label>Bathrooms</label>

              <input
                type="number"
                min="1"
                max="10"
                value={formData.bathrooms}
                onChange={(e) =>
                  handleChange('bathrooms', e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Area (Sq. Ft) *</label>

              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 2400"
                value={formData.areaSqft}
                onChange={(e) =>
                  handleChange('areaSqft', e.target.value)
                }
              />
            </div>

          </div>

          {/* Property Image */}
          <div className="form-section-title">
            Property Images
          </div>

          <div className="form-group">
            <label>Primary Image</label>

            <input
              type="url"
              placeholder="Paste property image URL"
              value={formData.primaryImage}
              onChange={(e) =>
                handleChange('primaryImage', e.target.value)
              }
            />

            <div className="sample-img-picker">
              <span>Choose a preset:</span>

              {sampleImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  className={`preset-img-btn ${
                    formData.primaryImage === img.url
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    handleChange('primaryImage', img.url)
                  }
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="form-group">
            <label>Amenities</label>

            <input
              type="text"
              placeholder="Swimming Pool, Gym, Security, Garden"
              value={formData.amenities}
              onChange={(e) =>
                handleChange('amenities', e.target.value)
              }
            />

            <small>
              Separate multiple amenities with commas.
            </small>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Property Description</label>

            <textarea
              rows={3}
              placeholder="Describe the property, features, nearby facilities and other important details..."
              value={formData.description}
              onChange={(e) =>
                handleChange('description', e.target.value)
              }
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">

            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Property'}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}