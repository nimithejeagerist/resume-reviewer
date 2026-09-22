const { BlobServiceClient } = require("@azure/storage-blob");

const uploadSessionToAzureBlob = async (resumeFile, jobDescText) => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("Azure Storage Connection String is not configured");
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient("uploads");
  await containerClient.createIfNotExists();

  // Shared folder
  const folderId = `${Date.now()}-${crypto.randomUUID()}`;

  // Upload resume
  const resumeBlobName = `${folderId}/resume-${resumeFile.originalname}`;
  const resumeBlobClient = containerClient.getBlockBlobClient(resumeBlobName);
  await resumeBlobClient.upload(resumeFile.buffer, resumeFile.buffer.length, {
    blobHTTPHeaders: { blobContentType: resumeFile.mimetype }
  });

  // Convert and upload the job description
  const jobDescBuffer = Buffer.from(jobDescText, 'utf-8');
  const jobDescBlobName = `${folderId}/jobDesc.txt`;
  const jobDescBlobClient = containerClient.getBlockBlobClient(jobDescBlobName);
  await jobDescBlobClient.upload(jobDescBuffer, jobDescBuffer.length, {
    blobHTTPHeaders: { blobContentType: 'text/plain' }
  })

  return {
    folderId,
    resumeUrl: resumeBlobClient.url,
    jobDescUrl: jobDescBlobClient.url
  }

}

const downloadFileFromAzureBlob = async (fileUrl) => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("Azure Storage Connection String is not configured");
  }

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient("uploads");

  // Extract the blob name from the URL
  const blobName = fileUrl.split("/").pop();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Download the blob content
  const downloadResponse = await blockBlobClient.download();
  const fileBuffer = await streamToBuffer(downloadResponse.readableStreamBody);

  return fileBuffer;
};  

function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

module.exports = { uploadSessionToAzureBlob, downloadFileFromAzureBlob };
