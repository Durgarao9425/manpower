const mysql = require('mysql2/promise');

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Middleware to check if a user has specific permission for a module
 * @param {string} moduleId - The module ID to check permission for
 * @param {string} permissionType - The type of permission to check (view, edit, delete)
 * @returns {Function} Express middleware function
 */
const checkPermission = (moduleId, permissionType) => {
  return async (req, res, next) => {
    // Skip permission check for admin users
    if (req.user && req.user.user_type === 'admin' && req.user.is_super_admin) {
      return next();
    }

    const userId = req.user.id;
    
    if (!userId || !moduleId || !permissionType) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    try {
      const connection = await pool.getConnection();
      
      try {
        // Convert moduleId to page name (e.g., "dashboard" -> "dashboard.php")
        const pageName = `${moduleId}.php`;
        
        // Get permission for the user and module
        const [rows] = await connection.execute(
          'SELECT can_view, can_edit, can_delete FROM admin_permissions WHERE user_id = ? AND page = ?',
          [userId, pageName]
        );

        connection.release();

        if (rows.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'Permission denied'
          });
        }

        const permission = rows[0];
        let hasPermission = false;

        switch (permissionType) {
          case 'view':
            hasPermission = permission.can_view === 1;
            break;
          case 'edit':
            hasPermission = permission.can_edit === 1;
            break;
          case 'delete':
            hasPermission = permission.can_delete === 1;
            break;
          default:
            hasPermission = false;
        }

        if (hasPermission) {
          return next();
        } else {
          return res.status(403).json({
            success: false,
            message: `Permission denied: You don't have ${permissionType} permission for this module`
          });
        }
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while checking permission',
        error: error.message
      });
    }
  };
};

module.exports = { checkPermission };