import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import API from '../../api';
import { AuthContext } from '../../context/AuthContext';
import './WalletModal.css';

const WalletModal = ({ isOpen, onClose }) => {
  const { isLoggedIn, token } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('balance'); // balance, topup-points, topup-money, transactions
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
      fetchTransactions();
      fetchPackages();
    }
  }, [isOpen]);

  const fetchBalance = async () => {
    try {
      const response = await API.get('/wallet/balance');
      if (response.data.success) {
        setBalance(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await API.get('/wallet/transactions');
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await API.get('/wallet/topup-packages');
      if (response.data.success) {
        setPackages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleMoneyTopUp = async () => {
    if (!customAmount || customAmount < 1) {
      toast.error('Please enter a valid amount (minimum ₹1)');
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay order for money top-up
      const orderResponse = await API.post(
        '/wallet/create-money-topup-order',
        { amount: parseFloat(customAmount) }
      );

      if (orderResponse.data.success) {
        const orderData = orderResponse.data.data;

        // Initialize Razorpay
        const options = {
          key: orderData.razorpay_key,
          amount: orderData.amount * 100,
          currency: orderData.currency,
          name: 'Wallet Money Top-Up',
          description: `Add ₹${customAmount} to Wallet`,
          order_id: orderData.razorpay_order_id,
          handler: async function (response) {
            // Verify payment
            try {
              const verifyResponse = await API.post(
                '/wallet/verify-money-topup-payment',
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: parseFloat(customAmount)
                }
              );

              if (verifyResponse.data.success) {
                toast.success(verifyResponse.data.message);
                setCustomAmount('');
                fetchBalance();
                fetchTransactions();
                setActiveTab('balance');
              }
            } catch (error) {
              alert('Payment verification failed!');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: orderData.name,
            email: orderData.email,
            contact: orderData.contact
          },
          theme: { color: '#3399cc' },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleTopUp = async (pkg) => {
    setLoading(true);
    try {
      // Create Razorpay order
      const orderResponse = await API.post(
        '/wallet/create-topup-order',
        {
          amount: pkg.min_amount,
          points: pkg.points
        }
      );

      if (orderResponse.data.success) {
        const orderData = orderResponse.data.data;

        // Initialize Razorpay
        const options = {
          key: orderData.razorpay_key,
          amount: orderData.amount * 100,
          currency: orderData.currency,
          name: 'Wallet Top-Up',
          description: `Add ${pkg.points} Loyalty Points`,
          order_id: orderData.razorpay_order_id,
          handler: async function (response) {
            // Verify payment
            try {
              const verifyResponse = await API.post(
                '/wallet/verify-topup-payment',
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  points: pkg.points,
                  amount: pkg.min_amount
                }
              );

              if (verifyResponse.data.success) {
                alert(verifyResponse.data.message);
                fetchBalance();
                fetchTransactions();
                setActiveTab('balance');
              }
            } catch (error) {
              alert('Payment verification failed!');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: orderData.name,
            email: orderData.email,
            contact: orderData.contact
          },
          theme: {
            color: '#3399cc'
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      toast.error(error.message || 'Error creating order');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
        <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wallet-modal-header">
          <h2>💰 My Wallet</h2>
          <button className="wallet-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="wallet-tabs">
          <button 
            className={activeTab === 'balance' ? 'active' : ''} 
            onClick={() => setActiveTab('balance')}
          >
            Balance
          </button>
          {/* <button 
            className={activeTab === 'topup-points' ? 'active' : ''} 
            onClick={() => setActiveTab('topup-points')}
          >
            Buy Points
          </button> */}
          <button 
            className={activeTab === 'topup-money' ? 'active' : ''} 
            onClick={() => setActiveTab('topup-money')}
          >
            Add Money
          </button>
          <button 
            className={activeTab === 'transactions' ? 'active' : ''} 
            onClick={() => setActiveTab('transactions')}
          >
            History
          </button>
        </div>

        <div className="wallet-modal-body">
          {/* Balance Tab */}
          {activeTab === 'balance' && (
            <div className="wallet-balance-tab">
              <div className="balance-card">
                <div className="balance-icon">🎁</div>
                <div className="balance-info">
                  <p className="balance-label">Loyalty Points</p>
                  <h1 className="balance-amount">{balance.loyalty_points || 0}</h1>
                  <p className="balance-value">Worth ₹{balance.rupee_value || 0}</p>
                </div>
              </div>
              
              <div className="balance-card wallet-money-card">
                <div className="balance-icon">💰</div>
                <div className="balance-info">
                  <p className="balance-label">Wallet Money</p>
                  <h1 className="balance-amount">₹{balance.wallet_balance || 0}</h1>
                  <p className="balance-value">Available Balance</p>
                </div>
              </div>
              <div className="balance-note">
                <p>💡 <strong>How to use points:</strong></p>
                <ul>
                  <li>Apply points at checkout for instant discount</li>
                  <li>1 point = ₹{balance.point_value || 1}</li>
                  <li>Earn points on every order!</li>
                </ul>
              </div>
            </div>
          )}

          {/* Buy Points Tab */}
          {activeTab === 'topup-points' && (
            <div className="wallet-tab-content">
              <h3>Choose a Top-Up Package</h3>
              <div className="topup-packages-container">
                <div className="topup-packages">
                  {packages.length === 0 ? (
                    <p className="no-packages">No packages available</p>
                  ) : (
                    packages.map((pkg) => (
                      <div key={pkg.id} className="topup-package-card">
                        <div className="package-header">
                          <h4>{pkg.points} Points</h4>
                          {pkg.is_best_value && <span className="package-badge">Best Value</span>}
                        </div>
                        <div className="package-price">
                          <span className="price">₹{pkg.min_amount}</span>
                          {pkg.max_amount && (
                            <span className="price-range"> - ₹{pkg.max_amount}</span>
                          )}
                        </div>
                        <div className="package-details">
                          <p>Value: ₹{pkg.points * pkg.coin_value}</p>
                          <p className="package-desc">Get {pkg.points} loyalty points instantly</p>
                        </div>
                        <button 
                          className="topup-btn"
                          onClick={() => handleTopUp(pkg)}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Add to Wallet'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Money Tab */}
          {activeTab === 'topup-money' && (
            <div className="wallet-topup-tab">
              <h3>Add Money to Wallet</h3>
              <div className="money-topup-section">
                <div className="custom-amount-input">
                  <label htmlFor="customAmount">Enter Amount (₹)</label>
                  <input
                    type="number"
                    id="customAmount"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="1"
                    className="amount-input"
                  />
                </div>
                <button
                  className="topup-btn money-topup-btn"
                  onClick={handleMoneyTopUp}
                  disabled={loading || !customAmount}
                >
                  {loading ? 'Processing...' : `Add ₹${customAmount || '0'} to Wallet`}
                </button>
                <div className="money-topup-info">
                  <p>💡 <strong>Quick Tips:</strong></p>
                  <ul>
                    <li>Minimum amount: ₹1</li>
                    <li>Money will be added instantly after payment</li>
                    <li>Use wallet money for faster checkout</li>
                    <li>Secure payment via Razorpay</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="wallet-transactions-tab">
              <h3>Transaction History</h3>
              <div className="transactions-list">
                {transactions.length === 0 ? (
                  <p className="no-transactions">No transactions yet</p>
                ) : (
                  transactions.map((txn) => (
                    <div key={txn.id} className="transaction-item">
                      <div className="txn-icon">
                        {txn.type === 'credit' ? '⬆️' : '⬇️'}
                      </div>
                      <div className="txn-details">
                        <p className="txn-desc">{txn.description}</p>
                        <p className="txn-date">
                          {new Date(txn.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="txn-amounts">
                        {/* Extract amount from description if available */}
                        {txn.description && txn.description.includes('₹') && (
                          <div className="wallet-amount">
                            {txn.type === 'credit' ? '+' : '-'}{txn.description.match(/₹[\d,]+/)[0]}
                          </div>
                        )}
                        {txn.amount > 0 && (
                          <div className="wallet-amount">
                            {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                          </div>
                        )}
                        {txn.points > 0 && (
                          <div className="points-amount">
                            +{txn.points} pts
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
