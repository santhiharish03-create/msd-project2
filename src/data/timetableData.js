// Common faculty data for all sections
const facultyData = {
  COA: "Dr. S. Ramesh (9876543210)",
  COA_TUTORIAL: "Dr. S. Ramesh (9876543210)",
  CCPS: "Mr. T. Anirudh, Ms. P. Deepa, Mr. K. Suresh",
  DAA: "Dr. N. Kishore (9123456789), Ms. B. Aditi, Mr. H. Karan, Ms. T. Megha",
  DAA_TRANSACTION_PRACTICE: "Dr. N. Kishore (9123456789)",
  FAD: "Ms. R. Pooja (8765432109), Mr. S. Rohan, Ms. M. Sneha, Mr. V. Akash",
  OS: "Dr. K. Kumar, Mr. P. Arjun, Ms. A. Snehal, Ms. R. Swathi",
  TOC: "Mrs. G. Lavanya, Mr. D. Ankit, Ms. T. Priya, Mr. S. Rahul",
  CC: "Mr. Nitin",
  FP: "Dr. P. Sandeep",
  NPTEL: "Mr. R. Karthik (9098765432)"
};

// Base schedule template
const baseSchedule = {
  Monday: {
    "08:15-09:10": "FP",
    "09:10-10:05": "NPTEL",
    "10:05-10:20": "CCPS",
    "10:20-11:15": "PC LAB",
    "11:15-12:10": "COA",
    "12:10-01:05": "BREAK",
    "02:00-02:55": "DAA",
    "02:55-03:50": "NPTEL"
  },
  Tuesday: {
    "08:15-09:10": "COA(T)",
    "09:10-10:05": "COA(TUTORIAL)",
    "10:05-10:20": "BREAK",
    "10:20-11:15": "OS-P",
    "11:15-12:10": "DAA(T)",
    "12:10-01:05": "BREAK",
    "02:00-02:55": "FP",
    "02:55-03:50": "DAA-P"
  },
  Wednesday: {
    "08:15-09:10": "FAD",
    "09:10-10:05": "BREAK",
    "10:05-10:20": "BREAK",
    "10:20-11:15": "COA(T)",
    "11:15-12:10": "TOC",
    "12:10-01:05": "DAA(T)",
    "02:00-02:55": "OS",
    "02:55-03:50": "CCPS"
  },
  Thursday: {
    "08:15-09:10": "OS",
    "09:10-10:05": "TOC",
    "10:05-10:20": "BREAK",
    "10:20-11:15": "TOC",
    "11:15-12:10": "CCPS",
    "12:10-01:05": "BREAK",
    "02:00-02:55": "DAA",
    "02:55-03:50": "FP"
  },
  Friday: {
    "08:15-09:10": "DAA",
    "09:10-10:05": "TOC",
    "10:05-10:20": "BREAK",
    "10:20-11:15": "OS",
    "11:15-12:10": "CCPS",
    "12:10-01:05": "BREAK",
    "02:00-02:55": "OS(T)",
    "02:55-03:50": "FAD"
  },
  Saturday: {
    "08:15-09:10": "T5 ASSESSMENT"
  }
};

// Generate schedules for sections A to S with slight variations
const generateSectionSchedule = (section) => {
  const schedule = JSON.parse(JSON.stringify(baseSchedule));
  
  // Add some variations based on section
  const variations = {
    A: { "Monday": { "08:15-09:10": "TOC" } },
    B: { "Tuesday": { "02:00-02:55": "CCPS" } },
    C: { "Wednesday": { "02:55-03:50": "FAD" } },
    // ... add more variations for other sections
  };

  if (variations[section]) {
    Object.keys(variations[section]).forEach(day => {
      Object.assign(schedule[day], variations[section][day]);
    });
  }

  return schedule;
};

// Generate room numbers for each section
const generateRoomNumber = (section) => {
  const floor = Math.floor(Math.random() * 4) + 2; // Floors 2-5
  const wing = String.fromCharCode(65 + Math.floor(Math.random() * 3)); // Wings A-C
  return `${floor}${wing}-${Math.floor(Math.random() * 400) + 100}`; // Room number
};

// Generate the complete timetable data
const generateTimetableData = () => {
  const sections = Array.from('ABCDEFGHIJKLMNOPQRS').map(letter => ({
    section: letter,
    roomNumber: generateRoomNumber(letter),
    schedule: generateSectionSchedule(letter)
  }));

  return {
    sections: sections.reduce((acc, section) => {
      acc[section.section] = {
        roomNumber: section.roomNumber,
        schedule: section.schedule,
        faculty: facultyData
      };
      return acc;
    }, {}),
    faculty: facultyData
  };
};

export const timetableData = generateTimetableData();

// Helper function to get current class for a section
export const getCurrentClass = (section, currentTime = new Date()) => {
  const day = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const schedule = timetableData.sections[section]?.schedule[day];
  if (!schedule) return null;

  const currentSlot = Object.entries(schedule).find(([timeSlot]) => {
    const [start, end] = timeSlot.split('-');
    return timeStr >= start && timeStr <= end;
  });

  return currentSlot ? {
    subject: currentSlot[1],
    time: currentSlot[0],
    faculty: timetableData.faculty[currentSlot[1]] || 'N/A'
  } : null;
};

// Helper function to get next class for a section
export const getNextClass = (section, currentTime = new Date()) => {
  const day = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const schedule = timetableData.sections[section]?.schedule[day];
  if (!schedule) return null;

  const nextSlot = Object.entries(schedule).find(([timeSlot]) => {
    const [start] = timeSlot.split('-');
    return timeStr < start;
  });

  return nextSlot ? {
    subject: nextSlot[1],
    time: nextSlot[0],
    faculty: timetableData.faculty[nextSlot[1]] || 'N/A'
  } : null;
};

export default timetableData;
