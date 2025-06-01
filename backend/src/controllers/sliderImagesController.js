const db = require('../config/database');

// CRUD operations for slider_images
exports.getSliderImages = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM slider_images');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching slider images:', error);
        res.status(500).json({ error: 'Failed to fetch slider images' });
    }
};

exports.addSliderImage = async (req, res) => {
    const { title, description, image_path, status, display_order, created_by, company_id } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO slider_images (title, description, image_path, status, display_order, created_by, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [title, description, image_path, status, display_order, created_by, company_id]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error adding slider image:', error);
        res.status(500).json({ error: 'Failed to add slider image' });
    }
};

exports.updateSliderImage = async (req, res) => {
    const { id } = req.params;
    const { title, description, image_path, status, display_order } = req.body;
    try {
        await db.query(
            'UPDATE slider_images SET title = ?, description = ?, image_path = ?, status = ?, display_order = ?, updated_at = NOW() WHERE id = ?',
            [title, description, image_path, status, display_order, id]
        );
        res.status(200).json({ message: 'Slider image updated successfully' });
    } catch (error) {
        console.error('Error updating slider image:', error);
        res.status(500).json({ error: 'Failed to update slider image' });
    }
};

exports.deleteSliderImage = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM slider_images WHERE id = ?', [id]);
        res.status(200).json({ message: 'Slider image deleted successfully' });
    } catch (error) {
        console.error('Error deleting slider image:', error);
        res.status(500).json({ error: 'Failed to delete slider image' });
    }
};
