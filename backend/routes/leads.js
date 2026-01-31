const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

// @route   GET /api/leads
// @desc    Get all leads with filtering and search
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, search, source, sort = '-createdAt' } = req.query;
    
    // Build query
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by source
    if (source) {
      query.source = source;
    }

    // Search by name, email, or company
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(query)
      .sort(sort)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching leads' 
    });
  }
});

// @route   GET /api/leads/analytics
// @desc    Get analytics data
// @access  Private
router.get('/analytics', async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const contactedLeads = await Lead.countDocuments({ status: 'contacted' });
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });
    
    // Calculate conversion rate
    const conversionRate = totalLeads > 0 
      ? ((convertedLeads / totalLeads) * 100).toFixed(2) 
      : 0;

    // Get leads by source
    const leadsBySource = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get leads by status
    const leadsByStatus = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent leads (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLeads = await Lead.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        contactedLeads,
        convertedLeads,
        conversionRate: parseFloat(conversionRate),
        recentLeads,
        leadsBySource,
        leadsByStatus
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching analytics' 
    });
  }
});

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('notes.createdBy', 'name email');

    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching lead' 
    });
  }
});

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('source').optional().isIn(['Website', 'Referral', 'Social Media', 'Email Campaign', 'Other'])
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const leadData = {
      ...req.body,
      createdBy: req.user.id
    };

    const lead = await Lead.create(leadData);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating lead' 
    });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update a lead
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    // Update lead
    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating lead' 
    });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    await lead.deleteOne();

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting lead' 
    });
  }
});

// @route   POST /api/leads/:id/notes
// @desc    Add a note to a lead
// @access  Private
router.post('/:id/notes', [
  body('content').notEmpty().trim().withMessage('Note content is required')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    // Add note
    lead.notes.push({
      content: req.body.content,
      createdBy: req.user.id
    });

    await lead.save();

    // Populate the newly added note
    await lead.populate('notes.createdBy', 'name email');

    res.json({
      success: true,
      message: 'Note added successfully',
      data: lead
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding note' 
    });
  }
});

module.exports = router;
