import React, { useState } from 'react';
import { FaUpload, FaFileExcel, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';

const UploadExcel = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const result = await apiService.uploadExcel(file);
      setUploadResult(result);
      toast.success(`Successfully uploaded! ${result.sectionsCreated} sections created`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please check your file format.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="upload-excel-container">
      <div className="upload-card">
        <div className="upload-header">
          <FaFileExcel className="upload-icon" />
          <h3>Upload Excel Timetable</h3>
          <p>Upload your timetable Excel file to import data</p>
        </div>

        <div className="upload-area">
          <label className="upload-label">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <div className="upload-content">
              <FaUpload className="upload-btn-icon" />
              <span>{uploading ? 'Uploading...' : 'Choose Excel File'}</span>
            </div>
          </label>
        </div>

        {uploadResult && (
          <div className="upload-result">
            <FaCheckCircle className="success-icon" />
            <div className="result-details">
              <p><strong>Upload Successful!</strong></p>
              <p>Sections Created: {uploadResult.sectionsCreated}</p>
              <p>Entries Processed: {uploadResult.entriesProcessed}</p>
            </div>
          </div>
        )}

        <div className="format-info">
          <h4>Required Excel Format:</h4>
          <div className="format-example">
            <table>
              <thead>
                <tr>
                  <th>section</th>
                  <th>day</th>
                  <th>time</th>
                  <th>subject</th>
                  <th>faculty</th>
                  <th>room</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A</td>
                  <td>Monday</td>
                  <td>08:15-09:10</td>
                  <td>Mathematics</td>
                  <td>Dr. Smith</td>
                  <td>101</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .upload-excel-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .upload-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          border: 1px solid #e1e5e9;
        }

        .upload-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .upload-icon {
          font-size: 3rem;
          color: #28a745;
          margin-bottom: 1rem;
        }

        .upload-header h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.5rem;
        }

        .upload-header p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .upload-area {
          margin-bottom: 2rem;
        }

        .upload-label {
          display: block;
          cursor: pointer;
        }

        .upload-content {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 3rem 2rem;
          text-align: center;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }

        .upload-content:hover {
          border-color: #007bff;
          background: #e3f2fd;
        }

        .upload-btn-icon {
          font-size: 2rem;
          color: #007bff;
          margin-bottom: 1rem;
          display: block;
        }

        .upload-content span {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
        }

        .upload-result {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .success-icon {
          color: #28a745;
          font-size: 1.5rem;
        }

        .result-details p {
          margin: 0.25rem 0;
          color: #155724;
        }

        .format-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .format-info h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }

        .format-example {
          overflow-x: auto;
        }

        .format-example table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .format-example th,
        .format-example td {
          border: 1px solid #ddd;
          padding: 0.5rem;
          text-align: left;
        }

        .format-example th {
          background: #e9ecef;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default UploadExcel;