// Simple socket service implementation without socket.io-client dependency
class SocketService {
  constructor() {
    this.connected = false;
    this.listeners = {};
    this.reconnectInterval = null;
  }

  connect() {
    // Simulate connection
    setTimeout(() => {
      this.connected = true;
      this.emit('connect');
      console.log('Socket connected (simulated)');
    }, 1000);

    // Simulate periodic updates
    this.reconnectInterval = setInterval(() => {
      if (this.connected) {
        this.emit('timetableUpdated', { timestamp: new Date() });
      }
    }, 30000);
  }

  disconnect() {
    this.connected = false;
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
    this.emit('disconnect');
    console.log('Socket disconnected');
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Socket event error:', error);
        }
      });
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new SocketService();