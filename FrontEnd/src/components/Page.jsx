import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000/api';

const Page = () => {
  const [cart, setCart] = useState([]);
  const [showOrder, setShowOrder] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [menuData, setMenuData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceData, setInvoiceData] = useState({
    items: [],
    total: 0,
    date: '',
    invoiceNumber: '',
    orderId: null,
    qrUrl: null,
    paymentData: null,
    paymentStatus: 'pending'
  });
  const [paymentCheckInterval, setPaymentCheckInterval] = useState(null);

  useEffect(() => {
    console.log('Fetching menu items from:', `${API_BASE}/menu-items`);
    fetch(`${API_BASE}/menu-items`)
      .then(response => {
        console.log('API Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API Response data:', data);
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});
        console.log('Grouped menu data:', grouped);
        setMenuData(grouped);
        setSelectedCategory('all');
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching menu:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const addToCart = (item) => {
    console.log('Adding item to cart:', item);
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    console.log('Cart after adding:', cart);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    console.log('Checkout clicked, cart:', cart);
    const orderData = {
      table_number: 'Table 1',
      items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }))
    };
    console.log('Order data:', orderData);

    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })
    .then(response => {
      console.log('Checkout API response status:', response.status);
      return response.json();
    })
    .then(data => {
       console.log('Order created:', data);

       // Generate QR code using backend
       return fetch(`${API_BASE}/payments/${data.id}/qr-code`)
         .then(response => response.json())
         .then(qrResponse => {
           console.log('QR code generated:', qrResponse);

           // Update invoice data with QR and order details
           setInvoiceData({
             items: cart,
             total: data.total,
             date: new Date().toLocaleString(),
             invoiceNumber: Math.floor(Math.random() * 1000000),
             orderId: data.id,
             qrUrl: qrResponse.qr_url,
             paymentData: qrResponse.qr_data,
             paymentStatus: 'pending'
           });

           setCart([]);
           setShowInvoice(true);
           setShowOrder(false);
           console.log('States updated: showInvoice=true, showOrder=false');

           // Start checking payment status
           startPaymentStatusCheck(data.id);
         });
     })
    .catch(error => {
      console.error('Error creating order:', error);
      alert('Error creating order: ' + error.message);
    });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (feedbackMessage.trim()) {
      alert('Thank you for your feedback!');
      setFeedbackMessage('');
      setShowFeedback(false);
    }
  };

  const startPaymentStatusCheck = (orderId) => {
    // Clear any existing interval
    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
    }

    // Check payment status every 5 seconds
    const interval = setInterval(() => {
      checkPaymentStatus(orderId);
    }, 5000);

    setPaymentCheckInterval(interval);
  };

  const checkPaymentStatus = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/payments/${orderId}/status`);
      const data = await response.json();

      if (data.payment_status === 'paid') {
        // Payment completed
        setInvoiceData(prev => ({
          ...prev,
          paymentStatus: 'paid'
        }));

        // Clear the interval
        if (paymentCheckInterval) {
          clearInterval(paymentCheckInterval);
          setPaymentCheckInterval(null);
        }

        // Show success message
        alert('Payment received successfully! Your order is being prepared.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const testPaymentConfirmation = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/payments/test-confirm/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId })
      });

      const data = await response.json();

      if (data.success) {
        // Update payment status
        setInvoiceData(prev => ({
          ...prev,
          paymentStatus: 'paid'
        }));

        // Clear the interval
        if (paymentCheckInterval) {
          clearInterval(paymentCheckInterval);
          setPaymentCheckInterval(null);
        }

        alert('Test payment confirmed! Your order is being prepared.');
      } else {
        alert('Test payment failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error with test payment:', error);
      alert('Error with test payment confirmation');
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
    };
  }, [paymentCheckInterval]);


  return (
    <div className="min-vh-100" style={{background: 'var(--gradient-primary)'}}>
      {/* Professional Navbar */}
      <nav className="navbar navbar-expand-lg sticky-top">
        <div className="container-fluid">
          <div className="navbar-nav me-auto">
            <div className="d-flex align-items-center">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2 me-md-3 shadow-lg-custom"
                    style={{width: '40px', height: '40px'}}>
                <i className="bi bi-shop text-white fs-5"></i>
              </div>
              <span className="navbar-brand mb-0 h3 h2-md text-gradient">Khmer Food Palace</span>
            </div>
          </div>

         

          {/* Mobile Navigation Toggle */}
          <button className="btn btn-outline-light d-lg-none me-2" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNav">
            <i className="bi bi-list"></i>
          </button>

          <div className="navbar-nav ms-auto">
            <div className="d-flex align-items-center me-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{width: '200px'}}
              />
            </div>
            <button
              className="btn btn-outline-light me-2 d-none d-sm-inline"
              onClick={() => setShowFeedback(true)}
            >
              <i className="bi bi-chat-dots me-1 text-black"></i>
              <span className="d-none d-md-inline text-black">Feedback</span>
            </button>
            <button
              className="btn btn-outline-light position-relative"
              onClick={() => {
                console.log('Order button clicked, current showOrder:', showOrder, 'current showInvoice:', showInvoice);
                const newShowOrder = !showOrder;
                setShowOrder(newShowOrder);
                console.log('Setting showOrder to:', newShowOrder);
                console.log('Order panel should render:', newShowOrder && !showInvoice);
              }}
            >
              <i className="bi bi-cart me-1 text-black"></i>
              <span className="d-none d-sm-inline text-black">Order</span>
              {getTotalItems() > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>



      {/* Feedback Modal */}
      {showFeedback && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Feedback</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowFeedback(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleFeedbackSubmit}>
                  <div className="mb-3">
                    <label htmlFor="feedbackMessage" className="form-label">Your Feedback</label>
                    <textarea
                      className="form-control"
                      id="feedbackMessage"
                      rows="4"
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Please share your thoughts about our service..."
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowFeedback(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Submit Feedback
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Invoice Modal */}
      {showInvoice && (
        <div className="modal d-block fade-in" tabIndex="-1" role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.7)'}}>
          <div className="modal-dialog modal-xl" role="document">
            <div className="modal-content invoice-modal shadow-lg-custom">
              <div className="modal-header invoice-header border-0">
                <h5 className="modal-title w-100 text-center">
                  <i className="bi bi-receipt me-2"></i>
                  Invoice #{invoiceData.invoiceNumber}
                </h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowInvoice(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-4">
                      <div className="row">
                        <div className="col-md-6">
                          <p className="mb-1"><strong>Order ID:</strong> <span className="text-primary">#{invoiceData.orderId}</span></p>
                          <p className="mb-1"><strong>Date:</strong> {invoiceData.date}</p>
                        </div>
                        <div className="col-md-6 text-end">
                          <div className={`status-badge ${invoiceData.paymentStatus === 'paid' ? 'badge-info' : 'badge-secondary'}`}>
                            <i className={`bi ${invoiceData.paymentStatus === 'paid' ? 'bi-gear' : 'bi-clock'} me-1`}></i>
                            {invoiceData.paymentStatus === 'paid' ? 'Order Preparing' : 'Order Pending'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th className="fw-bold">Item</th>
                            <th className="fw-bold text-center">Qty</th>
                            <th className="fw-bold text-end">Price</th>
                            <th className="fw-bold text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.items.map(item => (
                            <tr key={item.id}>
                              <td className="fw-medium">{item.name}</td>
                              <td className="text-center">{item.quantity}</td>
                              <td className="text-end">${parseFloat(item.price).toFixed(2)}</td>
                              <td className="text-end fw-bold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="table-light">
                            <td colSpan="3" className="text-end fw-bold h5">Total Amount:</td>
                            <td className="text-end fw-bold h5 text-success">${parseFloat(invoiceData.total).toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="qr-container">
                      <h6 className="text-center mb-3 fw-bold">
                        <i className="bi bi-qr-code-scan me-2"></i>
                        Scan to Pay
                      </h6>
                      {invoiceData.qrUrl && (
                        <div className="text-center">
                          <img
                            src={invoiceData.qrUrl}
                            alt="Payment QR Code"
                            className="img-fluid mb-3"
                            style={{maxWidth: '180px'}}
                          />
                          <div className="text-center">
                            <p className="mb-1 fw-bold">Order: #{invoiceData.orderId}</p>
                            <p className="mb-1 fw-bold text-success">Amount: ${parseFloat(invoiceData.total).toFixed(2)}</p>
                            <small className="text-muted">Scan with mobile payment app</small>
                          </div>
                        </div>
                      )}
                      <div className="mt-3 text-center">
                        <span className={`status-badge ${invoiceData.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                          <i className={`bi ${invoiceData.paymentStatus === 'paid' ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
                          {invoiceData.paymentStatus === 'paid' ? 'Payment Received' : 'Payment Pending'}
                        </span>
                        {invoiceData.paymentStatus !== 'paid' && (
                          <div className="mt-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => testPaymentConfirmation(invoiceData.orderId)}
                            >
                              <i className="bi bi-play-circle me-1"></i>
                              Test Payment (Demo)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer justify-content-between">
                <div>
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Thank you for your business!
                  </small>
                </div>
                <div>
                  <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setShowInvoice(false)}>
                    <i className="bi bi-x-circle me-1"></i>
                    Close
                  </button>
                  <button type="button" className="btn btn-primary">
                    <i className="bi bi-printer me-1"></i>
                    Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Order Panel */}
      {(() => {
        console.log('Order panel render check - showOrder:', showOrder, 'showInvoice:', showInvoice, 'condition:', showOrder && !showInvoice);
        return showOrder && !showInvoice;
      })() && (
        <div className="modal d-block " tabIndex="-1" role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="row  justify-content-end">
            <div className="col-lg-4 col-md-5 position-absolute z-3  ">
              <div className="order-panel slide-up ">
                <div className="modal-header card-header bg-success text-white text-center py-3 ">
                  <h4 className="mb-0 fw-bold">
                    <i className="bi bi-cart-check me-2"></i>
                    Current Order
                  </h4>
                  <button type="button" className="btn-close " aria-label="Close" onClick={() => setShowOrder(false)}></button>
                </div>
                <div className="card-body p-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-cart-x text-muted" style={{fontSize: '3rem'}}></i>
                      <p className="text-muted mt-2">No items in cart</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="fw-bold text-primary">Items ({cart.length})</span>
                        </div>
                        {cart.map(item => (
                          <div key={item.id} className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                            <div className="flex-grow-1">
                              <div className="fw-bold text-dark">{item.name}</div>
                              <small className="text-muted">${parseFloat(item.price).toFixed(2)} each</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <button
                                className="btn btn-outline-secondary btn-sm rounded-circle"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={{width: '32px', height: '32px', padding: '0'}}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="fw-bold mx-2" style={{minWidth: '20px', textAlign: 'center'}}>
                                {item.quantity}
                              </span>
                              <button
                                className="btn btn-outline-secondary btn-sm rounded-circle"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{width: '32px', height: '32px', padding: '0'}}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm rounded-circle ms-2"
                                onClick={() => removeFromCart(item.id)}
                                style={{width: '32px', height: '32px', padding: '0'}}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <hr className="my-4" />
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="h5 mb-0 fw-bold text-dark">Total:</span>
                        <span className="h5 mb-0 fw-bold text-success">${getTotalPrice().toFixed(2)}</span>
                      </div>
                      <button className="btn btn-success btn-lg w-100 fw-bold" onClick={handleCheckout}>
                        <i className="bi bi-credit-card me-2"></i>
                        Checkout & Pay
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Section */}
      <section id="menu" className="menu-section  bg-light">
        <div className="container-fluid">

        {/* Loading/Error States */}
        {loading && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-info text-center">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Loading menu items...
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-danger text-center">
                <strong>Error:</strong> {error}
                <br />
                <small>Check browser console for details</small>
              </div>
            </div>
          </div>
        )}

        {/* Menu Categories Filter - Left Sidebar Layout */}
        {!loading && !error && Object.keys(menuData).length > 0 && (
          <div className="row g-0">
            {/* Left Sidebar - Categories */}
            <div className="col-lg-3 col-md-4 bg-white shadow-sm " style={{minHeight: '70vh'}}>
              <div className="p-3 border-bottom">
                <h5 className="fw-bold text-primary mb-3">
                  <i className="bi bi-list-ul me-2"></i>
                  Categories
                </h5>
              </div>
              <div className="nav flex-column nav-pills p-2" id="menuCategories" role="tablist">
                <button
                  className={`nav-link text-start mb-2 rounded-0 border-bottom ${selectedCategory === 'all' ? 'active bg-primary text-white' : 'text-dark'}`}
                  id="all-nav"
                  type="button"
                  role="tab"
                  onClick={() => setSelectedCategory('all')}
                  style={{fontSize: '1.1rem', fontWeight: 'bold', padding: '12px 16px'}}
                >
                  <i className="bi bi-grid me-2"></i>
                  All Items
                </button>
                {Object.keys(menuData).map((category) => (
                  <button
                    key={category}
                    className={`nav-link text-start mb-2 rounded-0 border-bottom ${selectedCategory === category ? 'active bg-primary text-white' : 'text-dark'}`}
                    id={`${category}-nav`}
                    type="button"
                    role="tab"
                    onClick={() => setSelectedCategory(category)}
                    style={{fontSize: '1rem', padding: '10px 16px'}}
                  >
                    <i className="bi bi-tag me-2"></i>
                    {category.split(' / ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Menu Items */}
            <div className="col-lg-9 col-md-8">
              <div className="p-4 bg-light" style={{minHeight: '70vh'}}>
                <div className="mb-4">
                  <h4 className="fw-bold text-dark">
                    {selectedCategory === 'all' ? 'All Menu Items' : selectedCategory.split(' / ')[0]}
                    <span className="badge bg-primary ms-2 fs-6">
                      {selectedCategory === 'all'
                        ? Object.values(menuData).flatMap(([, items]) => items).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length
                        : (menuData[selectedCategory] || []).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length
                      } items
                    </span>
                  </h4>
                </div>

                {/* Menu Items Grid */}
                <div className="row g-3">
                  {(selectedCategory === 'all'
                    ? Object.entries(menuData).flatMap(([, items]) => items).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    : (menuData[selectedCategory] || []).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map((item) => {
                    const cartItem = cart.find(cartItem => cartItem.id === item.id);
                    const quantity = cartItem ? cartItem.quantity : 0;

                    return (
                      <div key={item.id} className="col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-3">
                        <div className="menu-item-card p-3 h-100 bg-white rounded shadow-sm hover-shadow">
                          <div className="row g-3 align-items-center">
                            <div className="col-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="img-fluid rounded shadow-sm"
                                style={{width: '100%', height: '120px', objectFit: 'cover'}}
                              />
                            </div>
                            <div className="col-5">
                              <h6 className="card-title mb-1 fw-bold text-dark">{item.name}</h6>
                              <p className="card-text mb-0 fw-bold text-primary">${parseFloat(item.price).toFixed(2)}</p>
                            </div>
                            <div className="col-3 text-end">
                              {quantity > 0 && (
                                <div className="mb-2">
                                  <span className="badge bg-success rounded-pill px-2 py-1">{quantity}</span>
                                </div>
                              )}
                              <button
                                className="btn btn-primary btn-sm w-100"
                                onClick={() => addToCart(item)}
                              >
                                <i className="bi bi-cart-plus me-1"></i>Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Empty State */}
                {(selectedCategory === 'all'
                  ? Object.values(menuData).flat().length === 0
                  : (menuData[selectedCategory]?.length || 0) === 0
                ) && (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{fontSize: '3rem'}}></i>
                    <h5 className="text-muted mt-3">No items available</h5>
                    <p className="text-muted">Please select a different category</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-white text-dark py-5 mt-auto shadow-lg-custom">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6 mb-4 mb-md-0">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{width: '50px', height: '50px'}}>
                  <i className="bi bi-geo-alt-fill text-white fs-5"></i>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">Our Location</h5>
                  <p className="text-muted mb-0">Find us in the heart of Phnom Penh</p>
                </div>
              </div>
              <div className="glass-effect rounded p-3 text-center">
                <div className="bg-primary rounded d-flex align-items-center justify-content-center mb-2"
                      style={{height: '120px'}}>
                  <i className="bi bi-map text-white fs-1"></i>
                  
                </div>
                <h6 className="fw-bold mb-1">Khmer Food Palace</h6>
                <p className="text-muted small mb-0">123 Street Name, Phnom Penh, Cambodia</p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{width: '50px', height: '50px'}}>
                  <i className="bi bi-chat-dots-fill text-white fs-5"></i>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">Connect With Us</h5>
                  <p className="text-muted mb-0">Stay connected for updates</p>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex align-items-center p-3 bg-light rounded hover-shadow">
                    <i className="bi bi-info-circle text-primary me-3 fs-4"></i>
                    <div>
                      <div className="fw-bold">About Us</div>
                      <small className="text-muted">Authentic Khmer cuisine since 2020</small>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-center p-3 bg-light rounded hover-shadow">
                    <i className="bi bi-telephone text-success me-3 fs-4"></i>
                    <div>
                      <div className="fw-bold">+855 123 456 789</div>
                      <small className="text-muted">Call for reservations</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center p-2 bg-light rounded hover-shadow">
                    <i className="bi bi-facebook text-primary me-2"></i>
                    <span className="fw-bold small">Facebook</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center p-2 bg-light rounded hover-shadow">
                    <i className="bi bi-telegram text-info me-2"></i>
                    <span className="fw-bold small">Telegram</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          <div className="row">
            <div className="col-12 text-center">
              <div className="d-flex justify-content-center align-items-center mb-2">
                <i className="bi bi-heart-fill text-danger me-2"></i>
                <span className="fw-bold">© 2024 Khmer Food Palace. All rights reserved.</span>
                <i className="bi bi-heart-fill text-danger ms-2"></i>
              </div>
              <p className="text-muted small mb-0">Made with love for authentic Khmer cuisine</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
