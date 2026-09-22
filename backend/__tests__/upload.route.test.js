// uploadToAzure.test.js
const { BlobServiceClient } = require('@azure/storage-blob');
const { uploadSessionToAzureBlob } = require('../services/azureBlobService');

jest.mock('@azure/storage-blob');

describe('uploadSessionToAzureBlob', () => {
  let mockUpload, mockGetBlockBlobClient, mockGetContainerClient;

  beforeEach(() => {
    process.env.AZURE_STORAGE_CONNECTION_STRING = 'fake-connection-string';

    mockUpload = jest.fn().mockResolvedValue({});
    
    mockGetBlockBlobClient = jest.fn().mockReturnValue({
      upload: mockUpload,
      url: 'https://fakeaccount.blob.core.windows.net/uploads/fake-blob'
    });

    mockGetContainerClient = jest.fn().mockReturnValue({
      getBlockBlobClient: mockGetBlockBlobClient,
      createIfNotExists: jest.fn().mockResolvedValue({})
    });

    BlobServiceClient.fromConnectionString = jest.fn().mockReturnValue({
      getContainerClient: mockGetContainerClient
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uploads both resume and job description, returns urls and folderId', async () => {
    const fakeResumeFile = {
      buffer: Buffer.from('fake pdf content'),
      originalname: 'resume.pdf',
      mimetype: 'application/pdf'
    };
    const jobDescText = 'We are looking for an AI Engineer...';

    const result = await uploadSessionToAzureBlob(fakeResumeFile, jobDescText);

    expect(result).toHaveProperty('folderId');
    expect(result).toHaveProperty('resumeUrl');
    expect(result).toHaveProperty('jobDescUrl');

    // called twice — once for resume, once for job description
    expect(mockUpload).toHaveBeenCalledTimes(2);
  });

  it('throws if connection string is missing', async () => {
    delete process.env.AZURE_STORAGE_CONNECTION_STRING;

    const fakeResumeFile = { buffer: Buffer.from('x'), originalname: 'r.pdf', mimetype: 'application/pdf' };

    await expect(uploadSessionToAzureBlob(fakeResumeFile, 'text'))
      .rejects.toThrow('Azure Storage Connection String is not configured');
  });

  it('converts job description string to a buffer before upload', async () => {
    const fakeResumeFile = { buffer: Buffer.from('x'), originalname: 'r.pdf', mimetype: 'application/pdf' };
    const jobDescText = 'hello world';

    await uploadSessionToAzureBlob(fakeResumeFile, jobDescText);

    // second call to upload() should be the job description
    const secondCallArgs = mockUpload.mock.calls[1];
    const bufferArg = secondCallArgs[0];

    expect(Buffer.isBuffer(bufferArg)).toBe(true);
    expect(bufferArg.toString('utf-8')).toBe('hello world');
  });
});