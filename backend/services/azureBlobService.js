const { BlobServiceClient } = require("@azure/storage-blob");

const uploadFileToAzureBlob = async (fileBuffer, fileName) => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("Azure Storage Connection String is not configured");
  }
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);

  const containerClient = blobServiceClient.getContainerClient("uploads");

  const uploadedFileName = `${Date.now()}-${fileName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(uploadedFileName);

  const options = {
    blobHTTPHeaders: {
      blobContentType: "application/octet-stream",
      blobContentLength: fileBuffer.length,
    },
  };

  await blockBlobClient.upload(fileBuffer, fileBuffer.length, options);

  return blockBlobClient.url;
};

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

module.exports = { uploadFileToAzureBlob, downloadFileFromAzureBlob };
