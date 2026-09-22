const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadSessionToAzureBlob } = require('../services/azureBlobService');

// Simplify multer setup
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 
    }
}).fields([
    { name: 'resume', maxCount: 1 }
]);

router.post('/upload', (req, res) => {
    // Wrap multer in try-catch for better error handling
    try {
        upload(req, res, async function(err) {
            if (err) {
                console.error('Upload error:', err);
                return res.status(400).json({ error: err.message });
            }
            
            try {
                if (!req.files?.['resume']) {
                    return res.status(400).json({ error: 'Resume is required.' });
                }

                if (!req.body.jobDescription) {
                    return res.status(400).json( { error: 'Job description is required.' })
                }
                
                const resumeFile = req.files['resume'][0]
                const jobDescText = req.body.jobDescription
                
                const result = await uploadSessionToAzureBlob(resumeFile, jobDescText);
                res.json(result);
                
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