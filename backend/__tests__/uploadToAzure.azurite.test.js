// uploadToAzure.azurite.test.js
const { uploadSessionToAzureBlob } = require('../services/azureBlobService');

// NOTE: no jest.mock('@azure/storage-blob') here!
// This lets the REAL SDK run, against Azurite instead of real Azure

beforeAll(() => {
  process.env.AZURE_STORAGE_CONNECTION_STRING = 'UseDevelopmentStorage=true';
});

describe('uploadSessionToAzureBlob (Azurite)', () => {
  it('actually uploads to local Azurite emulator', async () => {
    const fakeResumeFile = {
      buffer: Buffer.from('fake pdf content'),
      originalname: 'resume.pdf',
      mimetype: 'application/pdf'
    };

    const result = await uploadSessionToAzureBlob(fakeResumeFile, 'a real job description');

    // these URLs are REAL — pointing at your local Azurite emulator
    expect(result.resumeUrl).toContain('127.0.0.1');
    expect(result.jobDescUrl).toContain('127.0.0.1');
  });
});