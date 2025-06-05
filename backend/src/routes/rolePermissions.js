const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, adminOnly } = require('../middleware/auth');

/**
 * @route GET /api/role-permissions/modules
 * @desc Get all available modules for permissions
 * @access Private (Admin only)
 */
router.get('/modules', auth, adminOnly, async (req, res) => {
  try {
    // This endpoint returns the list of available modules for permissions
    // We're using the predefined modules from the frontend for consistency
    const modules = [
      { id: "dashboard", name: "Dashboard", path: "/dashboard" },
      { id: "user", name: "User Management", path: "/user-page" },
      { id: "riders", name: "Riders", path: "/riders" },
      { id: "companies", name: "Companies", path: "/companies" },
      { id: "stores", name: "Stores", path: "/stores" },
      { id: "attendance", name: "Rider Attendance", path: "/rider-attendance" },
      { id: "orders", name: "Orders", path: "/orders" },
      { id: "payments", name: "Payments", path: "/payments" },
      { id: "earnings", name: "Earnings", path: "/earnings" },
      { id: "advance", name: "Advance", path: "/advance" },
      { id: "settlement", name: "Settlement", path: "/settlement" },
      { id: "invoice", name: "Invoice", path: "/invoice" },
      { id: "settings", name: "Settings", path: "/settings" },
    ];

    res.status(200).json({
      success: true,
      modules
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching modules',
      error: error.message
    });
  }
});

/**
 * @route GET /api/role-permissions/:userId
 * @desc Get permissions for a specific user
 * @access Private (Admin only)
 */
router.get('/:userId', auth, adminOnly, async (req, res) => {
  const { userId } = req.params;

  try {
    // First check if the user exists and is an admin
    const [userRows] = await db.query(
      'SELECT id, user_type FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get permissions for the user
    const [permissionRows] = await db.query(
      'SELECT page, can_view, can_edit, can_delete FROM admin_permissions WHERE user_id = ?',
      [userId]
    );

    // Format the permissions to match the frontend structure
    const permissions = {};
    
    permissionRows.forEach(row => {
      // Extract the module ID from the page name (e.g., "dashboard.php" -> "dashboard")
      const moduleId = row.page.split('.')[0];
      
      permissions[moduleId] = {
        view: row.can_view === 1,
        edit: row.can_edit === 1,
        delete: row.can_delete === 1
      };
    });

    res.status(200).json({
      success: true,
      permissions
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user permissions',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/role-permissions/:userId
 * @desc Update permissions for a specific user
 * @access Private (Admin only)
 */
router.put('/:userId', auth, adminOnly, async (req, res) => {
  const { userId } = req.params;
  const { permissions } = req.body;

  if (!permissions || typeof permissions !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Invalid permissions data'
    });
  }

  try {
    // Start transaction
    await db.query('START TRANSACTION');

    // First check if the user exists and is an admin
    const [userRows] = await db.query(
      'SELECT id, user_type FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete existing permissions for this user
    await db.query(
      'DELETE FROM admin_permissions WHERE user_id = ?',
      [userId]
    );

    // Insert new permissions
    for (const [moduleId, permission] of Object.entries(permissions)) {
      // Convert moduleId to page name (e.g., "dashboard" -> "dashboard.php")
      const pageName = `${moduleId}.php`;
      
      await db.query(
        'INSERT INTO admin_permissions (user_id, page, can_view, can_edit, can_delete) VALUES (?, ?, ?, ?, ?)',
        [
          userId,
          pageName,
          permission.view ? 1 : 0,
          permission.edit ? 1 : 0,
          permission.delete ? 1 : 0
        ]
      );
    }

    // Commit transaction
    await db.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Permissions updated successfully'
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Error updating user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user permissions',
      error: error.message
    });
  }
});

/**
 * @route GET /api/role-permissions/check/:userId/:moduleId
 * @desc Check if a user has specific permissions for a module
 * @access Private
 */
router.get('/check/:userId/:moduleId', auth, async (req, res) => {
  const { userId, moduleId } = req.params;

  try {
    // Convert moduleId to page name (e.g., "dashboard" -> "dashboard.php")
    const pageName = `${moduleId}.php`;

    // Get permissions for the user and module
    const [permissionRows] = await db.query(
      'SELECT can_view, can_edit, can_delete FROM admin_permissions WHERE user_id = ? AND page = ?',
      [userId, pageName]
    );

    if (permissionRows.length === 0) {
      return res.status(200).json({
        success: true,
        hasPermission: false,
        permissions: {
          view: false,
          edit: false,
          delete: false
        }
      });
    }

    const permission = permissionRows[0];
    
    res.status(200).json({
      success: true,
      hasPermission: true,
      permissions: {
        view: permission.can_view === 1,
        edit: permission.can_edit === 1,
        delete: permission.can_delete === 1
      }
    });
  } catch (error) {
    console.error('Error checking user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking user permissions',
      error: error.message
    });
  }
});

module.exports = router;