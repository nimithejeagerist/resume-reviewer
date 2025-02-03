const axios = require('axios');

const LLAMA_API_URL = process.env.LLAMA_API_URL || 'http://your-instance-ip:8000';

async function analyzeResume(resume, jobDescription) {
    try {
        const response = await axios.post(`${LLAMA_API_URL}/analyze`, {
            resume,
            job_description: jobDescription
        });
        
        return response.data.response;
    } catch (error) {
        console.error('Error calling Llama API:', error);
        throw error;
    }
}

module.exports = {
    analyzeResume
}; 