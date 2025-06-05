const db = require('./database');

async function initializeDatabase() {
  try {
    console.log('Checking database tables...');
    
    // Check if field_mappings table exists
    const [fieldMappingsTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'field_mappings'
    `, [process.env.DB_NAME]);
    
    if (fieldMappingsTables.length === 0) {
      console.log('Creating field_mappings table...');
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS field_mappings (
          id int(11) NOT NULL AUTO_INCREMENT,
          company_id int(11) NOT NULL,
          company_field_name varchar(255) NOT NULL COMMENT 'Excel column name',
          supplier_field_name varchar(255) NOT NULL COMMENT 'System field name',
          show_to_rider tinyint(1) NOT NULL DEFAULT 0,
          show_in_invoice tinyint(1) NOT NULL DEFAULT 0,
          show_to_company tinyint(1) NOT NULL DEFAULT 0,
          count_for_commission tinyint(1) NOT NULL DEFAULT 0,
          editable_by_rider tinyint(1) NOT NULL DEFAULT 0,
          editable_by_company tinyint(1) NOT NULL DEFAULT 0,
          is_required tinyint(1) NOT NULL DEFAULT 0,
          created_at timestamp NOT NULL DEFAULT current_timestamp(),
          updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (id),
          KEY company_id (company_id),
          KEY company_field_name (company_field_name),
          KEY supplier_field_name (supplier_field_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      console.log('field_mappings table created successfully');
    } else {
      console.log('field_mappings table already exists');
    }
    
    // Check if admin_permissions table exists
    const [adminPermissionsTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_permissions'
    `, [process.env.DB_NAME]);
    
    if (adminPermissionsTables.length === 0) {
      console.log('Creating admin_permissions table...');
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS admin_permissions (
          id int(11) NOT NULL AUTO_INCREMENT,
          user_id int(11) NOT NULL,
          page varchar(255) NOT NULL,
          can_view tinyint(1) NOT NULL DEFAULT 0,
          can_edit tinyint(1) NOT NULL DEFAULT 0,
          can_delete tinyint(1) NOT NULL DEFAULT 0,
          created_at timestamp NOT NULL DEFAULT current_timestamp(),
          updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (id),
          UNIQUE KEY user_id_page (user_id, page),
          KEY user_id (user_id),
          KEY page (page)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      console.log('admin_permissions table created successfully');
    } else {
      console.log('admin_permissions table already exists');
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = { initializeDatabase };