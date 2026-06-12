
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import API from "../../api";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const { isLoggedIn, user } = useContext(AuthContext);
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    password: "",
    coupon: "",
    
  });
  const [discount, setDiscount] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Wallet states
  const [walletBalance, setWalletBalance] = useState({ wallet_balance: 0, loyalty_points: 0, point_value: 1 });
  const [useWalletMoney, setUseWalletMoney] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [walletMoneyToUse, setWalletMoneyToUse] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // COD temporarily disabled
  // const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

console.log('CheckoutPage render - isLoggedIn:', isLoggedIn, 'user:', user);
  
  // Check shipping when ZIP code is entered
  const checkShippingRate = async (pincode, showToast = true) => {
    if (pincode.length !== 6) return;
    
    console.log('Checking shipping for pincode:', pincode);
    setIsCheckingShipping(true);
    setDeliveryInfo(null);
    
    try {
      // First, get the pickup pincode from the backend
      const configResponse = await API.get('/config');
      const pickupPincode = configResponse?.data?.pickup_pincode || '110001'; // Default to Delhi pincode if not set
      
      const response = await API.post('/shiprocket/check-serviceability', {
        pickup_pincode: pickupPincode,
        delivery_pincode: pincode,
        weight: 0.1, // Reduced weight for jewelry (100g)
        cod: 0 // 0 for prepaid
      });
      
      console.log('Shipping API response:', response.data);
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        if (data && data.available_courier_companies && data.available_courier_companies.length > 0) {
          // Get the first available courier (usually the cheapest)
          const courier = data.available_courier_companies[0];
          const shippingCharge = parseFloat(courier.rate);
          
          setShippingCharge(shippingCharge);
          setDeliveryInfo({
            days: courier.etd || '3-5',
            courier: courier.courier_name || 'Standard'
          });
          
          if (showToast) {
            toast.success(`Delivery available! ₹${shippingCharge} shipping charge`);
          }
        } else {
          console.warn('No courier companies available for this pincode');
          throw new Error('No shipping options available for this pincode');
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch shipping rates');
      }
    } catch (error) {
      console.error('Error checking shipping:', error);
      // Set a default shipping charge
      const defaultCharge = 50;
      setShippingCharge(defaultCharge);
      setDeliveryInfo({
        days: '3-5',
        courier: 'Standard'
      });
      
      if (showToast) {
        toast.info(`Using standard shipping rate: ₹${defaultCharge}`);
      }
    } finally {
      setIsCheckingShipping(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check shipping when ZIP code is entered (6 digits)
    if (name === 'zip' && value.length === 6) {
      checkShippingRate(value, true);
    }
  };

  // Fetch user data and check shipping if zip exists
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zip: user.zip || "",
      }));
      
      // Auto-check shipping if user has a valid zip code
      if (user.zip && user.zip.length === 6) {
        checkShippingRate(user.zip, false);
      }
    }
  }, [isLoggedIn, user]);
  
  // Fetch wallet balance
  useEffect(() => {
    if (isLoggedIn) {
      fetchWalletBalance();
    }
  }, [isLoggedIn]);
  
  const fetchWalletBalance = async () => {
    try {
      const response = await API.get('/wallet/balance');
      if (response.data.success) {
        setWalletBalance(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!formData.coupon.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setApplyingCoupon(true);
    try {
      const response = await API.post('/coupon/check', {
        code: formData.coupon,
        amount: subtotal,
        user_id: user?.id || null
      });

      if (response.data.success) {
        const { discount, code, type, value } = response.data.data;
        setDiscount(discount);
        setAppliedCoupon({ code, type, value, discount });
        toast.success(`Coupon applied! ₹${discount} off`);
      } else {
        setDiscount(0);
        setAppliedCoupon(null);
        toast.error(response.data.message || 'Invalid coupon');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      const errorMessage = error.response?.data?.message || 'Failed to apply coupon';
      toast.error(errorMessage);
      setDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setFormData(prev => ({ ...prev, coupon: '' }));
  };
  
  // Handle wallet money toggle
  const handleWalletMoneyToggle = (e) => {
    const checked = e.target.checked;
    setUseWalletMoney(checked);
    if (checked) {
      const afterCoupon = subtotal - discount;
      const maxWalletUse = Math.min(walletBalance.wallet_balance, afterCoupon);
      setWalletMoneyToUse(maxWalletUse);
    } else {
      setWalletMoneyToUse(0);
    }
  };
  
  // Handle points toggle
  const handlePointsToggle = (e) => {
    const checked = e.target.checked;
    setUsePoints(checked);
    if (checked) {
      const afterCouponAndWallet = subtotal - discount - walletMoneyToUse;
      const maxPointsValue = walletBalance.loyalty_points * walletBalance.point_value;
      const maxPointsUse = Math.min(maxPointsValue, afterCouponAndWallet);
      const pointsNeeded = Math.floor(maxPointsUse / walletBalance.point_value);
      setPointsToUse(pointsNeeded);
    } else {
      setPointsToUse(0);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.warning("Your cart is empty. Add items before placing an order.");
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.zip) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!isLoggedIn && !formData.password) {
      toast.error("Password is required for guest checkout. An account will be created for you.");
      return;
    }

    setLoading(true);

    try {
      const sessionId = localStorage.getItem("guest_session_id");

      const orderData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state || '',
        zip: formData.zip,
        items: cartItems.map(item => ({
          id: item.product_id,
          product_id: item.product_id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        subtotal,
        discount,
        shipping_charge: shippingCharge,
        total,
        coupon_code: formData.coupon || null,
        payment_method: paymentMethod,
        session_id: sessionId,
        // Wallet & Points
        use_wallet_money: useWalletMoney,
        wallet_money_used: walletMoneyToUse,
        use_loyalty_points: usePoints,
        loyalty_points_used: pointsToUse,
      };

      if (!isLoggedIn) {
        orderData.password = formData.password;
      }

      const response = await API.post("/orders", orderData);

      if (response.data.success) {
        const order = response.data.data.order;
        const newUserToken = response.data.data.token || null;

        // Store token but DON'T reload page yet - wait for payment to complete
        if (newUserToken) {
          localStorage.setItem("authToken", newUserToken);
        }

        // Proceed with Razorpay payment
        await handleRazorpayPayment(order, newUserToken);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage = error.response?.data?.message || "Failed to place order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (order, newUserToken) => {
    try {
      const razorpayResponse = await API.post("/razorpay/create-order", {
        order_id: order.id,
        amount: order.total,
      });

      if (razorpayResponse.data.success) {
        const options = {
          key: razorpayResponse.data.data.razorpay_key,
          amount: razorpayResponse.data.data.amount * 100,
          currency: razorpayResponse.data.data.currency,
          name: "Your Store Name",
          description: `Order #${order.order_number}`,
          order_id: razorpayResponse.data.data.razorpay_order_id,
          handler: async function (response) {
            try {
              const verifyResponse = await API.post("/razorpay/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResponse.data.success) {
                
                // show loading overlay while redirecting
                setLoading(true);
                
                toast.success("Payment successful! Order placed.");
                if (clearCart) await clearCart();
                
                // Reload page if new user was created, otherwise just navigate
                setTimeout(() => {
                  if (newUserToken) {
                    window.location.href = "/orders";
                  } else {
                    navigate("/orders");
                  }
                }, 2000);
              }
            } catch (error) {
              toast.error("Payment verification failed.");
              setLoading(false);
            }
          },
          prefill: {
            name: razorpayResponse.data.data.name,
            email: razorpayResponse.data.data.email,
            contact: razorpayResponse.data.data.contact,
          },
          theme: { color: "#c88a0b" },
          modal: {
            ondismiss: async function () {
              try {
                // Mark payment as failed
                await API.post("/razorpay/payment-failed", {
                  razorpay_order_id: razorpayResponse.data.data.razorpay_order_id,
                  error: { message: "Payment cancelled by user" },
                });
                
                // Delete the order since payment was cancelled
                await API.delete(`/orders/${order.id}`);
                
                // Remove auth token if new user was created
                if (newUserToken) {
                  localStorage.removeItem("authToken");
                }
                
                toast.warning("Payment cancelled. Order has been removed.");
              } catch (error) {
                console.error("Error handling payment cancellation:", error);
              }
              setLoading(false);
            },
          },
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error("Error initiating Razorpay:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const pointsDiscount = pointsToUse * walletBalance.point_value;
  const totalDiscount = discount + walletMoneyToUse + pointsDiscount;
  const total = Math.max(0, subtotal - totalDiscount + shippingCharge);

  // Update wallet money when discount changes
  useEffect(() => {
    if (useWalletMoney) {
      const afterCoupon = subtotal - discount;
      const maxWalletUse = Math.min(walletBalance.wallet_balance, afterCoupon);
      setWalletMoneyToUse(maxWalletUse);
    }
  }, [discount, subtotal, useWalletMoney, walletBalance.wallet_balance]);

  return (
    <div className="checkout-page">
      <h1 className="title">Checkout</h1>
      <div className="checkout-grid">
        <div className="form-card">
          <h2>Shipping Details Himanshu</h2>
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required disabled={isLoggedIn} />
          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          {!isLoggedIn && (
            <input type="password" name="password" placeholder="Create Password (for your account)" value={formData.password} onChange={handleChange} required />
          )}
          <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
          <input 
            type="text" 
            name="state" 
            placeholder="State" 
            value={formData.state} 
            onChange={handleChange} 
            required 
          />
          <div className="form-group">
            <label>Pincode *</label>
            <div className="zip-code-container">
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                maxLength="6"
                required
              />
              {isCheckingShipping && (
                <span className="checking-shipping">Checking...</span>
              )}
              {deliveryInfo && !isCheckingShipping && (
                <span className="delivery-info">
                  {deliveryInfo.courier} - {deliveryInfo.days} days
                </span>
              )}
            </div>
          </div>

          <h3>Apply Coupon</h3>
          <div className="coupon-container">
            {appliedCoupon ? (
              <div className="applied-coupon">
                <span>Coupon Applied: {appliedCoupon.code} (-₹{appliedCoupon.discount})</span>
                <button 
                  onClick={handleRemoveCoupon}
                  className="remove-coupon-btn"
                  type="button"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Coupon Code"
                  name="coupon"
                  value={formData.coupon}
                  onChange={handleChange}
                  className="coupon-input"
                  disabled={applyingCoupon}
                />
                <button 
                  onClick={handleApplyCoupon} 
                  className="apply-btn"
                  disabled={!formData.coupon.trim() || applyingCoupon}
                  type="button"
                >
                  {applyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </>
            )}
          </div>
          
          {/* Wallet & Points Section */}
          {isLoggedIn && (walletBalance.wallet_balance > 0 || walletBalance.loyalty_points > 0) && (
            <div className="wallet-section">
              <h3>💰 Use Wallet & Points</h3>
              
              {walletBalance.wallet_balance > 0 && (
                <label className="wallet-option">
                  <input 
                    type="checkbox" 
                    checked={useWalletMoney}
                    onChange={handleWalletMoneyToggle}
                  />
                  <span>
                    Use Wallet Money: <strong>₹{walletBalance.wallet_balance}</strong>
                    {useWalletMoney && <span className="applied-text"> (₹{walletMoneyToUse.toFixed(2)} will be used)</span>}
                  </span>
                </label>
              )}
              
              {walletBalance.loyalty_points > 0 && (
                <label className="wallet-option">
                  <input 
                    type="checkbox" 
                    checked={usePoints}
                    onChange={handlePointsToggle}
                  />
                  <span>
                    Use Loyalty Points: <strong>{walletBalance.loyalty_points} points</strong> (Worth ₹{(walletBalance.loyalty_points * walletBalance.point_value).toFixed(2)})
                    {usePoints && <span className="applied-text"> ({pointsToUse} points = ₹{pointsDiscount.toFixed(2)} will be used)</span>}
                  </span>
                </label>
              )}
            </div>
          )}

          {/* 🚫 Payment Method temporarily disabled (COD commented)
          <h3>Payment Method</h3>
          <div className="payment-methods">
            <label className="payment-option">
              <input 
                type="radio" 
                name="payment" 
                value="cod" 
                checked={paymentMethod === "cod"} 
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Cash on Delivery (COD)</span>
            </label>
            <label className="payment-option">
              <input 
                type="radio" 
                name="payment" 
                value="razorpay" 
                checked={paymentMethod === "razorpay"} 
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Pay Online (Razorpay)</span>
            </label>
          </div>
          */}

          <button className="place-order-btn" onClick={handlePlaceOrder} disabled={loading}>
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>

        <div className="summary-card">
          <h2>Order Summary</h2>
          {cartItems.length > 0 ? (
            <>
              <ul className="items-list">
                {cartItems.map((item) => (
                  <li key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="item-image" />
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      {item.selectedSize && <p className="item-size">Size: {item.selectedSize}</p>}
                      <p className="item-quantity">Qty: {item.quantity}</p>
                      <p className="item-price">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <hr />
              <div className="order-summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="order-summary-row">
                <span>Shipping</span>
                <span>
                  {isCheckingShipping ? (
                    <span className="checking-shipping">Checking...</span>
                  ) : (
                    `₹${shippingCharge.toFixed(2)}`
                  )}
                </span>
              </div>
              {discount > 0 && <div className="summary-row discount"><span>Coupon Discount:</span><span>-Rs. {discount.toFixed(2)}</span></div>}
              {walletMoneyToUse > 0 && <div className="summary-row discount"><span>Wallet Money:</span><span>-Rs. {walletMoneyToUse.toFixed(2)}</span></div>}
              {pointsToUse > 0 && <div className="summary-row discount"><span>Loyalty Points ({pointsToUse}):</span><span>-Rs. {pointsDiscount.toFixed(2)}</span></div>}
              <div className="summary-row total"><span>Total to Pay:</span><span>Rs. {total.toFixed(2)}</span></div>
            </>
          ) : (
            <p className="empty">Your cart is empty.</p>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Please wait...</p>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;

