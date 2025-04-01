const express = require('express');
const router = express.Router();

router.get('/create', (req, res) => {
    res.send("This is create post");
});

module.exports = router;
