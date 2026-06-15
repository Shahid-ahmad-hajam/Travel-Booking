// const nodemailer = require("nodemailer");

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: `Travel Booking <${process.env.EMAIL_USER}>`,
//     to: options.email,
//     subject: options.subject,
//     html: options.message,
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmation = async (booking, userEmail, userName) => {
  try {
    const isHotel = booking.bookingType === "hotel";

    const mailOptions = {
      from: `"TravelBooking" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Booking Confirmed — ${booking.bookingReference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f8f6f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #0A2342; padding: 32px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .header p { color: #E8A020; margin: 8px 0 0; }
            .body { padding: 32px; }
            .success-badge {
              background: #d4edda; color: #155724;
              padding: 12px 20px; border-radius: 8px;
              text-align: center; font-weight: bold;
              font-size: 16px; margin-bottom: 24px;
            }
            .ref-box {
              background: #fff3cd; border: 2px dashed #E8A020;
              border-radius: 8px; padding: 20px;
              text-align: center; margin-bottom: 24px;
            }
            .ref-box p { margin: 0 0 8px; color: #666; font-size: 13px; }
            .ref-box h2 { margin: 0; color: #0A2342; font-size: 28px;
              font-family: monospace; letter-spacing: 3px; }
            .details { background: #f8f6f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
            .details h4 { margin: 0 0 16px; color: #0A2342; }
            .detail-row { display: flex; justify-content: space-between;
              padding: 8px 0; border-bottom: 1px solid #e8e6e0;
              font-size: 14px; }
            .detail-row:last-child { border-bottom: none; }
            .detail-row span { color: #666; }
            .detail-row strong { color: #333; }
            .total-row { background: #0A2342; color: white;
              padding: 12px 20px; border-radius: 8px;
              display: flex; justify-content: space-between;
              font-size: 16px; font-weight: bold; margin-bottom: 24px; }
            .footer { background: #0A2342; padding: 24px; text-align: center; }
            .footer p { color: rgba(255,255,255,0.6); margin: 4px 0; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈ TravelBooking</h1>
              <p>Your booking is confirmed!</p>
            </div>

            <div class="body">
              <p style="font-size:16px;">Hi <strong>${userName}</strong>,</p>
              <p style="color:#666;">
                Great news! Your ${isHotel ? "hotel" : "flight"} booking 
                has been confirmed and payment received successfully.
              </p>

              <div class="success-badge">
                ✅ Payment Successful — Booking Confirmed
              </div>

              <div class="ref-box">
                <p>Your Booking Reference</p>
                <h2>${booking.bookingReference}</h2>
                <p style="margin-top:8px;font-size:12px;">
                  Keep this reference for check-in and support queries
                </p>
              </div>

              <div class="details">
                <h4>${isHotel ? "🏨 Hotel Details" : "✈️ Flight Details"}</h4>
                ${isHotel ? `
                  <div class="detail-row">
                    <span>Room Type</span>
                    <strong>${booking.roomType || "Standard Room"}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Check-in</span>
                    <strong>${booking.checkInDate ? new Date(booking.checkInDate).toDateString() : "—"}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Check-out</span>
                    <strong>${booking.checkOutDate ? new Date(booking.checkOutDate).toDateString() : "—"}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Duration</span>
                    <strong>${booking.nights || "—"} nights</strong>
                  </div>
                ` : `
                  <div class="detail-row">
                    <span>Cabin Class</span>
                    <strong>${booking.cabinClass?.replace("_", " ").toUpperCase() || "Economy"}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Passengers</span>
                    <strong>${booking.passengers?.length || 1}</strong>
                  </div>
                `}
                <div class="detail-row">
                  <span>Booking Type</span>
                  <strong>${isHotel ? "Hotel Stay" : "Flight"}</strong>
                </div>
                <div class="detail-row">
                  <span>Status</span>
                  <strong style="color:#155724;">✅ Confirmed</strong>
                </div>
              </div>

              <div class="detail-row" style="padding:8px 0;">
                <span>Base Price</span>
                <strong>$${booking.pricing?.basePrice}</strong>
              </div>
              <div class="detail-row" style="padding:8px 0;">
                <span>Taxes</span>
                <strong>$${booking.pricing?.taxes}</strong>
              </div>
              <div class="detail-row" style="padding:8px 0;margin-bottom:12px;">
                <span>Service Fee</span>
                <strong>$${booking.pricing?.fees}</strong>
              </div>

              <div class="total-row">
                <span>Total Paid</span>
                <span>$${booking.pricing?.totalPrice}</span>
              </div>

              <p style="color:#666;font-size:13px;line-height:1.6;">
                If you have any questions about your booking, please contact 
                our support team with your booking reference number.
              </p>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} TravelBooking. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Confirmation email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    return false;
  }
};

module.exports = { sendBookingConfirmation };