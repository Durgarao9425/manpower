const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/sliders';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'slider-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Helper function to format image URLs
const formatImageUrl = (imagePath, req) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If it's a base64 data URL, return as is
    if (imagePath.startsWith('data:image/')) {
        return imagePath;
    }
    
    // Otherwise, construct full URL
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Check if the file exists
    const fullPath = path.join(__dirname, '../../', cleanPath);
    const fileExists = fs.existsSync(fullPath);
    
    console.log(`Formatting image URL: ${baseUrl}/${cleanPath} (File exists: ${fileExists}, Full path: ${fullPath})`);
    
    if (!fileExists) {
        // Try in uploads/sliders directory
        const filename = path.basename(cleanPath);
        const alternativePath = path.join('uploads/sliders', filename);
        const alternativeFullPath = path.join(__dirname, '../../', alternativePath);
        
        if (fs.existsSync(alternativeFullPath)) {
            console.log(`Found file in alternative location: ${alternativePath}`);
            return `${baseUrl}/${alternativePath}`;
        }
    }
    
    return `${baseUrl}/${cleanPath}`;
};

// Convert base64 to file (if you want to migrate existing base64 images)
const base64ToFile = (base64String, filename) => {
    try {
        // Extract the base64 data
        const matches = base64String.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            console.error('Invalid base64 string format');
            return null;
        }
        
        const imageType = matches[1]; // png, jpg, etc.
        const imageData = matches[2];
        
        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads/sliders');
        console.log(`Creating upload directory: ${uploadDir}`);
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log(`Created directory: ${uploadDir}`);
        }
        
        // Generate filename if not provided
        if (!filename) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            filename = `slider-${uniqueSuffix}.${imageType}`;
        }
        
        const filePath = path.join(uploadDir, filename);
        console.log(`Saving file to: ${filePath}`);
        
        // Write file
        fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));
        console.log(`File saved successfully: ${filePath}`);
        
        // Return relative path for database storage
        return `uploads/sliders/${filename}`;
    } catch (error) {
        console.error('Error converting base64 to file:', error);
        return null;
    }
};


exports.getSliderImages = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                si.*,
                c.company_name 
            FROM slider_images si 
            LEFT JOIN companies c ON si.company_id = c.id 
            ORDER BY si.display_order ASC, si.created_at DESC
        `);
        
        // Format image URLs for each row
        const formattedRows = rows.map(row => {
            let imagePath = row.image_path;
            
            // If it's a base64 string, convert to file
            if (imagePath && imagePath.startsWith('data:image/')) {
                console.log(`Base64 image found for slider ${row.id}, length: ${imagePath.length}`);
                // Convert base64 to files automatically
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `slider-${row.id}-${uniqueSuffix}.png`;
                const filePath = base64ToFile(imagePath, filename);
                if (filePath) {
                    // Update database with file path
                    db.query('UPDATE slider_images SET image_path = ? WHERE id = ?', [filePath, row.id]);
                    imagePath = filePath;
                    console.log(`Converted base64 to file: ${filePath} for slider ${row.id}`);
                }
            }
            
            const formattedUrl = formatImageUrl(imagePath, req);
            console.log(`Slider ${row.id} image path: ${imagePath} -> ${formattedUrl}`);
            
            return {
                ...row,
                image_path: formattedUrl,
                // Keep original path for editing purposes
                original_image_path: row.image_path
            };
        });
        
        console.log('Fetched slider images:', formattedRows.length);
        res.status(200).json(formattedRows);
    } catch (error) {
        console.error('Error fetching slider images:', error);
        res.status(500).json({ 
            error: 'Failed to fetch slider images',
            details: error.message 
        });
    }
};

// Upload new slider image (file upload)
exports.uploadSliderImage = [
    upload.single('image'),
    async (req, res) => {
        const { title, description, status, display_order, created_by, company_id } = req.body;
        
        if (!title) {
            return res.status(400).json({ 
                error: 'Title is required' 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ 
                error: 'Image file is required' 
            });
        }
        
        try {
            const imagePath = req.file.path;
            
            const [result] = await db.query(
                `INSERT INTO slider_images 
                (title, description, image_path, status, display_order, created_by, company_id, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    title, 
                    description || '', 
                    imagePath, 
                    status || 'active', 
                    display_order || 0, 
                    created_by || 'system', 
                    company_id || null
                ]
            );
            
            console.log('Added new slider image with ID:', result.insertId);
            res.status(201).json({ 
                id: result.insertId,
                message: 'Slider image uploaded successfully',
                image_path: formatImageUrl(imagePath, req)
            });
        } catch (error) {
            // If database insert fails, delete the uploaded file
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting uploaded file:', err);
                });
            }
            
            console.error('Error uploading slider image:', error);
            res.status(500).json({ 
                error: 'Failed to upload slider image',
                details: error.message 
            });
        }
    }
];

// Add slider with base64 (existing functionality)
exports.addSliderImage = async (req, res) => {
    const { title, description, image_path, status, display_order, created_by, company_id } = req.body;
    
    // Validation
    if (!title || !image_path) {
        return res.status(400).json({ 
            error: 'Title and image are required fields' 
        });
    }
    
    try {
        let finalImagePath = image_path;
        
        // Convert base64 to file
        if (image_path.startsWith('data:image/')) {
            console.log(`Converting base64 image for new slider, length: ${image_path.length}`);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = `slider-new-${uniqueSuffix}.png`;
            const filePath = base64ToFile(image_path, filename);
            if (filePath) {
                finalImagePath = filePath;
                console.log(`Converted base64 to file: ${filePath}`);
            }
        }
        
        const [result] = await db.query(
            `INSERT INTO slider_images 
            (title, description, image_path, status, display_order, created_by, company_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                title, 
                description || '', 
                finalImagePath, 
                status || 'active', 
                display_order || 0, 
                created_by || 'system', 
                company_id || null
            ]
        );
        
        console.log('Added new slider image with ID:', result.insertId);
        res.status(201).json({ 
            id: result.insertId,
            message: 'Slider image added successfully',
            image_path: formatImageUrl(finalImagePath, req)
        });
    } catch (error) {
        console.error('Error adding slider image:', error);
        res.status(500).json({ 
            error: 'Failed to add slider image',
            details: error.message 
        });
    }
};

// Rest of the exports remain the same...
exports.getSliderImageById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT 
                si.*,
                c.company_name 
            FROM slider_images si 
            LEFT JOIN companies c ON si.company_id = c.id 
            WHERE si.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Slider image not found' });
        }
        
        const formattedRow = {
            ...rows[0],
            image_path: formatImageUrl(rows[0].image_path, req),
            original_image_path: rows[0].image_path
        };
        
        res.status(200).json(formattedRow);
    } catch (error) {
        console.error('Error fetching slider image:', error);
        res.status(500).json({ 
            error: 'Failed to fetch slider image',
            details: error.message 
        });
    }
};

// Update slider image
exports.updateSliderImage = async (req, res) => {
    const { id } = req.params;
    const { title, description, image_path, status, display_order, company_id } = req.body;
    
    try {
        // Check if slider exists
        const [existingSlider] = await db.query('SELECT * FROM slider_images WHERE id = ?', [id]);
        if (existingSlider.length === 0) {
            return res.status(404).json({ error: 'Slider image not found' });
        }
        
        let finalImagePath = image_path;
        
        // If image_path is a new base64 string (different from the existing one), convert to file
        if (image_path && image_path.startsWith('data:image/') && image_path !== existingSlider[0].image_path) {
            console.log(`Converting base64 image for slider update ${id}, length: ${image_path.length}`);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = `slider-${id}-${uniqueSuffix}.png`;
            const filePath = base64ToFile(image_path, filename);
            if (filePath) {
                finalImagePath = filePath;
                console.log(`Converted base64 to file: ${filePath}`);
            }
        }
        
        // Update slider in database
        await db.query(
            `UPDATE slider_images 
            SET title = ?, description = ?, image_path = ?, status = ?, display_order = ?, company_id = ?, updated_at = NOW()
            WHERE id = ?`,
            [
                title || existingSlider[0].title, 
                description !== undefined ? description : existingSlider[0].description, 
                finalImagePath || existingSlider[0].image_path, 
                status || existingSlider[0].status, 
                display_order !== undefined ? display_order : existingSlider[0].display_order, 
                company_id !== undefined ? company_id : existingSlider[0].company_id,
                id
            ]
        );
        
        console.log(`Updated slider image with ID: ${id}`);
        res.status(200).json({ 
            message: 'Slider image updated successfully',
            image_path: formatImageUrl(finalImagePath, req)
        });
    } catch (error) {
        console.error('Error updating slider image:', error);
        res.status(500).json({ 
            error: 'Failed to update slider image',
            details: error.message 
        });
    }
};

// Delete slider image
exports.deleteSliderImage = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if slider exists and get image path
        const [existingSlider] = await db.query('SELECT image_path FROM slider_images WHERE id = ?', [id]);
        if (existingSlider.length === 0) {
            return res.status(404).json({ error: 'Slider image not found' });
        }
        
        // Delete from database
        await db.query('DELETE FROM slider_images WHERE id = ?', [id]);
        
        // If image is a file (not base64), delete it
        const imagePath = existingSlider[0].image_path;
        if (imagePath && !imagePath.startsWith('data:image/') && !imagePath.startsWith('http')) {
            try {
                fs.unlinkSync(imagePath);
                console.log(`Deleted image file: ${imagePath}`);
            } catch (fileError) {
                console.error(`Error deleting image file: ${imagePath}`, fileError);
                // Continue even if file deletion fails
            }
        }
        
        console.log(`Deleted slider image with ID: ${id}`);
        res.status(200).json({ message: 'Slider image deleted successfully' });
    } catch (error) {
        console.error('Error deleting slider image:', error);
        res.status(500).json({ 
            error: 'Failed to delete slider image',
            details: error.message 
        });
    }
};

// Get active sliders only
exports.getActiveSliders = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                si.*,
                c.company_name 
            FROM slider_images si 
            LEFT JOIN companies c ON si.company_id = c.id 
            WHERE si.status = 'active'
            ORDER BY si.display_order ASC, si.created_at DESC
        `);
        
        // Format image URLs for each row
        const formattedRows = rows.map(row => {
            let imagePath = row.image_path;
            
            // If it's a base64 string, convert to file
            if (imagePath && imagePath.startsWith('data:image/')) {
                console.log(`Base64 image found for active slider ${row.id}, length: ${imagePath.length}`);
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `slider-${row.id}-${uniqueSuffix}.png`;
                const filePath = base64ToFile(imagePath, filename);
                if (filePath) {
                    // Update database with file path
                    db.query('UPDATE slider_images SET image_path = ? WHERE id = ?', [filePath, row.id]);
                    imagePath = filePath;
                    console.log(`Converted base64 to file: ${filePath} for slider ${row.id}`);
                }
            }
            
            const formattedUrl = formatImageUrl(imagePath, req);
            console.log(`Active slider ${row.id} image path: ${imagePath} -> ${formattedUrl}`);
            
            return {
                ...row,
                image_path: formattedUrl,
                // Keep original path for editing purposes
                original_image_path: row.image_path
            };
        });
        
        console.log('Fetched active slider images:', formattedRows.length);
        res.status(200).json(formattedRows);
    } catch (error) {
        console.error('Error fetching active slider images:', error);
        res.status(500).json({ 
            error: 'Failed to fetch active slider images',
            details: error.message 
        });
    }
};

// Toggle slider status
exports.toggleSliderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required (active, inactive, or pending)' });
    }
    
    try {
        // Check if slider exists
        const [existingSlider] = await db.query('SELECT * FROM slider_images WHERE id = ?', [id]);
        if (existingSlider.length === 0) {
            return res.status(404).json({ error: 'Slider image not found' });
        }
        
        // Update status
        await db.query(
            'UPDATE slider_images SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );
        
        console.log(`Updated slider ${id} status to ${status}`);
        res.status(200).json({ 
            message: 'Slider status updated successfully',
            status: status
        });
    } catch (error) {
        console.error('Error updating slider status:', error);
        res.status(500).json({ 
            error: 'Failed to update slider status',
            details: error.message 
        });
    }
};

module.exports = exports;