const express = require('express');
const multer = require('multer');
const path = require('path');
const { Post, Category } = require('../models');
const sanitize = require('sanitize-html');
const { check, validationResult } = require('express-validator');

const router = express.Router();  // Ensure this line is here

// Sanitize filenames to prevent path traversal
const filenameSanitizer = (filename) => {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_'); // Replaces anything not alphanumeric or a dot with underscores
};

// Setup multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this folder exists or is accessible
    },
    filename: (req, file, cb) => {
        const sanitizedFilename = filenameSanitizer(file.originalname);
        cb(null, Date.now() + path.extname(sanitizedFilename)); // Ensure a unique filename
    }
});

// File upload handler with file type and size validation
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = /jpeg|jpg|png|gif/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedFileTypes.test(file.mimetype);

        if (extname && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    }
});

// Route to render the 'create post' page with categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('create', { categories, title: 'Create Post' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading create post page');
    }
});

// Input validation and sanitization
router.post('/create', 
    upload.single('thumbnail'),
    [
        check('title', 'Title must be between 1 and 100 characters').isLength({ min: 1, max: 100 }),
        check('content', 'Content must be between 1 and 100,000 characters').isLength({ min: 1, max: 100000 }),
        check('category_id', 'Category is required').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);

        // If validation errors exist
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { title, content, category_id } = req.body;
            const sanitizedTitle = sanitize(title); // Sanitize title to prevent XSS
            const sanitizedContent = sanitize(content); // Sanitize content to prevent XSS
            const thumbnail_url = req.file ? `/uploads/${req.file.filename}` : null;

            // Create the post in the database
            await Post.create({
                user_id: req.session.userId, // Ensure userId is in session
                title: sanitizedTitle,
                content: sanitizedContent,
                category_id,
                thumbnail_url
            });

            res.redirect('/'); // Redirect to homepage or new post page
        } catch (error) {
            console.error(error);
            res.status(500).send('Error creating post');
        }
    }
);

// Serve uploaded files securely
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = router;
