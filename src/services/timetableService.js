import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db as firestoreDb, isFirebaseConfigured } from '../lib/firebase';
import { timetableData } from '../data/timetableData';
import apiService from './apiService';

const getLocalTimetable = (section) => {
  const normalizedSection = timetableData.sections[section];
  if (!normalizedSection) {
    return null;
  }

  return {
    section,
    roomNumber: normalizedSection.roomNumber,
    schedule: normalizedSection.schedule,
    faculty: normalizedSection.faculty || timetableData.faculty
  };
};

const getLocalFacultySchedule = (facultyId) => {
  const scheduleEntries = [];

  Object.entries(timetableData.sections).forEach(([section, sectionData]) => {
    Object.entries(sectionData.schedule).forEach(([day, slots]) => {
      Object.entries(slots).forEach(([time, subject]) => {
        if (subject && sectionData.faculty?.[subject]?.includes?.(facultyId)) {
          scheduleEntries.push({
            id: `${section}-${day}-${time}`,
            section,
            day,
            time,
            subject,
            faculty: sectionData.faculty[subject]
          });
        }
      });
    });
  });

  return scheduleEntries;
};

const getLocalRoomSchedule = (roomId) => {
  const foundSection = Object.entries(timetableData.sections).find(([, data]) => data.roomNumber === roomId);
  if (!foundSection) {
    return null;
  }

  const [section, data] = foundSection;
  return {
    roomNumber: data.roomNumber,
    section,
    schedule: data.schedule
  };
};

export const getTimetableData = async (section) => {
  try {
    return await apiService.getTimetable(section);
  } catch (error) {
    console.warn('Backend unavailable, using local data:', error);
    
    if (!isFirebaseConfigured || !firestoreDb) {
      return getLocalTimetable(section);
    }

    try {
      const docRef = doc(firestoreDb, 'timetables', section);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : getLocalTimetable(section);
    } catch (firebaseError) {
      console.error('Firebase error, falling back to local:', firebaseError);
      return getLocalTimetable(section);
    }
  }
};

export const subscribeToTimetable = (section, callback) => {
  if (!isFirebaseConfigured || !firestoreDb) {
    const localTimetable = getLocalTimetable(section);
    callback(localTimetable);
    return () => {};
  }

  const docRef = doc(firestoreDb, 'timetables', section);
  return onSnapshot(docRef, (docSnapshot) => {
    callback(docSnapshot.exists() ? docSnapshot.data() : null);
  });
};

export const getFacultySchedule = async (facultyId) => {
  try {
    return await apiService.getFacultySchedule(facultyId);
  } catch (error) {
    console.warn('Backend unavailable, using local data:', error);
    
    if (!isFirebaseConfigured || !firestoreDb) {
      return getLocalFacultySchedule(facultyId);
    }

    try {
      const q = query(
        collection(firestoreDb, 'schedules'),
        where('facultyId', '==', facultyId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
    } catch (firebaseError) {
      console.error('Firebase error, falling back to local:', firebaseError);
      return getLocalFacultySchedule(facultyId);
    }
  }
};

export const updateTimetable = async (section, data) => {
  try {
    return await apiService.updateTimetable(section, data);
  } catch (error) {
    console.warn('Backend unavailable, trying Firebase:', error);
    
    if (!isFirebaseConfigured || !firestoreDb) {
      console.warn('No backend or Firebase available for updates.');
      return;
    }

    try {
      const docRef = doc(firestoreDb, 'timetables', section);
      await setDoc(docRef, data, { merge: true });
    } catch (firebaseError) {
      console.error('Error updating timetable:', firebaseError);
      throw firebaseError;
    }
  }
};

export const getCurrentClass = async (section) => {
  try {
    return await apiService.getCurrentClass(section);
  } catch (error) {
    console.warn('Backend unavailable for current class:', error);
    return null;
  }
};

export const getAllTimetables = async () => {
  try {
    return await apiService.getAllTimetables();
  } catch (error) {
    console.warn('Backend unavailable for all timetables:', error);
    return Object.keys(timetableData.sections).map(section => ({
      section,
      roomNumber: timetableData.sections[section].roomNumber
    }));
  }
};

export const getAllFaculty = async () => {
  try {
    return await apiService.getAllFaculty();
  } catch (error) {
    console.warn('Backend unavailable for faculty data:', error);
    return Object.entries(timetableData.faculty).map(([subject, name]) => ({
      name,
      subjects: [subject]
    }));
  }
};

export const getAllRooms = async () => {
  try {
    return await apiService.getAllRooms();
  } catch (error) {
    console.warn('Backend unavailable for room data:', error);
    return Object.entries(timetableData.sections).map(([section, data]) => ({
      roomNumber: data.roomNumber,
      section,
      capacity: 60
    }));
  }
};

export const getRoomSchedule = async (roomId) => {
  try {
    return await apiService.getRoomSchedule(roomId);
  } catch (error) {
    console.warn('Backend unavailable, using local data:', error);
    
    if (!isFirebaseConfigured || !firestoreDb) {
      return getLocalRoomSchedule(roomId);
    }

    try {
      const docRef = doc(firestoreDb, 'rooms', roomId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : getLocalRoomSchedule(roomId);
    } catch (firebaseError) {
      console.error('Firebase error, falling back to local:', firebaseError);
      return getLocalRoomSchedule(roomId);
    }
  }
};
