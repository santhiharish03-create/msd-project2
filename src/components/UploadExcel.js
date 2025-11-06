import React, { useState } from 'react';
import { FaUpload, FaFileExcel, FaCheckCircle, FaDownload, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const UploadExcel = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  
  // Check admin access
  if (!user || user.role !== 'admin') {
    return (
      <div className="access-denied">
        <FaShieldAlt className="access-icon" />
        <h3>Access Denied</h3>
        <p>Only administrators can upload Excel files.</p>
      </div>
    );
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error('Please upload an Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const result = await apiService.uploadExcel(file);
      setUploadResult(result);
      const data = result.data || result;
      toast.success(`Successfully uploaded! ${data.timetables || 0} timetables, ${data.faculty || 0} faculty, ${data.rooms || 0} rooms created`);
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
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <div className="upload-content">
              <FaUpload className="upload-btn-icon" />
              <span>{uploading ? 'Uploading...' : 'Choose Excel/CSV File'}</span>
            </div>
          </label>
        </div>

        {uploadResult && (
          <div className="upload-result">
            <FaCheckCircle className="success-icon" />
            <div className="result-details">
              <p><strong>Upload Successful!</strong></p>
              <p>Timetables: {uploadResult.data?.timetables || uploadResult.timetables || 0}</p>
              <p>Faculty: {uploadResult.data?.faculty || uploadResult.faculty || 0}</p>
              <p>Rooms: {uploadResult.data?.rooms || uploadResult.rooms || 0}</p>
              <p>Total Entries: {uploadResult.data?.totalEntries || uploadResult.totalEntries || 0}</p>
            </div>
          </div>
        )}

        <div className="format-info">
          <div className="format-header">
            <h4>Required Excel/CSV Format:</h4>
            <button 
              className="download-template-btn"
              onClick={() => window.open('/api/upload/template', '_blank')}
            >
              <FaDownload /> Download Template
            </button>
          </div>
          <div className="format-example">
            <table>
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Room</th>
                  <th>Capacity</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CSE-A</td>
                  <td>Monday</td>
                  <td>09:00-10:00</td>
                  <td>Data Structures</td>
                  <td>Dr. Smith</td>
                  <td>Room-101</td>
                  <td>60</td>
                  <td>CSE</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="format-notes">
            <p><strong>Note:</strong> The system will automatically extract and save:</p>
            <ul>
              <li>Timetable data for each section</li>
              <li>Faculty information with subjects and departments</li>
              <li>Room details with capacity and type</li>
            </ul>
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

        .format-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .format-info h4 {
          margin: 0;
          color: #333;
          font-size: 1rem;
        }
        
        .download-template-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .download-template-btn:hover {
          background: #0056b3;
        }
        
        .format-notes {
          margin-top: 1rem;
          padding: 1rem;
          background: #e3f2fd;
          border-radius: 6px;
        }
        
        .format-notes p {
          margin: 0 0 0.5rem 0;
          color: #1565c0;
          font-size: 0.9rem;
        }
        
        .format-notes ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #1565c0;
          font-size: 0.85rem;
        }
        
        .access-denied {
          text-align: center;
          padding: 3rem 2rem;
          max-width: 400px;
          margin: 2rem auto;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 12px;
        }
        
        .access-icon {
          font-size: 3rem;
          color: #856404;
          margin-bottom: 1rem;
        }
        
        .access-denied h3 {
          color: #856404;
          margin-bottom: 0.5rem;
        }
        
        .access-denied p {
          color: #856404;
          margin: 0;
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