import React, { useState, useEffect } from 'react'

// API base URL from environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

function App() {
  const [products, setProducts] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    customer_type: 'Household',
    message: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [formSuccess, setFormSuccess] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingDashboard, setLoadingDashboard] = useState(true)

  // Fetch products from Flask backend
  useEffect(() => {
    fetchProducts()
    fetchDashboard()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`)
      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard`)
      const data = await response.json()
      if (data.success) {
        setDashboard(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoadingDashboard(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required'
    } else {
      const cleanedPhone = formData.phone.replace(/[+\-\s]/g, '')
      if (!/^\d{10,15}$/.test(cleanedPhone)) {
        errors.phone = 'Please enter a valid phone number'
      }
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.customer_type) {
      errors.customer_type = 'Customer type is required'
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required'
    }
    
    return errors
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setFormSuccess('')
      return
    }
    
    setFormSubmitting(true)
    setFormErrors({})
    setFormSuccess('')
    
    try {
      const response = await fetch(`${API_URL}/api/enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setFormSuccess('Thank you. Your enquiry has been submitted.')
        setFormData({
          name: '',
          phone: '',
          email: '',
          customer_type: 'Household',
          message: ''
        })
        // Refresh dashboard after new enquiry
        fetchDashboard()
      } else {
        if (data.errors) {
          const errorsObj = {}
          data.errors.forEach(error => {
            if (error.toLowerCase().includes('name')) errorsObj.name = error
            else if (error.toLowerCase().includes('phone')) errorsObj.phone = error
            else if (error.toLowerCase().includes('email')) errorsObj.email = error
            else if (error.toLowerCase().includes('customer')) errorsObj.customer_type = error
            else if (error.toLowerCase().includes('message')) errorsObj.message = error
          })
          setFormErrors(errorsObj)
        } else {
          setFormErrors({ general: data.message || 'Submission failed. Please try again.' })
        }
      }
    } catch (error) {
      setFormErrors({ general: 'Network error. Please check your connection and try again.' })
    } finally {
      setFormSubmitting(false)
    }
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">💧</span>
            <span className="logo-text">EARTHNEER</span>
          </div>
          <div className="nav-links">
            <button onClick={() => scrollToSection('products')} className="nav-link">Products</button>
            <button onClick={() => scrollToSection('process')} className="nav-link">Process</button>
            <button onClick={() => scrollToSection('facility')} className="nav-link">Facility</button>
            <button onClick={() => scrollToSection('contact')} className="nav-link">Contact</button>
            <button onClick={() => scrollToSection('dashboard')} className="nav-link nav-dashboard-btn">Dashboard</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">PROPOSED VENTURE</div>
          <h1 className="hero-title">EARTHNEER</h1>
          <p className="hero-tagline">Pure Water. Better Earth.</p>
          <p className="hero-subtitle">
            Proposed packaged drinking-water venture from Chandwa, Jharkhand.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => scrollToSection('products')}>
              Explore Products
            </button>
            <button className="btn btn-secondary" onClick={() => scrollToSection('vision')}>
              Our Vision
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="bottle-visual">
            <div className="bottle">
              <div className="bottle-cap"></div>
              <div className="bottle-neck"></div>
              <div className="bottle-body">
                <div className="bottle-label">
                  <span className="bottle-brand">EARTHNEER</span>
                  <span className="bottle-size">500 ml</span>
                </div>
                <div className="water-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="section vision-section">
        <div className="section-container">
          <h2 className="section-title">Our Vision</h2>
          <p className="section-subtitle">Clean water, responsibly delivered</p>
          <div className="vision-content">
            <p>
              EarthNeer is a proposed initiative to bring pure, safe packaged drinking water 
              to Chandwa, Jharkhand, while building a sustainable and responsible enterprise.
            </p>
            <p>
              Our vision combines modern purification technology with a commitment to 
              environmental responsibility, creating value for customers, communities, 
              and the planet.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="section products-section">
        <div className="section-container">
          <h2 className="section-title">Proposed Products</h2>
          <p className="section-subtitle">Designed for everyday hydration needs</p>
          
          {loadingProducts ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">No products available.</div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-badge">PROPOSED PRODUCT</div>
                  <div className="product-icon">
                    {product.size === '500 ml' ? '💧' : '🚰'}
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-use-cases">
                    <h4>Suitable for:</h4>
                    <ul>
                      {product.use_cases.map((useCase, index) => (
                        <li key={index}>{useCase}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="section process-section">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">PROPOSED OPERATIONAL WORKFLOW</p>
          
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">01</div>
              <h3>PURIFY</h3>
              <p>Planned water treatment and purification</p>
            </div>
            <div className="step-arrow">↓</div>
            <div className="process-step">
              <div className="step-number">02</div>
              <h3>PACKAGE</h3>
              <p>Planned automated: Filling → Capping → Labeling → Packaging</p>
            </div>
            <div className="step-arrow">↓</div>
            <div className="process-step">
              <div className="step-number">03</div>
              <h3>DELIVER</h3>
              <p>Planned distribution to: Retailers, Institutions, Offices, Events, Consumers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Facility Section */}
      <section id="facility" className="section facility-section">
        <div className="section-container">
          <h2 className="section-title">Proposed Facility</h2>
          <p className="section-subtitle">PROPOSED FACILITY CONCEPT</p>
          
          <div className="facility-stats">
            <div className="facility-stat">
              <div className="stat-value">5,000 sq. ft.</div>
              <div className="stat-label">Approximate proposed facility area</div>
            </div>
            <div className="facility-stat">
              <div className="stat-value">₹1 Crore</div>
              <div className="stat-label">Initial planned investment</div>
            </div>
          </div>
          
          <div className="facility-workflow">
            <h3>AUTOMATED WORKFLOW</h3>
            <div className="workflow-chain">
              <span>Purification</span>
              <span className="workflow-arrow">→</span>
              <span>Filling</span>
              <span className="workflow-arrow">→</span>
              <span>Capping</span>
              <span className="workflow-arrow">→</span>
              <span>Labeling</span>
              <span className="workflow-arrow">→</span>
              <span>Packaging</span>
            </div>
          </div>
          
          <div className="facility-areas">
            <h3>Potential proposed operational areas:</h3>
            <div className="areas-list">
              <span className="area-tag">Water treatment</span>
              <span className="area-tag">Purification</span>
              <span className="area-tag">Quality-control area</span>
              <span className="area-tag">Filling</span>
              <span className="area-tag">Packaging</span>
              <span className="area-tag">Storage</span>
              <span className="area-tag">Dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Market Section */}
      <section id="market" className="section market-section">
        <div className="section-container">
          <h2 className="section-title">Target Market</h2>
          <p className="section-subtitle">Serving both consumers and businesses</p>
          
          <div className="market-segments">
            <div className="market-card">
              <h3 className="market-card-title">B2C</h3>
              <div className="market-items">
                <div className="market-item">🏠 Households</div>
                <div className="market-item">🎓 Students</div>
                <div className="market-item">✈️ Travellers</div>
              </div>
            </div>
            <div className="market-card">
              <h3 className="market-card-title">B2B</h3>
              <div className="market-items">
                <div className="market-item">🏪 Retail shops</div>
                <div className="market-item">🏢 Offices</div>
                <div className="market-item">🏫 Institutions</div>
                <div className="market-item">🎉 Event organizers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section id="business" className="section business-section">
        <div className="section-container">
          <h2 className="section-title">Proposed Business Model</h2>
          <p className="section-subtitle">Revenue channels under consideration</p>
          
          <div className="business-channels">
            <div className="channel-item">
              <span className="channel-number">1</span>
              <span>Retail sales</span>
            </div>
            <div className="channel-item">
              <span className="channel-number">2</span>
              <span>Distributor/retailer network</span>
            </div>
            <div className="channel-item">
              <span className="channel-number">3</span>
              <span>Institutional supply</span>
            </div>
            <div className="channel-item">
              <span className="channel-number">4</span>
              <span>Bulk/event orders</span>
            </div>
            <div className="channel-item">
              <span className="channel-number">5</span>
              <span>Future regional distribution</span>
            </div>
          </div>
          <p className="assumption-note">Illustrative assumption — to be validated.</p>
        </div>
      </section>

      {/* Sustainability Section */}
      <section id="sustainability" className="section sustainability-section">
        <div className="section-container">
          <h2 className="section-title">Sustainability Goals</h2>
          <p className="section-subtitle">Proposed future sustainability commitments</p>
          
          <div className="sustainability-pillars">
            <div className="pillar">
              <div className="pillar-icon">💧</div>
              <h3>WATER</h3>
              <p>Responsible water management</p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">📦</div>
              <h3>PACKAGING</h3>
              <p>Explore responsible/recyclable packaging options</p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">⚡</div>
              <h3>ENERGY</h3>
              <p>Improve energy efficiency</p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">♻️</div>
              <h3>WASTE</h3>
              <p>Responsible waste management</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="section roadmap-section">
        <div className="section-container">
          <h2 className="section-title">Future Growth</h2>
          <p className="section-subtitle">PROPOSED FUTURE ROADMAP</p>
          
          <div className="roadmap">
            <div className="roadmap-phase">
              <div className="phase-badge">PHASE 1</div>
              <h3>Proposed Plant Setup</h3>
            </div>
            <div className="roadmap-arrow">↓</div>
            <div className="roadmap-phase">
              <div className="phase-badge">PHASE 2</div>
              <h3>Local Market Validation</h3>
            </div>
            <div className="roadmap-arrow">↓</div>
            <div className="roadmap-phase">
              <div className="phase-badge">PHASE 3</div>
              <h3>District Expansion</h3>
            </div>
            <div className="roadmap-arrow">↓</div>
            <div className="roadmap-phase">
              <div className="phase-badge">PHASE 4</div>
              <h3>Regional Jharkhand Growth</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Enquiry Section */}
      <section id="contact" className="section contact-section">
        <div className="section-container">
          <h2 className="section-title">Contact / Enquiry</h2>
          <p className="section-subtitle">We'd love to hear from you</p>
          
          <form onSubmit={handleSubmit} className="enquiry-form">
            {formErrors.general && (
              <div className="error-message general-error">{formErrors.general}</div>
            )}
            {formSuccess && (
              <div className="success-message">{formSuccess}</div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
              {formErrors.name && <span className="field-error">{formErrors.name}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
                {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                />
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="customer_type">Customer Type *</label>
              <select
                id="customer_type"
                name="customer_type"
                value={formData.customer_type}
                onChange={handleInputChange}
              >
                <option value="Household">Household</option>
                <option value="Retailer">Retailer</option>
                <option value="Office">Office</option>
                <option value="Institution">Institution</option>
                <option value="Event Organizer">Event Organizer</option>
                <option value="Distributor">Distributor</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.customer_type && <span className="field-error">{formErrors.customer_type}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter your message or enquiry"
                rows="4"
              />
              {formErrors.message && <span className="field-error">{formErrors.message}</span>}
            </div>
            
            <button type="submit" className="btn btn-primary submit-btn" disabled={formSubmitting}>
              {formSubmitting ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </form>
        </div>
      </section>

      {/* Dashboard Section */}
      <section id="dashboard" className="section dashboard-section">
        <div className="section-container">
          <h2 className="section-title">Prototype Dashboard</h2>
          <p className="section-subtitle">For demonstration purposes only — not real business data</p>
          
          {loadingDashboard ? (
            <div className="loading">Loading dashboard...</div>
          ) : dashboard ? (
            <div className="dashboard-content">
              <div className="dashboard-stats">
                <div className="dash-stat">
                  <div className="dash-stat-value">{dashboard.total_enquiries}</div>
                  <div className="dash-stat-label">Total Enquiries</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-value">{dashboard.total_products}</div>
                  <div className="dash-stat-label">Total Products</div>
                </div>
              </div>
              
              <div className="dashboard-details">
                <div className="customer-counts">
                  <h3>Customer Enquiry Count</h3>
                  {Object.keys(dashboard.customer_type_counts).length > 0 ? (
                    <div className="counts-list">
                      {Object.entries(dashboard.customer_type_counts).map(([type, count]) => (
                        <div key={type} className="count-item">
                          <span>{type}</span>
                          <span className="count-value">{count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No enquiries yet.</p>
                  )}
                </div>
                
                <div className="recent-enquiries">
                  <h3>Recent Enquiries</h3>
                  {dashboard.recent_enquiries.length > 0 ? (
                    <div className="enquiries-list">
                      {dashboard.recent_enquiries.map(enquiry => (
                        <div key={enquiry.id} className="enquiry-item">
                          <div className="enquiry-header">
                            <span className="enquiry-name">{enquiry.name}</span>
                            <span className="enquiry-type">{enquiry.customer_type}</span>
                          </div>
                          <div className="enquiry-date">
                            {new Date(enquiry.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No recent enquiries.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">Dashboard data unavailable.</div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <span className="logo-icon">💧</span>
            <span className="logo-text">EARTHNEER</span>
          </div>
          <p className="footer-tagline">Pure Water. Better Earth.</p>
          <p className="footer-location">Chandwa, Jharkhand, India</p>
          <p className="footer-disclaimer">
            This is a proposed venture. All information presented is for demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App