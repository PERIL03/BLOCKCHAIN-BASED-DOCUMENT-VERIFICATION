import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentUpload from '../components/DocumentUpload';

jest.mock('../utils/api', () => ({
  uploadDocument: jest.fn(),
}));

jest.mock('../utils/crypto', () => ({
  calculateFileHash: jest.fn(() => Promise.resolve('a'.repeat(64))),
}));

const { uploadDocument } = require('../utils/api');

describe('DocumentUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload form', () => {
    render(<DocumentUpload />);
    
    expect(screen.getByText(/Upload Document/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Name or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
  });

  test('shows error when submitting without file', async () => {
    render(<DocumentUpload />);
    
    const uploadButton = screen.getByRole('button', { name: /Upload & Register/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Please select a file/i)).toBeInTheDocument();
    });
  });

  test('shows error when uploadedBy is too short', async () => {
    render(<DocumentUpload />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/Click to upload/i).closest('.file-upload').querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const nameInput = screen.getByLabelText(/Your Name or Email/i);
    fireEvent.change(nameInput, { target: { value: 'ab' } });

    const uploadButton = screen.getByRole('button', { name: /Upload & Register/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });
  });

  test('successfully uploads document', async () => {
    const mockResponse = {
      document: {
        id: '123',
        fileName: 'test.txt',
        fileHash: 'a'.repeat(64),
        blockchainHash: '0x' + 'b'.repeat(64),
        transactionHash: '0x' + 'c'.repeat(64),
        blockNumber: 100,
        network: 'localhost',
        fileSize: 1000,
      },
    };

    uploadDocument.mockResolvedValue(mockResponse);

    render(<DocumentUpload />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/Click to upload/i).closest('.file-upload').querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const nameInput = screen.getByLabelText(/Your Name or Email/i);
    fireEvent.change(nameInput, { target: { value: 'test@example.com' } });

    const uploadButton = screen.getByRole('button', { name: /Upload & Register/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Document Successfully Registered/i)).toBeInTheDocument();
    });
  });

  test('displays file information after selection', () => {
    render(<DocumentUpload />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/Click to upload/i).closest('.file-upload').querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  test('shows loading state during upload', async () => {
    uploadDocument.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<DocumentUpload />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/Click to upload/i).closest('.file-upload').querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const nameInput = screen.getByLabelText(/Your Name or Email/i);
    fireEvent.change(nameInput, { target: { value: 'test@example.com' } });

    const uploadButton = screen.getByRole('button', { name: /Upload & Register/i });
    fireEvent.click(uploadButton);

    expect(screen.getByText(/Uploading to Blockchain/i)).toBeInTheDocument();
  });
});
