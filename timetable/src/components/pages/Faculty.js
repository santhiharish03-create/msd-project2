import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaPhone, FaUser, FaBook, FaClock, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import './Faculty.css';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subjects: []
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await apiService.getAllFaculty();
      setFaculty(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast.error('Failed to load faculty data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required');
      return;
    }

    try {
      if (editingFaculty) {
        await apiService.updateFaculty(editingFaculty._id, formData);
        toast.success('Faculty updated successfully');
      } else {
        await apiService.createFaculty(formData);
        toast.success('Faculty created successfully');
      }
      
      fetchFaculty();
      resetForm();
    } catch (error) {
      toast.error('Failed to save faculty');
    }
  };

  const handleEdit = (facultyMember) => {
    setEditingFaculty(facultyMember);
    setFormData({
      name: facultyMember.name,
      phone: facultyMember.phone,
      subjects: facultyMember.subjects || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    
    try {
      await apiService.deleteFaculty(id);
      toast.success('Faculty deleted successfully');
      fetchFaculty();
    } catch (error) {
      toast.error('Failed to delete faculty');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', subjects: [] });
    setEditingFaculty(null);
    setShowModal(false);
  };

  const addSubject = () => {
    const subject = prompt('Enter subject name:');
    if (subject && !formData.subjects.includes(subject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subject]
      });
    }
  };

  const removeSubject = (index) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index)
    });
  };

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.subjects || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="loading">Loading faculty data...</div>;
  }

  return (
    <div className="faculty-container">
      <div className="faculty-header">
        <h1>Faculty Management</h1>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {user?.role === 'admin' && (
            <button className="add-btn" onClick={() => setShowModal(true)}>
              <FaPlus /> Add Faculty
            </button>
          )}
        </div>
      </div>

      <div className="faculty-grid">
        {filteredFaculty.map((facultyMember) => (
          <div key={facultyMember._id} className="faculty-card">
            <div className="faculty-info">
              <h3><FaUser /> {facultyMember.name}</h3>
              <p><FaPhone /> {facultyMember.phone}</p>
              <div className="subjects">
                <FaBook /> Subjects:
                {(facultyMember.subjects || []).map((subject, index) => (
                  <span key={index} className="subject-tag">{subject}</span>
                ))}
              </div>
            </div>
            {user?.role === 'admin' && (
              <div className="faculty-actions">
                <button onClick={() => handleEdit(facultyMember)} className="edit-btn">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(facultyMember._id)} className="delete-btn">
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingFaculty ? 'Edit Faculty' : 'Add Faculty'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Subjects</label>
                <div className="subjects-list">
                  {formData.subjects.map((subject, index) => (
                    <span key={index} className="subject-item">
                      {subject}
                      <button type="button" onClick={() => removeSubject(index)}>×</button>
                    </span>
                  ))}
                  <button type="button" onClick={addSubject} className="add-subject-btn">
                    + Add Subject
                  </button>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={resetForm}>Cancel</button>
                <button type="submit">{editingFaculty ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;