const express = require('express');
const multer = require('multer');
const path = require('path');
const { Post, Category } = require('../models');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('create', { categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading create post page');
    }
});

router.post('/create', upload.single('thumbnail'), async (req, res) => {
    try {
        const { title, content, category_id } = req.body;
        const thumbnail_url = req.file ? `/uploads/${req.file.filename}` : null;

        await Post.create({
            user_id: req.session.userId,
            title,
            content,
            category_id,
            thumbnail_url
        });

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating post');
    }
});


module.exports = router;
