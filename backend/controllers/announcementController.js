const Announcement = require('../models/Announcement');

const getAllAnnouncements = async (req, res) => {
  try {
    const { section, active = true } = req.query;
    
    let query = { isActive: active };
    if (section) {
      query.$or = [
        { targetSections: { $in: [section] } },
        { targetSections: { $size: 0 } }
      ];
    }

    const announcements = await Announcement.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);
    
    if (announcements.length === 0) {
      return res.json({ message: 'No announcements found', data: [] });
    }
    
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    
    // Emit real-time update
    req.app.get('io').emit('announcementCreated', announcement);
    
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Emit real-time update
    req.app.get('io').emit('announcementUpdated', announcement);
    
    res.json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Emit real-time update
    req.app.get('io').emit('announcementDeleted', { id: req.params.id });
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};