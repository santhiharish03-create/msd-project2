import React, { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaPrint, FaWifi, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import realTimeEngine from '../services/realTimeEngine';
import apiService from '../services/apiService';
import { TimetableBusinessLogic } from '../services/businessLogic';
import ExcelTimetableExplorer from './ExcelTimetableExplorer';
import './TimeTable.css';

const TimeTable = () => {
  const [searchType, setSearchType] = useState('section');
  const [searchQuery, setSearchQuery] = useState('');
  const [timetableData, setTimetableData] = useState(null);
  const [allTimetables, setAllTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleTimetableUpdate = (timetables) => {
      setAllTimetables(timetables || []);
      setConnected(realTimeEngine.isRunning);
      
      // Auto-update current search if applicable
      if (searchQuery && searchType === 'section') {
        const found = (timetables || []).find(t => t.section === searchQuery.toUpperCase());
        if (found) setTimetableData(found);
      }
    };
    
    realTimeEngine.subscribe('timetables', handleTimetableUpdate);
    realTimeEngine.start();
    
    return () => {
      realTimeEngine.unsubscribe('timetables', handleTimetableUpdate);
    };
  }, [searchQuery, searchType]);

  const handleSearch = async () => {
    if (!searchQuery) {
      toast.error('Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      let data;
      
      if (searchType === 'section') {
        // Use cached data first, then API if needed
        data = allTimetables.find(t => t.section === searchQuery.toUpperCase());
        if (!data) {
          data = await apiService.getTimetable(searchQuery.toUpperCase());
        }
      } else if (searchType === 'faculty') {
        data = await apiService.getFacultySchedule(searchQuery);
      } else if (searchType === 'room') {
        data = await apiService.getRoomSchedule(searchQuery);
      }
      
      if (data) {
        // Apply real-time business logic validation
        if (searchType === 'section' && data.schedule) {
          const validSchedule = Object.entries(data.schedule).every(([day, slots]) => {
            return Object.entries(slots).every(([timeSlot, subject]) => {
              if (timeSlot.includes('-')) {
                const [start, end] = timeSlot.split('-');
                return TimetableBusinessLogic.validateTimeSlot(start, end);
              }
              return true;
            });
          });
          
          if (!validSchedule) {
            toast.error('Invalid time slots detected in timetable');
            return;
          }
          
          // Enrich with real-time data
          const currentSlot = TimetableBusinessLogic.getCurrentTimeSlot();
          const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          
          data.currentClass = currentSlot && data.schedule[currentDay]?.[currentSlot] ? {
            subject: data.schedule[currentDay][currentSlot],
            timeSlot: currentSlot,
            faculty: data.faculty[data.schedule[currentDay][currentSlot]] || 'TBA'
          } : null;
        }
        
        setTimetableData(data);
        toast.success(`Found ${searchType} data for ${searchQuery}`);
      } else {
        setTimetableData(null);
        toast.error(`No ${searchType} found with name '${searchQuery}'. Please check the spelling or upload data first.`);
      }
    } catch (error) {
      setError(error.message);
      setTimetableData(null);
      toast.error(`Error searching for ${searchType}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <select
            className="input max-w-xs"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="section">Search by Section</option>
            <option value="faculty">Search by Faculty</option>
            <option value="room">Search by Room</option>
          </select>

          <div className="relative flex-1">
            <input
              type="text"
              className="input pl-10"
              placeholder={`Enter ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {timetableData && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">
                  {searchType === 'section' && `Section ${searchQuery.toUpperCase()}`}
                  {searchType === 'faculty' && `Faculty Schedule`}
                  {searchType === 'room' && `Room Schedule`}
                </h2>
                <div className={`flex items-center gap-1 text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
                  <FaWifi />
                  {connected ? 'Live' : 'Offline'}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    if (timetableData) {
                      const csv = Object.entries(timetableData.schedule)
                        .flatMap(([day, slots]) => 
                          Object.entries(slots).map(([time, subject]) => 
                            `${timetableData.section},${day},${time},${subject},${timetableData.faculty[subject] || 'TBA'},${timetableData.roomNumber}`
                          )
                        ).join('\n');
                      
                      const blob = new Blob([`section,day,time,subject,faculty,room\n${csv}`], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `timetable-${searchQuery}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                >
                  <FaDownload className="mr-2" /> Export
                </button>
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  <FaPrint className="mr-2" /> Print
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="p-4 text-left">Time</th>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <th key={day} className="p-4 text-left">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timetableData.schedule && Object.entries(timetableData.schedule).map(([day, slots]) => (
                    Object.entries(slots).map(([time, subject]) => (
                      <tr key={`${day}-${time}`} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-4 font-medium">{time}</td>
                        <td className="p-4">{day === 'Monday' ? subject : '-'}</td>
                        <td className="p-4">{day === 'Tuesday' ? subject : '-'}</td>
                        <td className="p-4">{day === 'Wednesday' ? subject : '-'}</td>
                        <td className="p-4">{day === 'Thursday' ? subject : '-'}</td>
                        <td className="p-4">{day === 'Friday' ? subject : '-'}</td>
                      </tr>
                    ))
                  )).flat()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <ExcelTimetableExplorer />
    </div>
  );
};

export default TimeTable;
