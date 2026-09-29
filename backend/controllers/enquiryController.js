import Enquiry from '../models/Enquiry.js';
import Property from '../models/Property.js';
import { isDbConnected } from '../config/db.js';

let memoryEnquiries = [];

// @desc    Submit a new enquiry for a property
// @route   POST /api/enquiries
export const createEnquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    if (!propertyId || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide property ID, name, email, and phone number.',
      });
    }

    const enquiryRecord = {
      property: propertyId,
      name,
      email,
      phone,
      message: message || 'I am interested in this property and would like to schedule a visit.',
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    let savedEnquiry;

    if (isDbConnected()) {
      try {
        const prop = await Property.findById(propertyId);
        savedEnquiry = await Enquiry.create({
          ...enquiryRecord,
          propertyTitle: prop?.title || 'EstateX Listing',
        });
      } catch (err) {
        console.warn('MongoDB enquiry save failed, saving to memory:', err.message);
      }
    }

    if (!savedEnquiry) {
      savedEnquiry = {
        ...enquiryRecord,
        _id: `enq_mem_${Date.now()}`,
      };
    }

    memoryEnquiries.unshift(savedEnquiry);

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! An advisory specialist will contact you shortly.',
      data: savedEnquiry,
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry',
      error: error.message,
    });
  }
};

// @desc    Get all enquiries
// @route   GET /api/enquiries
export const getEnquiries = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const enquiries = await Enquiry.find().populate('property', 'title price location').sort({ createdAt: -1 });
        return res.json({
          success: true,
          count: enquiries.length,
          data: enquiries,
        });
      } catch (err) {
        // Fall back to memory
      }
    }

    res.json({
      success: true,
      count: memoryEnquiries.length,
      data: memoryEnquiries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries',
      error: error.message,
    });
  }
};
