const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
    };
    
    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    } else {
      config.headers = {
        ...options.headers,
      };
    }

    try {
      console.log('Making API request to:', url);
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Timetable endpoints
  async getTimetable(section) {
    return this.request(`/timetables/${section}`);
  }

  async getAllTimetables() {
    return this.request('/timetables');
  }

  async getCurrentClass(section) {
    return this.request(`/timetables/${section}/current`);
  }

  async createTimetable(data) {
    return this.request('/timetables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTimetable(section, data) {
    return this.request(`/timetables/${section}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Faculty endpoints
  async getAllFaculty() {
    return this.request('/faculty');
  }

  async getFacultySchedule(name) {
    return this.request(`/faculty/${encodeURIComponent(name)}/schedule`);
  }

  async createFaculty(facultyData) {
    return this.request('/faculty', {
      method: 'POST',
      body: JSON.stringify(facultyData)
    });
  }

  async updateFaculty(id, facultyData) {
    return this.request(`/faculty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(facultyData)
    });
  }

  async deleteFaculty(id) {
    return this.request(`/faculty/${id}`, {
      method: 'DELETE'
    });
  }

  // Room endpoints
  async getAllRooms() {
    return this.request('/rooms');
  }

  async getAvailableRooms(date, startTime, endTime) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    return this.request(`/rooms/available?${params}`);
  }

  async bookRoom(bookingData) {
    return this.request('/rooms/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getAllBookings() {
    return this.request('/rooms/bookings');
  }

  async getRoomSchedule(roomNumber) {
    return this.request(`/rooms/${encodeURIComponent(roomNumber)}/schedule`);
  }

  // Upload endpoints
  async uploadExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/upload/excel', {
      method: 'POST',
      body: formData
    });
  }

  // Authentication endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(token) {
    return this.request('/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Live data endpoints
  async getLiveClasses() {
    return this.request('/timetables/live');
  }

  // Announcement endpoints
  async getAnnouncements(section) {
    const params = section ? `?section=${section}` : '';
    return this.request(`/announcements${params}`);
  }

  async createAnnouncement(data, token) {
    return this.request('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

const apiServiceInstance = new ApiService();
export default apiServiceInstance;