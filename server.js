require('dotenv').config();
const express  = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,          // SSL/TLS on port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/apply', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #bae0f8;border-radius:12px;overflow:hidden">
      <div style="background:#0284c7;padding:28px 32px">
        <h2 style="margin:0;color:#fff;font-size:1.3rem">New Early Access Application</h2>
        <p style="margin:6px 0 0;color:rgba(255,255,255,.75);font-size:.85rem">Submitted via easyDO.AI</p>
      </div>
      <div style="padding:32px;background:#f0f8ff">
        <table style="width:100%;border-collapse:collapse;font-size:.92rem">
          <tr>
            <td style="padding:10px 14px;font-weight:700;color:#4b6a8a;width:140px;vertical-align:top">Full Name</td>
            <td style="padding:10px 14px;color:#0c1a2e">${firstName} ${lastName}</td>
          </tr>
          <tr style="background:#e0f4fd">
            <td style="padding:10px 14px;font-weight:700;color:#4b6a8a;vertical-align:top">Email</td>
            <td style="padding:10px 14px"><a href="mailto:${email}" style="color:#0284c7">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:700;color:#4b6a8a;vertical-align:top">Message</td>
            <td style="padding:10px 14px;color:#0c1a2e;white-space:pre-wrap">${message}</td>
          </tr>
        </table>
      </div>
      <div style="padding:16px 32px;background:#fff;border-top:1px solid #bae0f8;font-size:.78rem;color:#7a9ab8;text-align:center">
        easyDO.AI · AI for Everyone · <a href="https://easydo.ai" style="color:#0284c7">easydo.ai</a>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"easyDO.AI Applications" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || 'support@easydo.ai',
      replyTo: email,
      subject: `Early Access Application – ${firstName} ${lastName}`,
      html,
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\n${message}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Mail send error:', err);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
