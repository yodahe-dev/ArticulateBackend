const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
    res.send("This is From Profile");
});

module.exports = router;
