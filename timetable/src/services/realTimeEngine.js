import apiService from './apiService';
import { TimetableBusinessLogic, RoomBusinessLogic, FacultyBusinessLogic } from './businessLogic';

class RealTimeEngine {
  constructor() {
    this.subscribers = new Map();
    this.cache = new Map();
    this.updateInterval = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.updateInterval = setInterval(() => this.processUpdates(), 5000);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    
    // Return cached data immediately if available
    if (this.cache.has(key)) {
      callback(this.cache.get(key));
    }
  }

  unsubscribe(key, callback) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).delete(callback);
    }
  }

  async processUpdates() {
    const updates = await this.fetchRealTimeData();
    
    Object.entries(updates).forEach(([key, data]) => {
      this.cache.set(key, data);
      if (this.subscribers.has(key)) {
        this.subscribers.get(key).forEach(callback => callback(data));
      }
    });
  }

  async fetchRealTimeData() {
    try {
      const [timetables, rooms, faculty, liveClasses, announcements] = await Promise.allSettled([
        apiService.getAllTimetables(),
        apiService.getAllRooms(),
        apiService.getAllFaculty(),
        apiService.getLiveClasses(),
        apiService.getAnnouncements()
      ]);

      const currentTime = new Date();
      const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
      const currentSlot = TimetableBusinessLogic.getCurrentTimeSlot();

      return {
        dashboard: this.processDashboardData(timetables.value, rooms.value, faculty.value, liveClasses.value),
        timetables: this.processTimetableData(timetables.value, currentDay, currentSlot),
        rooms: this.processRoomData(rooms.value, timetables.value, currentTime),
        faculty: this.processFacultyData(faculty.value, timetables.value, currentDay, currentSlot),
        announcements: Array.isArray(announcements.value) ? announcements.value : (announcements.value?.data || []),
        liveClasses: liveClasses.value || []
      };
    } catch (error) {
      console.error('Real-time data fetch error:', error);
      return {};
    }
  }

  processDashboardData(timetables, rooms, faculty, liveClasses) {
    const totalRooms = rooms?.length || 0;
    const occupiedRooms = liveClasses?.length || 0;
    
    return {
      stats: {
        sections: timetables?.length || 0,
        rooms: totalRooms,
        faculty: faculty?.length || 0,
        occupancyRate: RoomBusinessLogic.calculateOccupancyRate(totalRooms, occupiedRooms)
      },
      liveClasses: liveClasses || [],
      currentTimeSlot: TimetableBusinessLogic.getCurrentTimeSlot(),
      isWorkingDay: TimetableBusinessLogic.isWorkingDay()
    };
  }

  processTimetableData(timetables, currentDay, currentSlot) {
    return (timetables || []).map(timetable => ({
      ...timetable,
      currentClass: this.getCurrentClass(timetable, currentDay, currentSlot),
      nextClass: this.getNextClass(timetable, currentDay, currentSlot),
      conflicts: this.detectConflicts(timetable)
    }));
  }

  processRoomData(rooms, timetables, currentTime) {
    return (rooms || []).map(room => {
      const utilization = RoomBusinessLogic.calculateRoomUtilization(room);
      const status = this.getRoomCurrentStatus(room, timetables, currentTime);
      
      return {
        ...room,
        utilization,
        status: status.status,
        currentClass: status.currentClass,
        nextClass: status.nextClass,
        availability: this.calculateRoomAvailability(room, timetables)
      };
    });
  }

  processFacultyData(faculty, timetables, currentDay, currentSlot) {
    // Handle case where faculty is an object with data property
    const facultyArray = Array.isArray(faculty) ? faculty : (faculty?.data || []);
    
    return facultyArray.map(facultyMember => {
      const workload = FacultyBusinessLogic.calculateWorkload(facultyMember, timetables || []);
      const conflicts = FacultyBusinessLogic.getFacultyScheduleConflicts(facultyMember, timetables || []);
      const isAvailable = FacultyBusinessLogic.getFacultyAvailability(facultyMember, currentDay, currentSlot, timetables || []);
      
      return {
        ...facultyMember,
        workload,
        conflicts,
        status: isAvailable ? 'available' : 'teaching',
        currentLocation: this.getFacultyLocation(facultyMember, timetables, currentDay, currentSlot)
      };
    });
  }

  getCurrentClass(timetable, day, timeSlot) {
    if (!timetable.schedule?.[day]?.[timeSlot]) return null;
    
    const subject = timetable.schedule[day][timeSlot];
    if (!subject || subject === 'BREAK') return null;
    
    return {
      subject,
      faculty: timetable.faculty?.[subject] || 'TBA',
      section: timetable.section,
      room: timetable.roomNumber,
      timeSlot
    };
  }

  getNextClass(timetable, day, currentSlot) {
    if (!timetable.schedule?.[day]) return null;
    
    const timeSlots = Object.keys(timetable.schedule[day]).sort();
    const currentIndex = timeSlots.indexOf(currentSlot);
    
    for (let i = currentIndex + 1; i < timeSlots.length; i++) {
      const slot = timeSlots[i];
      const subject = timetable.schedule[day][slot];
      
      if (subject && subject !== 'BREAK') {
        return {
          subject,
          faculty: timetable.faculty?.[subject] || 'TBA',
          timeSlot: slot
        };
      }
    }
    
    return null;
  }

  getRoomCurrentStatus(room, timetables, currentTime) {
    const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentSlot = TimetableBusinessLogic.getCurrentTimeSlot();
    
    if (!currentSlot) return { status: 'available', currentClass: null, nextClass: null };
    
    const timetable = (timetables || []).find(t => t.roomNumber === room.roomNumber);
    if (!timetable) return { status: 'available', currentClass: null, nextClass: null };
    
    const currentClass = this.getCurrentClass(timetable, currentDay, currentSlot);
    const nextClass = this.getNextClass(timetable, currentDay, currentSlot);
    
    return {
      status: currentClass ? 'occupied' : 'available',
      currentClass,
      nextClass
    };
  }

  getFacultyLocation(faculty, timetables, day, timeSlot) {
    if (!timeSlot) return faculty.office || 'Office';
    
    for (const timetable of timetables || []) {
      const subject = timetable.schedule?.[day]?.[timeSlot];
      if (subject && timetable.faculty?.[subject]?.includes(faculty.name)) {
        return timetable.roomNumber;
      }
    }
    
    return faculty.office || 'Office';
  }

  detectConflicts(timetable) {
    const conflicts = [];
    const schedule = timetable.schedule || {};
    
    Object.entries(schedule).forEach(([day, slots]) => {
      Object.entries(slots).forEach(([time, subject]) => {
        if (subject && subject !== 'BREAK') {
          const facultyName = timetable.faculty?.[subject];
          if (facultyName) {
            // Check for faculty conflicts across other timetables
            // This would require access to all timetables
          }
        }
      });
    });
    
    return conflicts;
  }

  calculateRoomAvailability(room, timetables) {
    const timetable = (timetables || []).find(t => t.roomNumber === room.roomNumber);
    if (!timetable) return 100;
    
    let totalSlots = 0;
    let occupiedSlots = 0;
    
    Object.values(timetable.schedule || {}).forEach(daySchedule => {
      Object.values(daySchedule).forEach(subject => {
        totalSlots++;
        if (subject && subject !== 'BREAK') occupiedSlots++;
      });
    });
    
    return totalSlots > 0 ? Math.round(((totalSlots - occupiedSlots) / totalSlots) * 100) : 100;
  }
}

export default new RealTimeEngine();