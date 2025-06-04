const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Helper to set new token in response header for sliding expiration
function setSlidingToken(req, res) {
    if (req.user) {
        const jwt = require('jsonwebtoken');
        const sanitizedUser = { ...req.user };
        delete sanitizedUser.exp; // Remove 'exp' property if it exists
        console.log('Sanitized Payload:', sanitizedUser); // Debugging
        const token = jwt.sign(sanitizedUser, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '5m' });
        res.set('x-new-token', token);
    }
}

// Add sliding token to all GET/POST/PUT/DELETE responses
router.use((req, res, next) => {
    // Save original res.json
    const originalJson = res.json;
    res.json = function (body) {
        setSlidingToken(req, res);
        return originalJson.call(this, body);
    };
    next();
});

// Get all riders or filter by user_id
router.get('/', async (req, res) => {
  const { user_id } = req.query;
  try {
    let rows;
    if (user_id) {
      // Filter by user_id if provided
      [rows] = await db.query('SELECT id, rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number FROM riders WHERE user_id = ?', [user_id]);
    } else {
      // Return all riders
      [rows] = await db.query('SELECT id, rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number FROM riders');
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const getRiderByUserId = (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      u.id as user_id, u.company_id, u.username, u.email, u.full_name, u.phone, u.address, u.profile_image, u.status as user_status,
      r.id as rider_id, r.rider_code, r.id_proof, r.emergency_contact, r.date_of_birth, r.blood_group, r.joining_date,
      r.bank_name, r.account_number, r.ifsc_code, r.account_holder_name, r.upi_id, r.id_card_path,
      r.performance_tier, r.last_certificate_date, r.created_by, r.id_card_number, r.id_card_issue_date, r.id_card_expiry_date,
      r.documents, r.status as rider_status, r.vehicle_type, r.vehicle_number
    FROM users u
    INNER JOIN riders r ON u.id = r.user_id
    WHERE u.id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    res.json(results[0]);
  });
};




// Create a new rider
router.post('/', async (req, res) => {
  const {
    rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number
  } = req.body;
  const sql = `INSERT INTO riders (rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await db.query(sql, [rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number]);
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single rider by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Get rider data with user information
    const [riderRows] = await db.query(
      `SELECT 
        r.*,
        u.email,
        u.username,
        u.full_name,
        u.phone,
        u.address,
        u.status as user_status
       FROM riders r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.id = ?`,
      [id]
    );

    if (riderRows.length === 0) {
      console.log(`No rider found with ID: ${id}`);
      return res.status(404).json({ error: 'Rider not found' });
    }

    const rider = riderRows[0];
    console.log('Found rider:', rider);

    // Get rider documents
    const [documentRows] = await db.query(
      'SELECT * FROM rider_documents WHERE rider_id = ?',
      [id]
    );
    console.log('Found documents:', documentRows);

    // Format dates to ISO string
    const formatDate = (date) => {
      if (!date) return null;
      try {
        return new Date(date).toISOString().split('T')[0];
      } catch (e) {
        console.error('Error formatting date:', date, e);
        return null;
      }
    };

    // Combine rider data with documents and format dates
    const riderData = {
      id: rider.id,
      user_id: rider.user_id,
      rider_id: rider.rider_id,
      rider_code: rider.rider_code,
      full_name: rider.full_name || rider.account_holder_name,
      email: rider.email,
      phone_number: rider.phone || rider.emergency_contact,
      emergency_contact: rider.emergency_contact,
      address: rider.address,
      date_of_birth: formatDate(rider.date_of_birth),
      blood_group: rider.blood_group,
      joining_date: formatDate(rider.joining_date),
      bank_name: rider.bank_name,
      account_number: rider.account_number,
      ifsc_code: rider.ifsc_code,
      account_holder_name: rider.account_holder_name,
      upi_id: rider.upi_id,
      id_proof: rider.id_proof,
      id_card_number: rider.id_card_number,
      id_card_issue_date: formatDate(rider.id_card_issue_date),
      id_card_expiry_date: formatDate(rider.id_card_expiry_date),
      performance_tier: rider.performance_tier,
      last_certificate_date: formatDate(rider.last_certificate_date),
      status: rider.status,
      vehicle_type: rider.vehicle_type,
      vehicle_number: rider.vehicle_number,
      documents: rider.documents,
      rider_documents: documentRows.map(doc => ({
        ...doc,
        expiry_date: formatDate(doc.expiry_date),
        verification_date: formatDate(doc.verification_date)
      }))
    };

    console.log('Sending rider data:', riderData);
    res.json(riderData);
  } catch (err) {
    console.error('Error fetching rider:', err);
    res.status(500).json({ 
      error: 'Failed to fetch rider data',
      details: err.message 
    });
  }
});

// Update a rider
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth,
    blood_group, joining_date, bank_name, account_number, ifsc_code,
    account_holder_name, upi_id, id_card_path, performance_tier,
    last_certificate_date, created_by, id_card_number, id_card_issue_date,
    id_card_expiry_date, documents, status, vehicle_type, vehicle_number,
    rider_documents
  } = req.body;

  try {
    // Start a transaction
    await db.beginTransaction();

    // Update rider data
    const [result] = await db.query(
      `UPDATE riders SET 
        rider_id=?, user_id=?, rider_code=?, id_proof=?, emergency_contact=?,
        date_of_birth=?, blood_group=?, joining_date=?, bank_name=?,
        account_number=?, ifsc_code=?, account_holder_name=?, upi_id=?,
        id_card_path=?, performance_tier=?, last_certificate_date=?,
        created_by=?, id_card_number=?, id_card_issue_date=?,
        id_card_expiry_date=?, documents=?, status=?, vehicle_type=?,
        vehicle_number=?
      WHERE id=?`,
      [
        rider_id, user_id, rider_code, id_proof, emergency_contact,
        date_of_birth, blood_group, joining_date, bank_name,
        account_number, ifsc_code, account_holder_name, upi_id,
        id_card_path, performance_tier, last_certificate_date,
        created_by, id_card_number, id_card_issue_date,
        id_card_expiry_date, documents, status, vehicle_type,
        vehicle_number, id
      ]
    );

    if (result.affectedRows === 0) {
      await db.rollback();
      return res.status(404).json({ error: 'Rider not found' });
    }

    // Update rider documents if provided
    if (rider_documents && Array.isArray(rider_documents)) {
      // First delete existing documents
      await db.query('DELETE FROM rider_documents WHERE rider_id = ?', [id]);

      // Then insert new documents
      for (const doc of rider_documents) {
        await db.query(
          `INSERT INTO rider_documents 
            (rider_id, document_type, document_number, document_file,
             expiry_date, verification_status, remarks, verified_by,
             verification_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, doc.document_type, doc.document_number, doc.document_file,
            doc.expiry_date, doc.verification_status, doc.remarks,
            doc.verified_by, doc.verification_date
          ]
        );
      }
    }

    // Commit the transaction
    await db.commit();
    res.json({ success: true });
  } catch (err) {
    // Rollback in case of error
    await db.rollback();
    console.error('Error updating rider:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a rider
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM riders WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Rider not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add the getRiderByUserId function to the router
router.get('/by-user/:userId', getRiderByUserId);

module.exports = router;
