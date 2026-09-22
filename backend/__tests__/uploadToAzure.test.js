// upload.route.test.js
const request = require('supertest');
const express = require('express');
const uploadRouter = require('../api/upload');

jest.mock('../services/azureBlobService', () => ({
  uploadSessionToAzureBlob: jest.fn().mockResolvedValue({
    folderId: 'fake-folder-id',
    resumeUrl: 'https://fake.blob/resume.pdf',
    jobDescUrl: 'https://fake.blob/jobdesc.txt'
  })
}));

const app = express();
app.use('/api', uploadRouter);

describe('POST /api/upload', () => {
  it('uploads successfully with resume file and job description text', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('resume', Buffer.from('fake pdf content'), 'resume.pdf')
      .field('jobDescription', 'We are hiring an AI Engineer');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('folderId');
    expect(res.body).toHaveProperty('resumeUrl');
    expect(res.body).toHaveProperty('jobDescUrl');
  });

  it('returns 400 if resume file is missing', async () => {
    const res = await request(app)
      .post('/api/upload')
      .field('jobDescription', 'some job description');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/resume/i);
  });

  it('returns 400 if job description is missing', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('resume', Buffer.from('fake pdf content'), 'resume.pdf');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/job description/i);
  });

  it('returns 400 if file exceeds size limit', async () => {
    const bigBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB > 10MB limit

    const res = await request(app)
      .post('/api/upload')
      .attach('resume', bigBuffer, 'huge.pdf')
      .field('jobDescription', 'text');

    expect(res.status).toBe(400);
  });
});