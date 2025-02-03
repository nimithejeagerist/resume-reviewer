const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFileToAzureBlob } = require('../services/azureBlobService');

// Simplify multer setup
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
}).single('file');

router.post('/upload', (req, res) => {
    // Wrap multer in try-catch for better error handling
    try {
        upload(req, res, async function(err) {
            if (err) {
                console.error('Upload error:', err);
                return res.status(400).json({ error: err.message });
            }
            
            try {
                if (!req.file) {
                    return res.status(400).json({ error: 'Please upload a file' });
                }
                
                const fileUrl = await uploadFileToAzureBlob(req.file.buffer, req.file.originalname);
                res.json({ fileUrl });
                
            } catch (error) {
                console.error('Azure upload error:', error);
                res.status(500).json({ error: error.message });
            }
        });
    } catch (error) {
        console.error('Multer error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/test', (req, res) => {
    res.send('Upload API is working');
});

module.exports = router;