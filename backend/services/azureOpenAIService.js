const {
  AzureKeyCredential,
  DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");
const axios = require("axios");
const { cleanResume, cleanJobDescription } = require("../utils/cleaners");

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
    const cleanedResume = cleanResume(resumeText);
    const cleanedJobDescription = cleanJobDescription(jobDescription);
    console.log(EC2_INSTANCE_URL);

    console.log("Cleaned Resume:", cleanedResume);
    console.log("Cleaned Job Description:", cleanedJobDescription);

    const matchAnalysisResponse = await axios.post(
      `${EC2_INSTANCE_URL}/analyze_match`,
      {
        resume: cleanedResume,
        job_description: cleanedJobDescription,
      },
      { timeout: 120000 }
    );
    console.log("Match Analysis:", matchAnalysisResponse.data);

    return matchAnalysisResponse.data;
  } catch (error) {
    console.error("Error calling Model API:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });
    throw error;
  }
};

module.exports = { extractTextFromPDF, analyzeResumeAndJobDescription };
