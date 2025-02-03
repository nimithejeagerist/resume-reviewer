const {
  AzureKeyCredential,
  DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");

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

const analyzeResumeAndJobDescription = async (resumeBuffer, jobDescription) => {
  // TODO: Implement analyzeResumeAndJobDescription
};

module.exports = { extractTextFromPDF, analyzeResumeAndJobDescription };
