require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const fileUpload = require('express-fileupload');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Validate Environment Variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({ from: `"Sindhuja Finance HR" <${process.env.EMAIL_USER}>`, to, subject, html });
    console.log(`[EMAIL] Sent to ${to}`);
  } catch (err) {
    console.error('[EMAIL] Failed:', err.message);
  }
}

// --- AUTH & PROFILE ROUTES ---
// Admin/Desktop Login
app.post('/api/auth/login', async (req, res) => {
  const { staff_id, password } = req.body;
  const { data, error } = await supabase.from('staff').select('*').ilike('staff_id', staff_id).single();
  if (error || !data || data.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ success: true, user: data });
});

// Mobile/Staff App Login (Sync with hr att)
app.post('/api/staff/login', async (req, res) => {
    const { staff_id, password } = req.body;
    const { data: staff, error } = await supabase.from('staff').select('*').ilike('staff_id', staff_id).single();
    if (error || !staff || staff.password !== password) return res.status(401).json({ error: 'Invalid Staff ID or password' });
    res.json({ message: 'Login successful', staff });
});

app.post('/api/auth/change-password', async (req, res) => {
  const { staff_id, new_password } = req.body;
  const { error } = await supabase.from('staff').update({ password: new_password, is_password_set: true }).eq('staff_id', staff_id);
  if (error) return res.status(500).json({ error: 'Failed to update password' });
  res.json({ success: true });
});

// Mobile/Staff Password Change (Sync with hr att)
app.post('/api/staff/change-password', async (req, res) => {
    const { staff_id, newPassword } = req.body;
    const { data, error } = await supabase.from('staff').update({ password: newPassword, is_password_set: true }).eq('staff_id', staff_id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Success', staff: data });
});

app.get('/api/staff/profile/:staff_id', async (req, res) => {
    const { data } = await supabase.from('staff').select('*').eq('staff_id', req.params.staff_id).single();
    res.json(data || null);
});


// --- ATTENDANCE & TRACKING (Sync with hr att) ---
app.post('/api/attendance/check-in', async (req, res) => {
  const { staff_id, lat, lng } = req.body;
  const istDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
  const istTime = moment().tz("Asia/Kolkata").toISOString();

  const { data: existing } = await supabase.from('staff_attendance').select('*').eq('staff_id', staff_id).eq('date', istDate).single();
  if (existing) return res.status(400).json({ error: 'Already checked in today' });

  const { error } = await supabase.from('staff_attendance').insert([{
      staff_id, date: istDate, check_in: istTime, check_in_lat: lat, check_in_lng: lng, status: 'Present'
  }]);

  if (error) return res.status(500).json({ error: error.message });

  // Update staff_locations for live map tracking
  await supabase.from('staff_locations').insert([{ staff_id, latitude: lat, longitude: lng, timestamp: istTime }]);

  // Try updating staff table (fails gracefully if columns are missing)
  try {
      await supabase.from('staff').update({ 
          current_lat: lat, 
          current_lng: lng, 
          last_active: istTime 
      }).eq('staff_id', staff_id);
  } catch (e) { console.warn('Staff table update skipped'); }

  res.json({ success: true, time: istTime });
});

app.post('/api/attendance/check-out', async (req, res) => {
  const { staff_id, lat, lng } = req.body;
  const istDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
  const istTime = moment().tz("Asia/Kolkata").toISOString();

  const { error } = await supabase.from('staff_attendance').update({ 
      check_out: istTime, check_out_lat: lat, check_out_lng: lng 
  }).eq('staff_id', staff_id).eq('date', istDate);

  if (error) return res.status(500).json({ error: error.message });

  // Update staff_locations for live map tracking
  await supabase.from('staff_locations').insert([{ staff_id, latitude: lat, longitude: lng, timestamp: istTime }]);

  // Try updating staff table (fails gracefully if columns are missing)
  try {
      await supabase.from('staff').update({ 
          current_lat: lat, 
          current_lng: lng, 
          last_active: istTime 
      }).eq('staff_id', staff_id);
  } catch (e) { console.warn('Staff table update skipped'); }

  res.json({ success: true, time: istTime });
});

app.post('/api/staff/update-location', async (req, res) => {
    const { staff_id, name, latitude, longitude } = req.body;
    const timestamp = new Date().toISOString();
    const locationData = { staff_id, name, latitude, longitude, timestamp };
    io.to('hr-room').emit('live-location', locationData);
    
    await supabase.from('staff_locations').insert([{ staff_id, latitude, longitude, timestamp }]);
    
    try {
        await supabase.from('staff').update({ 
            current_lat: latitude, 
            current_lng: longitude, 
            last_active: timestamp 
        }).eq('staff_id', staff_id);
    } catch (e) { console.warn('Staff table update skipped'); }

    res.json({ success: true });
});

app.get('/api/staff/attendance/status/:staff_id', async (req, res) => {
    const istDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
    const { data } = await supabase.from('staff_attendance').select('*').eq('staff_id', req.params.staff_id).eq('date', istDate).single();
    res.json(data || null);
});

app.get('/api/staff/attendance/history/:staff_id', async (req, res) => {
    try {
        const istDate = moment().tz("Asia/Kolkata");
        const dateLimit = istDate.startOf('month').format('YYYY-MM-DD');

        const { data } = await supabase
            .from('staff_attendance')
            .select('*')
            .eq('staff_id', req.params.staff_id)
            .gte('date', dateLimit)
            .order('date', { ascending: false });
        
        // Foolproof filter
        const filteredData = (data || []).filter(item => item.date >= dateLimit);
        res.json(filteredData);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Fetch Payslips (Sync with HR Dashboard Payouts)
app.get('/api/staff/payslips/:staff_id', async (req, res) => {
    const { data, error } = await supabase
        .from('salary_payments')
        .select('*')
        .eq('staff_id', req.params.staff_id)
        .order('month_year', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

// Police Verification Upload (Sync with hr att)

app.post('/api/staff/upload-verification', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) return res.status(400).json({ error: 'No files uploaded' });
        const { staff_id } = req.body;
        const uploadFile = req.files.verificationFile;
        const fileName = `${staff_id}_verification_${Date.now()}.${uploadFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('verification').upload(fileName, uploadFile.data, { contentType: uploadFile.mimetype });
        if (uploadError) return res.status(500).json({ error: uploadError.message });
        const { data: { publicUrl } } = supabase.storage.from('verification').getPublicUrl(fileName);
        await supabase.from('staff').update({ police_verification_url: publicUrl }).eq('staff_id', staff_id);
        res.json({ success: true, url: publicUrl });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// --- HR ADMIN ROUTES ---
// Fetch All Leaves
app.get('/api/hr/leaves', async (req, res) => {
    const { data, error } = await supabase
      .from('staff_leaves')
      .select('*, staff(name)')
      .order('id', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

// Update Leave Status
app.put('/api/hr/leaves/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { error } = await supabase
      .from('staff_leaves')
      .update({ status })
      .eq('id', id);
      
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.get('/api/hr/staff', async (req, res) => {
    // Fetch all staff
    const { data: staff, error } = await supabase.from('staff').select('*');
    if (error) return res.status(500).json({ error: error.message });

    // Fetch latest locations for all staff to inject into the response
    // This handles cases where staff table doesn't have current_lat/lng columns
    const { data: locations } = await supabase
        .from('staff_locations')
        .select('*')
        .order('timestamp', { ascending: false });

    const staffWithLocation = staff.map(s => {
        const lastLoc = locations?.find(l => l.staff_id === s.staff_id);
        return {
            ...s,
            current_lat: s.current_lat || lastLoc?.latitude,
            current_lng: s.current_lng || lastLoc?.longitude,
            last_active: s.last_active || lastLoc?.timestamp
        };
    });

    res.json(staffWithLocation);
});

app.get('/api/hr/staff/route/:staff_id', async (req, res) => {
    const { staff_id } = req.params;
    const istDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
    const startTime = `${istDate}T00:00:00Z`;
    const endTime = `${istDate}T23:59:59Z`;

    const { data, error } = await supabase
        .from('staff_locations')
        .select('*')
        .eq('staff_id', staff_id)
        .gte('timestamp', startTime)
        .lte('timestamp', endTime)
        .order('timestamp', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.post('/api/hr/staff', async (req, res) => {
    const { staff_id, name, mobile, role, password, base_salary, branch } = req.body;
    const { error } = await supabase.from('staff').insert([{ staff_id, name, mobile, role, password, base_salary, branch, is_password_set: true }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// --- APPLICANT APPROVAL WITH EMAIL ---
app.get('/api/hr/applicants', async (req, res) => {
    const { data, error } = await supabase.from('applicants').select('*').eq('status', 'pending');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.put('/api/hr/applicants/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { base_salary, branch } = req.body;
    
    const { data: applicant } = await supabase.from('applicants').select('*').eq('id', id).single();
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    if (applicant.status !== 'pending') return res.status(400).json({ error: 'Applicant already processed' });

    const { data: lastStaff } = await supabase.from('staff').select('staff_id').order('staff_id', { ascending: false }).limit(1);
    let nextIdNumber = 1;
    if (lastStaff && lastStaff.length > 0) {
        const lastId = lastStaff[0].staff_id;
        const match = lastId.match(/\d+/);
        const currentNumber = match ? parseInt(match[0], 10) : 0;
        nextIdNumber = currentNumber + 1;
    }
    const staffId = `STF${String(nextIdNumber).padStart(3, '0')}`;
    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();

    const { error: insertError } = await supabase.from('staff').insert([{
        staff_id: staffId,
        name: applicant.name,
        mobile: applicant.mobile,
        role: applicant.role || 'Staff',
        password: tempPassword,
        base_salary: base_salary || 15000,
        branch: branch || 'Main',
        is_password_set: false
    }]);

    if (insertError) return res.status(500).json({ error: insertError.message });

    await supabase.from('applicants').update({ status: 'approved', staff_id: staffId }).eq('id', id);

    // Send Approval Email
    if (applicant.email) {
        console.log(`[APPROVAL] Attempting email to ${applicant.email} for ${staffId}...`);
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background: #06b6d4; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Sindhuja Finance!</h1>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 16px;">Hello <b>${applicant.name}</b>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">Congratulations! Your application has been <b>Approved</b>. You are now officially part of our team as a <b>${applicant.role || 'Staff'}</b> at the <b>${branch || 'Thiruvarur 01'}</b> branch.</p>
                    
                    <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin: 25px 0; border: 1px dashed #cbd5e1;">
                        <p style="margin: 0 0 15px 0; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">LOGIN CREDENTIALS</p>
                        <p style="margin: 0 0 10px 0; font-size: 16px;"><b>Staff ID:</b> <span style="color: #06b6d4; font-family: monospace;">${staffId}</span></p>
                        <p style="margin: 0; font-size: 16px;"><b>Password:</b> <span style="color: #06b6d4; font-family: monospace;">${tempPassword}</span></p>
                    </div>
                    
                    <p style="font-size: 15px; color: #64748b;">Please download the Staff App, log in using these credentials, and update your password immediately.</p>
                    <p style="font-size: 15px; margin-top: 30px; border-top: 1px solid #f1f5f9; pt: 20px;">Best Regards,<br><b>HR Department</b><br>Sindhuja Finance</p>
                </div>
            </div>
        `;
        await sendEmail(applicant.email, "Welcome to the Team! - Selection Letter", html);
    } else {
        console.warn(`[APPROVAL] No email found for applicant ${applicant.name}. Skipping email notification.`);
    }

    res.json({ success: true, staff_id: staffId });
});

app.put('/api/hr/applicants/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { data: applicant } = await supabase.from('applicants').select('*').eq('id', id).single();
    
    const { error } = await supabase.from('applicants').update({ status: 'rejected' }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    if (applicant && applicant.email) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #e11d48;">Application Status Update</h2>
                <p>Hello <b>${applicant.name}</b>,</p>
                <p>Thank you for your interest in joining Sindhuja Finance. After careful review, we regret to inform you that we will not be moving forward with your application at this time.</p>
                <p>We appreciate the time and effort you put into your application and wish you the best in your career pursuits.</p>
                <p>Best Regards,<br>HR Department<br>Sindhuja Finance</p>
            </div>
        `;
        await sendEmail(applicant.email, "Application Status - Sindhuja Finance", html);
    }
    
    res.json({ success: true });
});

// --- PAYROLL & ATTENDANCE DATA ---
app.get('/api/hr/attendance', async (req, res) => {
    const istDate = moment().tz("Asia/Kolkata");
    const dateLimit = istDate.startOf('month').format('YYYY-MM-DD');
    const { data, error } = await supabase.from('staff_attendance').select('*, staff(name)')
        .gte('date', dateLimit)
        .order('date', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

// Get Payroll Stats (Attendance count for the month)
app.get('/api/hr/payroll/stats/:month', async (req, res) => {
    const { month } = req.params; // Format: YYYY-MM
    const startDate = `${month}-01`;
    const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    const { data: attendance, error } = await supabase
        .from('staff_attendance')
        .select('staff_id, status')
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) return res.status(500).json({ error: error.message });

    const stats = attendance.reduce((acc, curr) => {
        if (curr.status === 'Present') acc[curr.staff_id] = (acc[curr.staff_id] || 0) + 1;
        return acc;
    }, {});
    res.json(stats);
});

// Get Disbursement History for a month
app.get('/api/hr/payroll/history/:month', async (req, res) => {
    const { month } = req.params;
    const { data, error } = await supabase
        .from('salary_payments')
        .select('*, staff(name)')
        .eq('month_year', month);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.post('/api/hr/payroll/disburse', async (req, res) => {
    const { staff_id, month_year, present_days, base_salary, deductions, net_salary } = req.body;
    const gross_salary = parseFloat(base_salary) || 0;
    
    const { error } = await supabase.from('salary_payments').upsert({ 
        staff_id, 
        month_year, 
        present_days, 
        base_salary, 
        gross_salary,
        deductions, 
        net_salary, 
        status: 'Paid' 
    });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  socket.on('join-hr', () => socket.join('hr-room'));
  socket.on('location-update', (data) => {
    io.to('hr-room').emit('live-location', data);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Master Server Ready at Port ${PORT}`);
});
