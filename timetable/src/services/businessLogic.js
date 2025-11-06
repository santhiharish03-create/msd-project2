// Business Logic Service for Timetable Management System

export class TimetableBusinessLogic {
  static validateTimeSlot(startTime, endTime) {
    if (!startTime || !endTime) return false;
    return startTime < endTime;
  }

  static checkTimeConflict(existingSlots, newSlot) {
    return existingSlots.some(slot => {
      const existingStart = slot.startTime;
      const existingEnd = slot.endTime;
      const newStart = newSlot.startTime;
      const newEnd = newSlot.endTime;
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
  }

  static calculateClassDuration(startTime, endTime) {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return (end - start) / (1000 * 60); // minutes
  }

  static getCurrentTimeSlot() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const timeSlots = [
      '08:15-09:10', '09:10-10:05', '10:05-10:20', '10:20-11:15',
      '11:15-12:10', '12:10-01:05', '02:00-02:55', '02:55-03:50'
    ];
    
    return timeSlots.find(slot => {
      const [start, end] = slot.split('-');
      return timeStr >= start && timeStr <= end;
    });
  }

  static isWorkingDay(date = new Date()) {
    const day = date.getDay();
    return day >= 1 && day <= 6; // Monday to Saturday
  }

  static getAcademicWeek(date = new Date()) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }
}

export class RoomBusinessLogic {
  static calculateOccupancyRate(totalRooms, occupiedRooms) {
    if (totalRooms === 0) return 0;
    return Math.round((occupiedRooms / totalRooms) * 100);
  }

  static getRoomStatus(room, currentTime) {
    if (room.maintenance) return 'maintenance';
    if (room.currentClass) return 'occupied';
    return 'available';
  }

  static findAvailableRooms(rooms, timeSlot, date) {
    return rooms.filter(room => {
      if (room.maintenance) return false;
      if (room.bookings) {
        return !room.bookings.some(booking => 
          booking.date === date && 
          this.checkTimeOverlap(booking.timeSlot, timeSlot)
        );
      }
      return true;
    });
  }

  static checkTimeOverlap(slot1, slot2) {
    const [start1, end1] = slot1.split('-');
    const [start2, end2] = slot2.split('-');
    return start1 < end2 && end1 > start2;
  }

  static calculateRoomUtilization(room, period = 'week') {
    if (!room.schedule) return 0;
    
    let totalSlots = 0;
    let occupiedSlots = 0;
    
    Object.values(room.schedule).forEach(daySchedule => {
      Object.entries(daySchedule).forEach(([time, subject]) => {
        totalSlots++;
        if (subject && subject !== 'BREAK') occupiedSlots++;
      });
    });
    
    return totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;
  }
}

export class FacultyBusinessLogic {
  static calculateWorkload(faculty, timetables) {
    let totalHours = 0;
    let totalClasses = 0;
    
    timetables.forEach(timetable => {
      Object.values(timetable.schedule).forEach(daySchedule => {
        Object.entries(daySchedule).forEach(([time, subject]) => {
          if (timetable.faculty[subject]?.includes(faculty.name)) {
            totalClasses++;
            totalHours += TimetableBusinessLogic.calculateClassDuration(
              time.split('-')[0], 
              time.split('-')[1]
            ) / 60;
          }
        });
      });
    });
    
    return { totalHours, totalClasses };
  }

  static getFacultyAvailability(faculty, day, timeSlot, timetables) {
    return !timetables.some(timetable => {
      const daySchedule = timetable.schedule[day];
      return daySchedule && daySchedule[timeSlot] && 
             timetable.faculty[daySchedule[timeSlot]]?.includes(faculty.name);
    });
  }

  static getFacultyScheduleConflicts(faculty, timetables) {
    const conflicts = [];
    const schedule = {};
    
    timetables.forEach(timetable => {
      Object.entries(timetable.schedule).forEach(([day, daySchedule]) => {
        Object.entries(daySchedule).forEach(([time, subject]) => {
          if (timetable.faculty[subject]?.includes(faculty.name)) {
            const key = `${day}-${time}`;
            if (schedule[key]) {
              conflicts.push({
                day,
                time,
                sections: [schedule[key].section, timetable.section],
                subject
              });
            } else {
              schedule[key] = { section: timetable.section, subject };
            }
          }
        });
      });
    });
    
    return conflicts;
  }
}

export class AttendanceBusinessLogic {
  static calculateAttendancePercentage(present, total) {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  }

  static getAttendanceStatus(percentage) {
    if (percentage >= 85) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 65) return 'average';
    return 'poor';
  }

  static calculateRequiredClasses(currentPercentage, totalClasses, targetPercentage = 75) {
    const currentPresent = (currentPercentage / 100) * totalClasses;
    const requiredPresent = (targetPercentage / 100) * (totalClasses + 1);
    
    if (currentPresent >= requiredPresent) return 0;
    
    return Math.ceil(requiredPresent - currentPresent);
  }

  static canSkipClasses(currentPercentage, totalClasses, targetPercentage = 75) {
    const currentPresent = (currentPercentage / 100) * totalClasses;
    let canSkip = 0;
    
    while (true) {
      const newTotal = totalClasses + canSkip + 1;
      const newPercentage = (currentPresent / newTotal) * 100;
      
      if (newPercentage < targetPercentage) break;
      canSkip++;
    }
    
    return canSkip;
  }
}

export class ExamBusinessLogic {
  static calculateGrade(marks, totalMarks) {
    const percentage = (marks / totalMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }

  static calculateGPA(subjects) {
    const gradePoints = {
      'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5, 'F': 0
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    subjects.forEach(subject => {
      const points = gradePoints[subject.grade] || 0;
      totalPoints += points * subject.credits;
      totalCredits += subject.credits;
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  }

  static isEligibleForExam(attendance, assignments) {
    const attendanceEligible = attendance >= 75;
    const assignmentEligible = assignments.every(a => a.submitted);
    
    return attendanceEligible && assignmentEligible;
  }
}

export class NotificationBusinessLogic {
  static prioritizeNotifications(notifications) {
    const priority = { 'high': 3, 'medium': 2, 'low': 1 };
    
    return notifications.sort((a, b) => {
      if (priority[b.priority] !== priority[a.priority]) {
        return priority[b.priority] - priority[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  static shouldShowNotification(notification, user) {
    if (!notification.isActive) return false;
    if (notification.expiryDate && new Date() > new Date(notification.expiryDate)) return false;
    
    if (notification.targetSections.length > 0) {
      return notification.targetSections.some(section => 
        user.section?.includes(section) || user.role === 'admin'
      );
    }
    
    return true;
  }

  static getNotificationIcon(type) {
    const icons = {
      'exam': '📝',
      'holiday': '🏖️',
      'event': '🎉',
      'maintenance': '🔧',
      'announcement': '📢',
      'alert': '⚠️'
    };
    
    return icons[type] || '📢';
  }
}