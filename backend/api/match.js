const express = require('express');
const router = express.Router();
const { analyzeResumeAndJobDescription, extractTextFromPDF } = require('../services/azureOpenAIService');
const { downloadFileFromAzureBlob } = require('../services/azureBlobService');

router.post('/match', async (req, res) => {
    try {
        const { resumeUrl, jobDescription } = req.body;

        if (!resumeUrl || !jobDescription) {
            return res.status(400).json({ error: 'Missing resumeUrl or jobDescription' });
        }

        const resumeBuffer = await downloadFileFromAzureBlob(resumeUrl);
        const resumeText = await extractTextFromPDF(resumeBuffer);

        if (!resumeBuffer) {
            return res.status(400).json({ error: 'Failed to download resume from Azure Blob Storage' });
        }
        
        const matchResult = await analyzeResumeAndJobDescription(resumeText, jobDescription);

        res.status(200).json({ 
            analysis: matchResult.response
        });

    } catch (error) {
        console.error('Error in match route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;