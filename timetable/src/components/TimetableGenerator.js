import React, { useState, useEffect } from 'react';
import { FaPlus, FaDownload, FaUpload, FaCalendarAlt, FaUsers, FaClock, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import realTimeEngine from '../services/realTimeEngine';
import apiService from '../services/apiService';
import { TimetableBusinessLogic, RoomBusinessLogic } from '../services/businessLogic';
import './TimetableGenerator.css';

const TimetableGenerator = () => {
  const [sections, setSections] = useState(['A', 'B', 'C', 'D', 'E']);
  const [subjects, setSubjects] = useState([
    'Computer Organization & Architecture',
    'Design & Analysis of Algorithms', 
    'Operating Systems',
    'Theory of Computation',
    'Formal Methods & Programming',
    'Cloud Computing & Programming Skills'
  ]);
  const [faculty, setFaculty] = useState([
    'Dr. S. Ramesh',
    'Dr. N. Kishore', 
    'Ms. R. Pooja',
    'Dr. K. Kumar',
    'Mrs. G. Lavanya',
    'Mr. Nitin'
  ]);
  const [rooms, setRooms] = useState([]);
  const [generatedTimetables, setGeneratedTimetables] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const timeSlots = [
    '08:15-09:10',
    '09:10-10:05', 
    '10:05-10:20',
    '10:20-11:15',
    '11:15-12:10',
    '12:10-01:05',
    '02:00-02:55',
    '02:55-03:50'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const handleRoomUpdate = (roomsData) => {
      setRooms(roomsData || []);
    };
    
    realTimeEngine.subscribe('rooms', handleRoomUpdate);
    realTimeEngine.start();
    
    return () => {
      realTimeEngine.unsubscribe('rooms', handleRoomUpdate);
    };
  }, []);

  const generateRandomTimetable = (section) => {
    const schedule = {};
    
    days.forEach(day => {
      schedule[day] = {};
      timeSlots.forEach(slot => {
        if (slot === '10:05-10:20' || slot === '12:10-01:05') {
          schedule[day][slot] = 'BREAK';
        } else if (day === 'Saturday' && slot !== '08:15-09:10') {
          schedule[day][slot] = '';
        } else {
          // Apply business logic for subject distribution
          const availableSubjects = subjects.filter(subject => {
            // Check if subject already scheduled too many times this day
            const daySubjects = Object.values(schedule[day]).filter(s => s === subject);
            return daySubjects.length < 2; // Max 2 classes per subject per day
          });
          
          const randomSubject = availableSubjects.length > 0 ? 
            availableSubjects[Math.floor(Math.random() * availableSubjects.length)] :
            subjects[Math.floor(Math.random() * subjects.length)];
          
          schedule[day][slot] = randomSubject;
        }
      });
    });

    // Apply room assignment logic
    const availableRooms = rooms.filter(room => room.status !== 'maintenance');
    const assignedRoom = availableRooms.length > 0 ? 
      availableRooms[Math.floor(Math.random() * availableRooms.length)].roomNumber : 
      `${Math.floor(Math.random() * 4) + 2}A-${Math.floor(Math.random() * 400) + 100}`;

    // Validate schedule using business logic
    const isValid = Object.entries(schedule).every(([day, slots]) => {
      return Object.entries(slots).every(([timeSlot, subject]) => {
        if (timeSlot.includes('-')) {
          const [start, end] = timeSlot.split('-');
          return TimetableBusinessLogic.validateTimeSlot(start, end);
        }
        return true;
      });
    });
    
    if (!isValid) {
      toast.error(`Invalid schedule generated for section ${section}`);
    }

    return {
      section,
      roomNumber: assignedRoom,
      schedule,
      faculty: faculty.reduce((acc, name, index) => {
        acc[subjects[index] || `Subject${index}`] = name;
        return acc;
      }, {}),
      generatedAt: new Date().toISOString(),
      isValid
    };
  };

  const generateAllTimetables = async () => {
    setIsGenerating(true);
    try {
      const timetables = sections.map(section => generateRandomTimetable(section));
      
      // Save to backend
      for (const timetable of timetables) {
        try {
          await apiService.createTimetable(timetable);
        } catch (error) {
          console.warn(`Failed to save timetable for section ${timetable.section}:`, error);
        }
      }
      
      setGeneratedTimetables(timetables);
      toast.success(`Generated timetables for ${sections.length} sections`);
    } catch (error) {
      toast.error('Error generating timetables');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addSection = () => {
    const nextSection = String.fromCharCode(65 + sections.length);
    if (sections.length < 19) { // A-S
      setSections([...sections, nextSection]);
    }
  };

  const removeSection = (sectionToRemove) => {
    setSections(sections.filter(s => s !== sectionToRemove));
  };

  const addSubject = () => {
    const newSubject = prompt('Enter subject name:');
    if (newSubject && !subjects.includes(newSubject)) {
      setSubjects([...subjects, newSubject]);
    }
  };

  const addFaculty = () => {
    const newFaculty = prompt('Enter faculty name:');
    if (newFaculty && !faculty.includes(newFaculty)) {
      setFaculty([...faculty, newFaculty]);
    }
  };

  const exportTimetables = () => {
    const dataStr = JSON.stringify(generatedTimetables, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timetables.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="timetable-generator">
      <div className="generator-header">
        <h2><FaCalendarAlt /> Timetable Generator</h2>
        <div className="header-actions">
          <button onClick={generateAllTimetables} disabled={isGenerating} className="generate-btn">
            {isGenerating ? 'Generating...' : 'Generate All Timetables'}
          </button>
          {generatedTimetables.length > 0 && (
            <button onClick={exportTimetables} className="export-btn">
              <FaDownload /> Export
            </button>
          )}
        </div>
      </div>

      <div className="generator-config">
        <div className="config-section">
          <h3><FaUsers /> Sections ({sections.length})</h3>
          <div className="items-list">
            {sections.map(section => (
              <div key={section} className="item-tag">
                Section {section}
                <button onClick={() => removeSection(section)} className="remove-btn">×</button>
              </div>
            ))}
            <button onClick={addSection} className="add-btn">
              <FaPlus /> Add Section
            </button>
          </div>
        </div>

        <div className="config-section">
          <h3>Subjects ({subjects.length})</h3>
          <div className="items-list">
            {subjects.map(subject => (
              <div key={subject} className="item-tag">
                {subject}
              </div>
            ))}
            <button onClick={addSubject} className="add-btn">
              <FaPlus /> Add Subject
            </button>
          </div>
        </div>

        <div className="config-section">
          <h3>Faculty ({faculty.length})</h3>
          <div className="items-list">
            {faculty.map(name => (
              <div key={name} className="item-tag">
                {name}
              </div>
            ))}
            <button onClick={addFaculty} className="add-btn">
              <FaPlus /> Add Faculty
            </button>
          </div>
        </div>
      </div>

      {generatedTimetables.length > 0 && (
        <div className="generated-preview">
          <h3>Generated Timetables Preview</h3>
          <div className="timetables-grid">
            {generatedTimetables.map(timetable => (
              <div key={timetable.section} className="timetable-card">
                <div className="card-header">
                  <h4>Section {timetable.section}</h4>
                  <span className="room-info">Room: {timetable.roomNumber}</span>
                </div>
                <div className="schedule-preview">
                  {days.slice(0, 3).map(day => (
                    <div key={day} className="day-preview">
                      <strong>{day}:</strong>
                      <span>{Object.values(timetable.schedule[day]).filter(s => s && s !== 'BREAK').length} classes</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="time-slots-info">
        <h3><FaClock /> Time Slots</h3>
        <div className="slots-grid">
          {timeSlots.map(slot => (
            <div key={slot} className={`slot-item ${slot.includes('10:05-10:20') || slot.includes('12:10-01:05') ? 'break-slot' : ''}`}>
              {slot}
              {(slot.includes('10:05-10:20') || slot.includes('12:10-01:05')) && <span className="break-label">BREAK</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableGenerator;