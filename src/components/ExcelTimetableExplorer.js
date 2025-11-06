import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';
import './ExcelTimetableExplorer.css';

const STORAGE_KEY = 'excelTimetableDataset:v1';

const REQUIRED_FIELDS = {
  section: ['section', 'section name', 'sec'],
  className: ['class', 'class name', 'course', 'batch', 'class id'],
  subject: ['subject', 'subject name', 'course title'],
  faculty: ['faculty', 'faculty name', 'teacher', 'lecturer', 'instructor'],
  room: ['room', 'room number', 'classroom', 'hall', 'room no', 'room id'],
  day: ['day', 'weekday', 'day of week'],
  time: ['time', 'time slot', 'slot', 'period', 'timing']
};

const normalizeKey = (key) => key.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');

const detectFieldMapping = (headers) => {
  const mapping = {};

  headers.forEach((header) => {
    const normalized = normalizeKey(header);
    Object.entries(REQUIRED_FIELDS).forEach(([field, candidates]) => {
      if (mapping[field]) {
        return;
      }

      if (candidates.some((candidate) => normalized.includes(candidate))) {
        mapping[field] = header;
      }
    });
  });

  return mapping;
};

const findHeaderRowIndex = (rows) => {
  const maxScan = Math.min(rows.length, 20);
  let bestIndex = 0;
  let bestScore = -1;

  for (let i = 0; i < maxScan; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const mapping = detectFieldMapping(row);
    const score = Object.keys(mapping).length;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }

    if (score >= 5) {
      return i;
    }
  }
  return bestIndex;
};

const buildRecord = (rowValues, mapping, headerIndexMap) => {
  const record = {};

  Object.entries(mapping).forEach(([field, header]) => {
    const index = headerIndexMap[header];
    const value = rowValues[index];
    if (value !== undefined && value !== null) {
      record[field] = typeof value === 'string' ? value.trim() : value.toString();
    }
  });

  return record;
};

const ExcelTimetableExplorer = () => {
  const [timetableRecords, setTimetableRecords] = useState([]);
  const [sheetSummaries, setSheetSummaries] = useState([]);
  const [issues, setIssues] = useState([]);
  const [sourceFile, setSourceFile] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [filters, setFilters] = useState({
    section: '',
    className: '',
    subject: '',
    faculty: '',
    room: '',
    day: '',
    time: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setTimetableRecords(parsed.records || []);
      setSheetSummaries(parsed.summaries || []);
      setIssues(parsed.issues || []);
      setSourceFile(parsed.sourceFile || '');
      setLastUpdated(parsed.lastUpdated || '');
    } catch (error) {
      console.error('Failed to hydrate stored timetable data', error);
    }
  }, []);

  useEffect(() => {
    if (timetableRecords.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const payload = {
      records: timetableRecords,
      summaries: sheetSummaries,
      issues,
      sourceFile,
      lastUpdated
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [timetableRecords, sheetSummaries, issues, sourceFile, lastUpdated]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 15 * 1024 * 1024) { // 15MB limit
      toast.error('File too large. Please upload an Excel file under 15MB.');
      event.target.value = '';
      return;
    }

    setIsParsing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      const parsedRecords = [];
      const collectedIssues = [];
      const summaries = [];

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rows.length === 0) {
          return;
        }

        const headerIndex = findHeaderRowIndex(rows);
        const headerRow = rows[headerIndex];
        const dataRows = rows.slice(headerIndex + 1);
        const mapping = detectFieldMapping(headerRow);
        console.log('Detected mapping:', mapping);
        console.log('Header row:', headerRow);
        
        const headerIndexMap = headerRow.reduce((acc, header, index) => {
          acc[header] = index;
          return acc;
        }, {});

        const missingColumns = Object.keys(REQUIRED_FIELDS).filter((field) => !mapping[field]);
        if (missingColumns.length > 0) {
          collectedIssues.push({
            type: 'missing_columns',
            sheetName,
            message: `Sheet "${sheetName}" is missing columns for: ${missingColumns.join(', ')}`
          });
        }

        let sheetValidRecords = 0;

        dataRows.forEach((rowValues, rowIndex) => {
          const hasContent = rowValues.some((value) => value !== '' && value !== null && value !== undefined);
          if (!hasContent) {
            return;
          }

          const record = buildRecord(rowValues, mapping, headerIndexMap);
          console.log('Built record:', record);
          
          const essentialFields = ['section', 'day', 'time', 'subject'];
          const missingEssential = essentialFields.filter((field) => !record[field]);
          
          if (missingEssential.length > 0) {
            console.log('Missing essential fields:', missingEssential);
          }

          if (missingEssential.length > 0) {
            collectedIssues.push({
              type: 'missing_fields',
              sheetName,
              message: `Row ${rowIndex + 2} in sheet "${sheetName}" is missing: ${missingEssential.join(', ')}`
            });
            return;
          }

          sheetValidRecords += 1;

          parsedRecords.push({
            id: `${sheetName}-${rowIndex + 2}`,
            sheetName,
            section: record.section,
            className: record.className || record.section,
            subject: record.subject,
            faculty: record.faculty || 'TBA',
            room: record.room || 'TBA',
            day: record.day,
            time: record.time
          });
        });

        summaries.push({
          sheetName,
          totalRows: dataRows.length,
          acceptedRows: sheetValidRecords,
          rejectedRows: dataRows.length - sheetValidRecords
        });
      });

      setTimetableRecords(parsedRecords);
      setSheetSummaries(summaries);
      setIssues(collectedIssues);
      setSourceFile(file.name);
      setLastUpdated(new Date().toISOString());

      const accepted = summaries.reduce((acc, s) => acc + s.acceptedRows, 0);
      const flagged = collectedIssues.length;
      
      // Upload to backend
      try {
        const result = await apiService.uploadExcel(file);
        toast.success(`Imported ${accepted} entries • Synced to database`);
        console.log('Backend upload result:', result);
      } catch (error) {
        console.warn('Backend upload failed:', error);
        toast.success(`Imported ${accepted} entries • Stored locally`);
      }
      
      setFilters({
        section: '',
        className: '',
        subject: '',
        faculty: '',
        room: '',
        day: '',
        time: ''
      });
    } catch (error) {
      console.error('Failed to parse Excel timetable', error);
      setIssues([{ type: 'error', sheetName: null, message: 'An unexpected error occurred while parsing the Excel file.' }]);
      toast.error('Failed to read the Excel file. Please verify the format (.xlsx/.xls).');
    } finally {
      setIsParsing(false);
      event.target.value = '';
    }
  };

  const clearDataset = () => {
    setTimetableRecords([]);
    setSheetSummaries([]);
    setIssues([]);
    setSourceFile('');
    setLastUpdated('');
    setFilters({
      section: '',
      className: '',
      subject: '',
      faculty: '',
      room: '',
      day: '',
      time: ''
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const filteredRecords = useMemo(() => {
    if (timetableRecords.length === 0) {
      return [];
    }

    return timetableRecords.filter((record) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) {
          return true;
        }

        return record[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [timetableRecords, filters]);

  const totalAcceptedRows = sheetSummaries.reduce((total, summary) => total + summary.acceptedRows, 0);

  return (
    <section className="excel-explorer">
      <div className="explorer-card">
        <div className="explorer-header">
          <div>
            <h2 className="explorer-title">Excel Timetable Explorer</h2>
            <p className="explorer-subtitle">Import institutional timetables directly from Excel and explore them with instant filters.</p>
          </div>
          <div className="explorer-actions">
            <label className="upload-button">
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={isParsing} />
              {isParsing ? 'Processing…' : 'Upload Excel'}
            </label>
            {timetableRecords.length > 0 && (
              <button type="button" className="clear-button" onClick={clearDataset}>
                Clear Dataset
              </button>
            )}
          </div>
        </div>

        {timetableRecords.length > 0 ? (
          <div className="explorer-body">
            <div className="dataset-summary">
              <div>
                <p className="summary-label">Source file</p>
                <p className="summary-value">{sourceFile}</p>
              </div>
              <div>
                <p className="summary-label">Valid entries</p>
                <p className="summary-value">{totalAcceptedRows}</p>
              </div>
              <div>
                <p className="summary-label">Last updated</p>
                <p className="summary-value">{lastUpdated ? new Date(lastUpdated).toLocaleString() : '—'}</p>
              </div>
            </div>

            {sheetSummaries.length > 0 && (
              <div className="sheet-summary">
                <h3>Sheet summary</h3>
                <div className="sheet-grid">
                  {sheetSummaries.map((summary) => (
                    <div key={summary.sheetName} className="sheet-card">
                      <p className="sheet-name">{summary.sheetName}</p>
                      <p className="sheet-stats">Accepted rows: {summary.acceptedRows}</p>
                      <p className="sheet-stats">Total rows: {summary.totalRows}</p>
                      <p className="sheet-stats">Flagged rows: {summary.rejectedRows}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {issues.length > 0 && (
              <div className="issues-panel">
                <h3>Data quality checks</h3>
                <ul>
                  {issues.map((issue, index) => (
                    <li key={`${issue.sheetName || 'general'}-${index}`}>
                      <span className="issue-type">{issue.type === 'error' ? 'Error' : 'Warning'}:</span>
                      <span className="issue-message">{issue.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="query-panel">
              <h3>Query and filter</h3>
              <div className="query-grid">
                <label>
                  <span>Section</span>
                  <input
                    type="text"
                    value={filters.section}
                    onChange={(event) => setFilters((prev) => ({ ...prev, section: event.target.value }))}
                    placeholder="e.g. CSE-A"
                  />
                </label>
                <label>
                  <span>Class</span>
                  <input
                    type="text"
                    value={filters.className}
                    onChange={(event) => setFilters((prev) => ({ ...prev, className: event.target.value }))}
                    placeholder="Class identifier"
                  />
                </label>
                <label>
                  <span>Subject</span>
                  <input
                    type="text"
                    value={filters.subject}
                    onChange={(event) => setFilters((prev) => ({ ...prev, subject: event.target.value }))}
                    placeholder="Subject name"
                  />
                </label>
                <label>
                  <span>Faculty</span>
                  <input
                    type="text"
                    value={filters.faculty}
                    onChange={(event) => setFilters((prev) => ({ ...prev, faculty: event.target.value }))}
                    placeholder="Faculty name"
                  />
                </label>
                <label>
                  <span>Room</span>
                  <input
                    type="text"
                    value={filters.room}
                    onChange={(event) => setFilters((prev) => ({ ...prev, room: event.target.value }))}
                    placeholder="Room number"
                  />
                </label>
                <label>
                  <span>Day</span>
                  <input
                    type="text"
                    value={filters.day}
                    onChange={(event) => setFilters((prev) => ({ ...prev, day: event.target.value }))}
                    placeholder="e.g. Monday"
                  />
                </label>
                <label>
                  <span>Time slot</span>
                  <input
                    type="text"
                    value={filters.time}
                    onChange={(event) => setFilters((prev) => ({ ...prev, time: event.target.value }))}
                    placeholder="e.g. 10:00"
                  />
                </label>
              </div>
              <div className="query-footer">
                <p>{filteredRecords.length} matching entries</p>
                <button
                  type="button"
                  onClick={() => setFilters({
                    section: '',
                    className: '',
                    subject: '',
                    faculty: '',
                    room: '',
                    day: '',
                    time: ''
                  })}
                >
                  Reset filters
                </button>
              </div>
            </div>

            <div className="results-panel">
              <div className="results-header">
                <h3>Timetable results</h3>
                <p>Review every class entry across all sheets with the active filters applied.</p>
              </div>
              <div className="results-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Faculty</th>
                      <th>Room</th>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Sheet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{record.section}</td>
                        <td>{record.className}</td>
                        <td>{record.subject}</td>
                        <td>{record.faculty}</td>
                        <td>{record.room}</td>
                        <td>{record.day}</td>
                        <td>{record.time}</td>
                        <td>{record.sheetName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Upload a timetable to get started</h3>
            <p>The explorer processes every sheet, validates required columns, and highlights any gaps that need your attention.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExcelTimetableExplorer;
