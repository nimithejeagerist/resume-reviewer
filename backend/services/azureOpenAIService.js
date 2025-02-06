const {
  AzureKeyCredential,
  DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");
const axios = require("axios");
const { parseResumeSections } = require("../utils/resumeParser"); // Importing the resume parser

const EC2_INSTANCE_URL = `http://${process.env.EC2_PUBLIC_IP}:${process.env.EC2_PORT}`;

const extractTextFromPDF = async (pdfBuffer) => {
  const key = process.env.DOCUMENT_INTELLIGENCE_KEY;
  const endpoint = process.env.DOCUMENT_INTELLIGENCE_ENDPOINT;
  const credential = new AzureKeyCredential(key);

  if (!credential || !endpoint) {
    throw new Error(
      "Azure Document Intelligence key and endpoint are not configured"
    );
  }

  const documentAnalysisClient = new DocumentAnalysisClient(
    endpoint,
    credential
  );

  const poller = await documentAnalysisClient.beginAnalyzeDocument(
    "prebuilt-document",
    pdfBuffer
  );
  const { content } = await poller.pollUntilDone();

  if (content) {
    return content;
  } else {
    return "No content found";
  }
};

const analyzeResumeAndJobDescription = async (resumeText, jobDescription) => {
  try {
    console.log('Making requests to Llama API at:', EC2_INSTANCE_URL);

    // Step 1: Get Resume Summary
    const resumeSummaryResponse = await axios.post(
      `${EC2_INSTANCE_URL}/summarize_resume`,
      {
        text: resumeText
      },
      { timeout: 60000 }
    );
    console.log('Resume Summary:', resumeSummaryResponse.data);

    // Step 2: Get Job Description Summary
    const jobSummaryResponse = await axios.post(
      `${EC2_INSTANCE_URL}/summarize_job`,
      {
        text: jobDescription
      },
      { timeout: 60000 }
    );
    console.log('Job Summary:', jobSummaryResponse.data);

    // Step 3: Get Match Analysis
    const matchAnalysisResponse = await axios.post(
      `${EC2_INSTANCE_URL}/analyze_match`,
      {
        resume_summary: JSON.stringify(resumeSummaryResponse.data),
        job_summary: JSON.stringify(jobSummaryResponse.data)
      },
      { timeout: 60000 }
    );

    console.log('Match Analysis:', matchAnalysisResponse.data);
    return matchAnalysisResponse.data;

  } catch (error) {
    console.error("Error calling Llama API:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
    throw error;
  }
};

module.exports = { extractTextFromPDF, analyzeResumeAndJobDescription };