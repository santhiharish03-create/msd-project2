import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001');
      
      this.socket.on('connect', () => {
        console.log('Connected to real-time server');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from real-time server');
        this.connected = false;
      });
    }
    return this.socket;
  }

  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

export default new SocketService();