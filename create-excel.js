const XLSX = require('xlsx');

const data = [
  ['Section', 'Day', 'Time', 'Subject', 'Faculty', 'Room'],
  ['CSE-A', 'Monday', '09:00-10:00', 'Data Structures', 'Dr. Rajesh Kumar', 'CS-101'],
  ['CSE-A', 'Monday', '10:00-11:00', 'Computer Networks', 'Prof. Anita Sharma', 'CS-102'],
  ['CSE-A', 'Monday', '11:15-12:15', 'Database Management', 'Dr. Suresh Reddy', 'CS-103'],
  ['CSE-A', 'Tuesday', '09:00-10:00', 'Operating Systems', 'Prof. Meera Patel', 'CS-104'],
  ['CSE-A', 'Tuesday', '10:00-11:00', 'Software Engineering', 'Dr. Vikram Singh', 'CS-105'],
  ['CSE-B', 'Monday', '09:00-10:00', 'Machine Learning', 'Dr. Priya Nair', 'CS-201'],
  ['CSE-B', 'Monday', '10:00-11:00', 'Web Technologies', 'Prof. Arjun Gupta', 'CS-202'],
  ['ECE-A', 'Monday', '09:00-10:00', 'Digital Electronics', 'Dr. Sanjay Verma', 'ECE-101'],
  ['ECE-A', 'Monday', '10:00-11:00', 'Signal Processing', 'Prof. Deepika Joshi', 'ECE-102']
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
XLSX.writeFile(wb, 'sample-timetable.xlsx');
console.log('Excel file created: sample-timetable.xlsx');