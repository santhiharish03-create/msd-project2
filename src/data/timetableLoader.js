import config from './config.json';
import sectionA from './sections/sectionA.json';
import sectionB from './sections/sectionB.json';
import sectionC from './sections/sectionC.json';
import sectionD from './sections/sectionD.json';

// Import all section data
const sections = {
  A: sectionA,
  B: sectionB,
  C: sectionC,
  D: sectionD
  // Add more sections as they are created
};

export const getFacultyData = () => config.faculty;
export const getTimeSlots = () => config.timeSlots;
export const getDays = () => config.days;

export const getSectionData = (sectionId) => {
  return sections[sectionId.toUpperCase()];
};

export const getAllSections = () => {
  return Object.keys(sections);
};

export const getCurrentClass = (section, currentTime = new Date()) => {
  const sectionData = getSectionData(section);
  if (!sectionData) return null;

  const day = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const schedule = sectionData.schedule[day];
  if (!schedule) return null;

  const currentSlot = Object.entries(schedule).find(([timeSlot]) => {
    const [start, end] = timeSlot.split('-');
    return timeStr >= start && timeStr <= end;
  });

  if (!currentSlot) return null;

  const [time, details] = currentSlot;
  if (typeof details === 'string' && details === 'BREAK') {
    return { subject: 'BREAK', time, faculty: null };
  }

  return {
    subject: details.subject,
    time,
    faculty: details.faculty,
    room: sectionData.roomNumber
  };
};

export const getNextClass = (section, currentTime = new Date()) => {
  const sectionData = getSectionData(section);
  if (!sectionData) return null;

  const day = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const schedule = sectionData.schedule[day];
  if (!schedule) return null;

  const nextSlot = Object.entries(schedule).find(([timeSlot]) => {
    const [start] = timeSlot.split('-');
    return timeStr < start;
  });

  if (!nextSlot) return null;

  const [time, details] = nextSlot;
  if (typeof details === 'string' && details === 'BREAK') {
    return { subject: 'BREAK', time, faculty: null };
  }

  return {
    subject: details.subject,
    time,
    faculty: details.faculty,
    room: sectionData.roomNumber
  };
};

export const findFacultySchedule = (facultyName) => {
  const schedule = {};
  
  Object.entries(sections).forEach(([sectionId, sectionData]) => {
    Object.entries(sectionData.schedule).forEach(([day, slots]) => {
      Object.entries(slots).forEach(([time, details]) => {
        if (typeof details === 'object' && details.faculty?.includes(facultyName)) {
          if (!schedule[day]) schedule[day] = {};
          schedule[day][time] = {
            subject: details.subject,
            section: sectionId,
            room: sectionData.roomNumber
          };
        }
      });
    });
  });

  const firstSection = Object.keys(schedule)[0];
  return {
    schedule,
    currentClass: firstSection ? getCurrentClass(firstSection) : null,
    nextClass: firstSection ? getNextClass(firstSection) : null
  };
};

export const findRoomSchedule = (roomNumber) => {
  const sectionEntry = Object.entries(sections).find(
    ([_, data]) => data.roomNumber === roomNumber
  );

  if (!sectionEntry) return null;

  const [section, data] = sectionEntry;
  const current = getCurrentClass(section);

  return {
    ...data,
    section,
    currentClass: current,
    isOccupied: !!current && current.subject !== 'BREAK'
  };
};

export default {
  getFacultyData,
  getTimeSlots,
  getDays,
  getSectionData,
  getAllSections,
  getCurrentClass,
  getNextClass,
  findFacultySchedule,
  findRoomSchedule
};
