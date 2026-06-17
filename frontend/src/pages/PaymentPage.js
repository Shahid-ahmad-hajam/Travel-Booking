// // src/pages/PaymentPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookingAPI } from "../utils/api";
import api from "../utils/api";
import toast from "react-hot-toast";
import "./PaymentPage.css";

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    bookingAPI
      .getById(bookingId)
      .then(({ data }) => setBooking(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Check your internet connection.");
        setProcessing(false);
        return;
      }

      // Create order on backend
      const { data } = await api.post("/payments/create-order", { bookingId });
      const { orderId, amount, currency, keyId } = data.data;

      // Open Razorpay payment popup
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "TravelBooking",
        description: `Booking: ${booking?.bookingReference}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyRes = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            });

            toast.success("Payment successful! 🎉");
            navigate(
              `/booking/confirmation/${verifyRes.data.data.bookingReference}`
            );
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        prefill: {
          name: booking?.contactEmail?.split("@")[0] || "Guest",
          email: booking?.contactEmail || "",
        },
        theme: {
          color: "#0A2342",
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled.");
            setProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Payment failed. Please try again."
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  const amount = booking?.pricing?.totalPrice || 0;
  const amountINR = Math.round(amount * 83);

  return (
    <div className="payment-page">
      <div className="payment-hero">
        <div className="container">
          <h2>💳 Secure Payment</h2>
          <p>Your payment is protected with 256-bit SSL encryption</p>
        </div>
      </div>

      <div className="container">
        <div className="payment-layout">
          {/* Payment Form */}
          <div className="payment-form-section">
            <h3>Pay with Razorpay</h3>
            <p style={{ color: "var(--muted)", marginBottom: 28 }}>
              Click the button below to open the secure Razorpay payment
              gateway. You can pay using UPI, Credit/Debit Card, Net Banking,
              or Wallets.
            </p>

            {/* Payment Methods Info */}
            <div className="razorpay-methods">
              {["💳 Credit / Debit Card", "📱 UPI", "🏦 Net Banking", "👛 Wallets"].map((m) => (
                <div key={m} className="razorpay-method-badge">{m}</div>
              ))}
            </div>

            {/* Test Card Info */}
            <div className="test-card-info">
              <h5>🧪 Test Mode — Use these details:</h5>
              <div className="test-card-row">
                <span>Card Number</span>
                <strong>4111 1111 1111 1111</strong>
              </div>
              <div className="test-card-row">
                <span>Expiry</span>
                <strong>Any future date (e.g. 12/26)</strong>
              </div>
              <div className="test-card-row">
                <span>CVV</span>
                <strong>Any 3 digits (e.g. 123)</strong>
              </div>
              <div className="test-card-row">
                <span>OTP</span>
                <strong>Enter any OTP shown</strong>
              </div>
            </div>

            {/* Security Badges */}
            <div className="pay-security">
              <span>🔒 SSL Encrypted</span>
              <span>🛡️ PCI DSS Compliant</span>
              <span>✅ Razorpay Secured</span>
            </div>

            <button
              className="btn btn-primary btn-lg btn-block pay-btn"
              onClick={handlePay}
              disabled={processing}
            >
              {processing
                ? "Opening Payment Gateway..."
                : `Pay ₹${amountINR.toLocaleString()} (≈ $${amount})`}
            </button>
          </div>

          {/* Order Summary */}
          <div className="payment-summary">
            <div className="payment-summary-card">
              <h4>Order Summary</h4>
              {booking && (
                <div className="order-details">
                  <div className="order-type">
                    {booking.bookingType === "hotel" ? "🏨 Hotel" : "✈️ Flight"}
                  </div>
                  {booking.bookingType === "hotel" && (
                    <>
                      <div className="order-row">
                        <span>Room</span>
                        <span>{booking.roomType}</span>
                      </div>
                      <div className="order-row">
                        <span>Check-in</span>
                        <span>
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="order-row">
                        <span>Check-out</span>
                        <span>
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="order-row">
                        <span>Duration</span>
                        <span>{booking.nights} nights</span>
                      </div>
                    </>
                  )}
                  {booking.bookingType === "flight" && (
                    <>
                      <div className="order-row">
                        <span>Class</span>
                        <span>{booking.cabinClass?.replace("_", " ")}</span>
                      </div>
                      <div className="order-row">
                        <span>Passengers</span>
                        <span>{booking.passengers?.length}</span>
                      </div>
                    </>
                  )}
                  <div className="divider" />
                  <div className="order-row">
                    <span>Base</span>
                    <span>${booking.pricing?.basePrice}</span>
                  </div>
                  <div className="order-row">
                    <span>Taxes</span>
                    <span>${booking.pricing?.taxes}</span>
                  </div>
                  <div className="order-row">
                    <span>Fees</span>
                    <span>${booking.pricing?.fees}</span>
                  </div>
                  <div className="divider" />
                  <div className="order-row total">
                    <span>Total (USD)</span>
                    <span>${booking.pricing?.totalPrice}</span>
                  </div>
                  <div className="order-row total">
                    <span>Total (INR)</span>
                    <span>₹{amountINR.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <div className="order-ref">
                Booking Ref: <strong>{booking?.bookingReference}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}














// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { paymentAPI, bookingAPI } from "../utils/api";
// import toast from "react-hot-toast";
// import "./PaymentPage.css";

// export default function PaymentPage() {
//   const { bookingId } = useParams();
//   const navigate = useNavigate();
//   const [booking, setBooking] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [payMethod, setPayMethod] = useState("card");
//   const [processing, setProcessing] = useState(false);
//   const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

//   useEffect(() => {
//     bookingAPI.getById(bookingId).then(({ data }) => setBooking(data.data)).catch(() => {}).finally(() => setLoading(false));
//   }, [bookingId]);

//   const formatCard = (val) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
//   const formatExpiry = (val) => { const v = val.replace(/\D/g, "").slice(0, 4); return v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2)}` : v; };

//   const handlePay = async () => {
//     if (payMethod === "card" && (!card.number || !card.name || !card.expiry || !card.cvv)) {
//       return toast.error("Please fill in all card details.");
//     }
//     setProcessing(true);
//     try {
//       const { data } = await paymentAPI.process({ bookingId, paymentMethod: payMethod, cardDetails: card });
//       toast.success("Payment successful! 🎉");
//       navigate(`/booking/confirmation/${data.data.bookingReference}`);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Payment failed. Please try again.");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

//   const amount = booking?.pricing?.totalPrice || 0;

//   return (
//     <div className="payment-page">
//       <div className="payment-hero">
//         <div className="container">
//           <h2>💳 Secure Payment</h2>
//           <p>Your payment is protected with 256-bit SSL encryption</p>
//         </div>
//       </div>

//       <div className="container">
//         <div className="payment-layout">
//           {/* Payment Form */}
//           <div className="payment-form-section">
//             <h3>Payment Method</h3>

//             {/* Method Tabs */}
//             <div className="pay-methods">
//               {[
//                 { id: "card", label: "💳 Credit / Debit Card" },
//                 { id: "paypal", label: "🅿️ PayPal" },
//                 { id: "bank_transfer", label: "🏦 Bank Transfer" },
//               ].map((m) => (
//                 <label key={m.id} className={`pay-method-card ${payMethod === m.id ? "active" : ""}`}>
//                   <input type="radio" name="payMethod" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} />
//                   {m.label}
//                 </label>
//               ))}
//             </div>

//             {/* Card Form */}
//             {payMethod === "card" && (
//               <div className="card-form animate-fade">
//                 {/* Visual Card */}
//                 <div className="card-visual">
//                   <div className="card-visual-chip" />
//                   <div className="card-visual-number">{card.number || "•••• •••• •••• ••••"}</div>
//                   <div className="card-visual-bottom">
//                     <div>
//                       <div className="card-visual-label">Card Holder</div>
//                       <div className="card-visual-value">{card.name || "YOUR NAME"}</div>
//                     </div>
//                     <div>
//                       <div className="card-visual-label">Expires</div>
//                       <div className="card-visual-value">{card.expiry || "MM/YY"}</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="card-inputs">
//                   <div className="form-group">
//                     <label className="form-label">Card Number</label>
//                     <input className="form-input" placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => setCard((p) => ({ ...p, number: formatCard(e.target.value) }))} maxLength={19} />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Cardholder Name</label>
//                     <input className="form-input" placeholder="Name as on card" value={card.name} onChange={(e) => setCard((p) => ({ ...p, name: e.target.value.toUpperCase() }))} />
//                   </div>
//                   <div className="card-inputs-row">
//                     <div className="form-group">
//                       <label className="form-label">Expiry Date</label>
//                       <input className="form-input" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))} maxLength={5} />
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">CVV</label>
//                       <input className="form-input" placeholder="•••" type="password" value={card.cvv} onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} maxLength={4} />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {payMethod === "paypal" && (
//               <div className="pay-alt animate-fade">
//                 <p>You will be redirected to PayPal to complete your payment securely.</p>
//                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: 40, marginTop: 12 }} />
//               </div>
//             )}

//             {payMethod === "bank_transfer" && (
//               <div className="pay-alt animate-fade">
//                 <p>Transfer the amount to the following bank account. Your booking will be confirmed upon receipt.</p>
//                 <div className="bank-details">
//                   <div className="bank-row"><span>Bank</span><strong>HDFC Bank</strong></div>
//                   <div className="bank-row"><span>Account</span><strong>1234 5678 9012</strong></div>
//                   <div className="bank-row"><span>IFSC</span><strong>HDFC0001234</strong></div>
//                   <div className="bank-row"><span>Reference</span><strong>{booking?.bookingReference}</strong></div>
//                 </div>
//               </div>
//             )}

//             {/* Security Badges */}
//             <div className="pay-security">
//               <span>🔒 SSL Encrypted</span>
//               <span>🛡️ PCI DSS Compliant</span>
//               <span>✅ 3D Secure</span>
//             </div>

//             <button className="btn btn-primary btn-lg btn-block pay-btn" onClick={handlePay} disabled={processing}>
//               {processing ? (
//                 <span className="pay-loading">Processing<span className="dots">...</span></span>
//               ) : (
//                 `Pay $${amount.toLocaleString()}`
//               )}
//             </button>
//           </div>

//           {/* Order Summary */}
//           <div className="payment-summary">
//             <div className="payment-summary-card">
//               <h4>Order Summary</h4>
//               {booking && (
//                 <div className="order-details">
//                   <div className="order-type">{booking.bookingType === "hotel" ? "🏨 Hotel" : "✈️ Flight"}</div>
//                   {booking.bookingType === "hotel" && (
//                     <>
//                       <div className="order-row"><span>Room</span><span>{booking.roomType}</span></div>
//                       <div className="order-row"><span>Check-in</span><span>{new Date(booking.checkInDate).toLocaleDateString()}</span></div>
//                       <div className="order-row"><span>Check-out</span><span>{new Date(booking.checkOutDate).toLocaleDateString()}</span></div>
//                       <div className="order-row"><span>Duration</span><span>{booking.nights} nights</span></div>
//                     </>
//                   )}
//                   {booking.bookingType === "flight" && (
//                     <>
//                       <div className="order-row"><span>Class</span><span>{booking.cabinClass?.replace("_", " ")}</span></div>
//                       <div className="order-row"><span>Passengers</span><span>{booking.passengers?.length}</span></div>
//                     </>
//                   )}
//                   <div className="divider" />
//                   <div className="order-row"><span>Base</span><span>${booking.pricing?.basePrice}</span></div>
//                   <div className="order-row"><span>Taxes</span><span>${booking.pricing?.taxes}</span></div>
//                   <div className="order-row"><span>Fees</span><span>${booking.pricing?.fees}</span></div>
//                   <div className="divider" />
//                   <div className="order-row total"><span>Total</span><span>${booking.pricing?.totalPrice}</span></div>
//                 </div>
//               )}
//               <div className="order-ref">Booking Ref: <strong>{booking?.bookingReference}</strong></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }