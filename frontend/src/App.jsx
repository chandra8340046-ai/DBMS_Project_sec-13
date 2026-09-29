import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import api from './api';
import PropertyModal from './components/PropertyModal';
import AddPropertyModal from './components/AddPropertyModal';
import AuthModal from './components/AuthModal';
import EmiModal from './components/EmiModal';

function App() {
  // Authentication
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Properties
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Search
  const [searchLookingFor, setSearchLookingFor] = useState('Buy');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchPropertyType, setSearchPropertyType] = useState('All');

  // Modals
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);

  // Toast
  const [toast, setToast] = useState('');

  // Load logged-in user
  useEffect(() => {
    const savedUser = localStorage.getItem('estatex_user');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('estatex_user');
      }
    }
  }, []);

  // Toast helper
  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast('');
    }, 4000);
  };

  // Load properties
  const loadProperties = useCallback(
    async (customParams = {}) => {
      setLoading(true);

      try {
        const params = {
          listingType:
            searchLookingFor === 'Buy'
              ? 'Sale'
              : searchLookingFor === 'Rent'
              ? 'Rent'
              : undefined,

          location: searchLocation || undefined,

          propertyType:
            searchPropertyType !== 'All'
              ? searchPropertyType
              : undefined,

          ...customParams,
        };

        const response = await api.getProperties(params);

        if (response && response.data) {
          setProperties(response.data);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        setProperties([]);
        showToast('Unable to load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [searchLookingFor, searchLocation, searchPropertyType]
  );

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Search
  const handleSearch = (event) => {
    event.preventDefault();
    loadProperties();
  };

  // Property filters
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === 'all') {
      loadProperties({
        listingType: undefined,
        propertyType: undefined,
      });
    } else if (tab === 'villas') {
      loadProperties({
        propertyType: 'Villa',
      });
    } else if (tab === 'apartments') {
      loadProperties({
        propertyType: 'Apartment',
      });
    } else if (tab === 'rent') {
      loadProperties({
        listingType: 'Rent',
      });
    } else if (tab === 'sale') {
      loadProperties({
        listingType: 'Sale',
      });
    }
  };

  // Property added
  const handlePropertyAdded = (newProperty) => {
    setProperties((previous) => [
      newProperty,
      ...previous,
    ]);

    showToast('Property listed successfully!');
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('estatex_token');
    localStorage.removeItem('estatex_user');

    setUser(null);

    showToast('Logged out successfully.');
  };

  return (
    <div className="app">

      {/* Toast */}
      {toast && (
        <div className="toast-notification">
          <span>{toast}</span>

          <button onClick={() => setToast('')}>
            ✕
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="navbar">

        <div
          className="logo"
          onClick={() => handleTabChange('all')}
          style={{ cursor: 'pointer' }}
        >
          Estate<span>X</span>
        </div>

        <div className="nav-links">

          <a
            href="#properties"
            onClick={() => handleTabChange('all')}
          >
            Properties
          </a>

          <a
            href="#villas"
            onClick={() => handleTabChange('villas')}
          >
            Villas
          </a>

          <a
            href="#rent"
            onClick={() => handleTabChange('rent')}
          >
            For Rent
          </a>

          <button
            className="nav-link-btn"
            onClick={() => setShowEmiModal(true)}
          >
            EMI Calculator
          </button>

        </div>

        <div className="nav-buttons">

          <button
            className="add-prop-btn"
            onClick={() => setShowAddModal(true)}
          >
            + List Property
          </button>

          {user ? (
            <div className="user-profile-menu">

              <span className="user-welcome">
                Hi, {user.name?.split(' ')[0]}
              </span>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          ) : (
            <>
              <button
                className="login-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Login
              </button>

              <button
                className="signup-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Sign Up
              </button>
            </>
          )}

        </div>
      </nav>

      {/* Hero */}
      <section className="hero">

        <div className="hero-content">

          <div className="hero-copy">

            <div className="hero-eyebrow">
              Discover Your Perfect Home
            </div>

            <h1>
              Find a home that
              <br />
              feels like <em>yours</em>
            </h1>

            <p className="hero-text">
              Explore verified properties, discover great
              neighborhoods, and connect directly with trusted
              real-estate professionals in Hyderabad.
            </p>

            <div className="hero-stats">

              <div>
                <strong>{properties.length}+</strong>
                <span>Properties</span>
              </div>

              <div>
                <strong>340+</strong>
                <span>Verified Agents</span>
              </div>

              <div>
                <strong>18</strong>
                <span>Localities</span>
              </div>

            </div>

          </div>

          <div className="hero-visual">

            <div className="hero-visual-card">

              <img
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80"
                alt="Luxury Villa"
                className="hero-card-img"
              />

              <div className="hero-card-details">

                <div>
                  <h4>Luxury Villa, Kokapet</h4>
                  <p>4 BHK · 3,200 sq.ft</p>
                </div>

                <div className="price">
                  ₹1.8 Cr
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Search */}
        <form
          className="search-box"
          onSubmit={handleSearch}
        >

          <div className="search-item">

            <label>Looking for</label>

            <select
              value={searchLookingFor}
              onChange={(event) =>
                setSearchLookingFor(event.target.value)
              }
            >
              <option value="Buy">Buy</option>
              <option value="Rent">Rent</option>
            </select>

          </div>

          <div className="search-item flex-grow">

            <label>Location</label>

            <input
              type="text"
              placeholder="Try Gachibowli, Kokapet, Kondapur..."
              value={searchLocation}
              onChange={(event) =>
                setSearchLocation(event.target.value)
              }
            />

          </div>

          <div className="search-item">

            <label>Property type</label>

            <select
              value={searchPropertyType}
              onChange={(event) =>
                setSearchPropertyType(event.target.value)
              }
            >
              <option value="All">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="House">House</option>
              <option value="Commercial">Commercial</option>
            </select>

          </div>

          <button
            type="submit"
            className="search-btn"
          >
            Search Properties
          </button>

        </form>

      </section>

      {/* Properties */}
      <section
        className="properties"
        id="properties"
      >

        <div className="section-head">

          <div>

            <h2>Verified Properties</h2>

            <p>
              Explore quality properties and find a place
              that matches your lifestyle.
            </p>

          </div>

          <div className="filter-tabs">

            <button
              className={`filter-tab ${
                activeTab === 'all' ? 'active' : ''
              }`}
              onClick={() => handleTabChange('all')}
            >
              All ({properties.length})
            </button>

            <button
              className={`filter-tab ${
                activeTab === 'villas' ? 'active' : ''
              }`}
              onClick={() => handleTabChange('villas')}
            >
              Villas
            </button>

            <button
              className={`filter-tab ${
                activeTab === 'apartments' ? 'active' : ''
              }`}
              onClick={() => handleTabChange('apartments')}
            >
              Apartments
            </button>

            <button
              className={`filter-tab ${
                activeTab === 'rent' ? 'active' : ''
              }`}
              onClick={() => handleTabChange('rent')}
            >
              For Rent
            </button>

            <button
              className={`filter-tab ${
                activeTab === 'sale' ? 'active' : ''
              }`}
              onClick={() => handleTabChange('sale')}
            >
              For Sale
            </button>

          </div>

        </div>

        {loading ? (

          <div className="loading-state">
            <div className="spinner" />
            <p>Finding properties...</p>
          </div>

        ) : properties.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🏘️
            </div>

            <h3>
              No properties found
            </h3>

            <p>
              Try changing your search criteria or
              list a new property.
            </p>

            <div className="empty-actions">

              <button
                className="btn-secondary"
                onClick={() => {
                  setSearchLocation('');
                  setSearchPropertyType('All');
                  setActiveTab('all');

                  loadProperties({
                    location: '',
                    propertyType: undefined,
                  });
                }}
              >
                Clear Filters
              </button>

              <button
                className="btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                + List a Property
              </button>

            </div>

          </div>

        ) : (

          <div className="property-grid">

            {properties.map((property) => (

              <div
                key={property._id || property.title}
                className="property-card"
                onClick={() =>
                  setSelectedProperty(property)
                }
              >

                <div className="property-image-container">

                  <img
                    src={
                      property.primaryImage ||
                      (property.images &&
                        property.images[0]) ||
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={property.title}
                    className="property-card-img"
                    loading="lazy"
                  />

                  <span className="property-tag">
                    {property.propertyType}
                  </span>

                  <span className="listing-tag">
                    {property.listingType}
                  </span>

                </div>

                <div className="property-info">

                  <div className="property-loc">
                    📍 {property.location}
                    {property.city
                      ? `, ${property.city}`
                      : ''}
                  </div>

                  <h3 className="property-card-title">
                    {property.title}
                  </h3>

                  <div className="property-meta-row">

                    <span>
                      🛏️ {property.bedrooms} BHK
                    </span>

                    <span>•</span>

                    <span>
                      📐 {property.areaSqft} sq.ft
                    </span>

                  </div>

                  <div className="property-bottom-row">

                    <h4 className="property-price">
                      {property.priceFormatted ||
                        `₹${property.price?.toLocaleString(
                          'en-IN'
                        )}`}
                    </h4>

                    <button
                      className="view-prop-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedProperty(property);
                      }}
                    >
                      View Details
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* Features */}
      <section className="features">

        <div className="section-head">

          <h2>
            Everything you need to find your home
          </h2>

          <p>
            Simple tools that make house-hunting
            easier, from your first search to your
            final decision.
          </p>

        </div>

        <div className="feature-list">

          <div className="feature-row">

            <div className="feature-icon">
              ✓
            </div>

            <div>
              <h3>Verified Property Listings</h3>

              <p>
                Explore property information with
                essential details, pricing, location,
                and specifications.
              </p>
            </div>

          </div>

          <div className="feature-row">

            <div className="feature-icon">
              360°
            </div>

            <div>
              <h3>Virtual Tours & Media</h3>

              <p>
                Explore homes through high-quality
                images and immersive virtual tours.
              </p>
            </div>

          </div>

          <div className="feature-row">

            <div className="feature-icon">
              👤
            </div>

            <div>
              <h3>Direct Agent Connection</h3>

              <p>
                Send enquiries directly to property
                agents and get the information you need.
              </p>
            </div>

          </div>

          <div
            className="feature-row clickable"
            onClick={() => setShowEmiModal(true)}
          >

            <div className="feature-icon">
              ₹
            </div>

            <div>

              <h3>
                EMI Calculator{' '}
                <span className="try-badge">
                  Try now
                </span>
              </h3>

              <p>
                Estimate your monthly payment before
                making your property decision.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Footer */}
      <footer>

        <div className="footer-top">

          <div>

            <div className="logo">
              Estate<span>X</span>
            </div>

            <p className="footer-tag">
              Find your place. Build your future.
            </p>

            <p className="footer-sub">
              Your trusted real-estate platform in Hyderabad.
            </p>

          </div>

          <div className="footer-links">

            <div className="footer-col">

              <h4>Explore</h4>

              <a
                href="#properties"
                onClick={() =>
                  handleTabChange('sale')
                }
              >
                Buy Properties
              </a>

              <a
                href="#properties"
                onClick={() =>
                  handleTabChange('rent')
                }
              >
                Rental Flats
              </a>

              <a
                href="#properties"
                onClick={() =>
                  handleTabChange('villas')
                }
              >
                Luxury Villas
              </a>

            </div>

            <div className="footer-col">

              <h4>Support</h4>

              <a href="#properties">
                Verified Listings
              </a>

              <a href="#properties">
                Contact Agents
              </a>

            </div>

          </div>

        </div>

        <div className="footer-bottom">
          © 2026 EstateX Real Estate Advisory.
          All rights reserved.
        </div>

      </footer>

      {/* Property Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEnquirySuccess={() =>
            showToast(
              'Your enquiry has been sent successfully!'
            )
          }
        />
      )}

      {/* Add Property */}
      {showAddModal && (
        <AddPropertyModal
          onClose={() =>
            setShowAddModal(false)
          }
          onPropertyAdded={handlePropertyAdded}
        />
      )}

      {/* Authentication */}
      {showAuthModal && (
        <AuthModal
          onClose={() =>
            setShowAuthModal(false)
          }
          onAuthSuccess={(userData) => {
            setUser(userData);
            showToast(
              `Welcome back, ${userData.name}!`
            );
          }}
        />
      )}

      {/* EMI */}
      {showEmiModal && (
        <EmiModal
          onClose={() =>
            setShowEmiModal(false)
          }
        />
      )}

    </div>
  );
}

export default App;