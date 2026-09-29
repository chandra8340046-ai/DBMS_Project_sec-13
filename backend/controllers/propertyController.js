import Property from '../models/Property.js';
import { sampleProperties } from '../seed/seedData.js';
import { isDbConnected } from '../config/db.js';

// In-memory fallback storage when MongoDB is not connected
let memoryProperties = sampleProperties.map((p, idx) => ({
  ...p,
  _id: `prop_mem_${idx + 1}`,
  createdAt: new Date().toISOString(),
}));

// @desc    Get all properties with filtering and search
// @route   GET /api/properties
export const getProperties = async (req, res) => {
  try {
    const {
      search,
      location,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      sort,
    } = req.query;

    // IF MONGODB IS CONNECTED, QUERY MONGODB
    if (isDbConnected()) {
      try {
        const query = {};

        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } },
          ];
        }

        if (location && location.trim() !== '') {
          query.location = { $regex: location.trim(), $options: 'i' };
        }

        if (propertyType && propertyType !== 'All' && propertyType !== 'all') {
          query.propertyType = { $regex: new RegExp(`^${propertyType}$`, 'i') };
        }

        if (listingType && listingType !== 'All' && listingType !== 'all') {
          const mappedListing = listingType.toLowerCase() === 'buy' ? 'Sale' : listingType;
          query.listingType = { $regex: new RegExp(`^${mappedListing}$`, 'i') };
        }

        if (minPrice || maxPrice) {
          query.price = {};
          if (minPrice) query.price.$gte = Number(minPrice);
          if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (bedrooms) {
          query.bedrooms = { $gte: Number(bedrooms) };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'area_desc') sortOption = { areaSqft: -1 };

        let properties = await Property.find(query).sort(sortOption);

        if (properties.length === 0 && Object.keys(req.query).length === 0) {
          properties = await Property.insertMany(sampleProperties);
        }

        return res.json({
          success: true,
          count: properties.length,
          source: 'mongodb',
          data: properties,
        });
      } catch (dbErr) {
        console.warn('MongoDB query issue, falling back to memory store:', dbErr.message);
      }
    }

    // FALLBACK: IN-MEMORY QUERY (GUARANTEED NO CRASH / 100% RELIABLE)
    let filtered = [...memoryProperties];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(s) ||
          p.location?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s)
      );
    }

    if (location && location.trim() !== '') {
      const loc = location.trim().toLowerCase();
      filtered = filtered.filter((p) => p.location?.toLowerCase().includes(loc));
    }

    if (propertyType && propertyType !== 'All' && propertyType !== 'all') {
      filtered = filtered.filter(
        (p) => p.propertyType?.toLowerCase() === propertyType.toLowerCase()
      );
    }

    if (listingType && listingType !== 'All' && listingType !== 'all') {
      const target = listingType.toLowerCase() === 'buy' ? 'sale' : listingType.toLowerCase();
      filtered = filtered.filter((p) => p.listingType?.toLowerCase() === target);
    }

    if (minPrice) filtered = filtered.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    if (bedrooms) filtered = filtered.filter((p) => p.bedrooms >= Number(bedrooms));

    if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({
      success: true,
      count: filtered.length,
      source: 'in-memory-fallback',
      data: filtered,
    });
  } catch (error) {
    console.error('Error in getProperties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message,
    });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
export const getPropertyById = async (req, res) => {
  try {
    const id = req.params.id;

    if (isDbConnected()) {
      try {
        const property = await Property.findById(id);
        if (property) {
          return res.json({ success: true, data: property });
        }
      } catch (e) {
        // Continue to memory check
      }
    }

    const property = memoryProperties.find((p) => p._id === id || p._id?.toString() === id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching property details',
      error: error.message,
    });
  }
};

// @desc    Create a new property
// @route   POST /api/properties
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      listingType,
      price,
      priceFormatted,
      location,
      city,
      bedrooms,
      bathrooms,
      areaSqft,
      primaryImage,
      amenities,
      agentName,
      agentPhone,
    } = req.body;

    if (!title || !description || !price || !location || !areaSqft) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, price, location, and areaSqft.',
      });
    }

    let formattedPrice = priceFormatted;
    if (!formattedPrice) {
      const numPrice = Number(price);
      if (numPrice >= 10000000) {
        formattedPrice = `₹${(numPrice / 10000000).toFixed(2)} Cr`;
      } else if (numPrice >= 100000) {
        formattedPrice = `₹${(numPrice / 100000).toFixed(1)} Lakhs`;
      } else {
        formattedPrice = `₹${numPrice.toLocaleString('en-IN')}`;
      }
    }

    const parsedAmenities = Array.isArray(amenities)
      ? amenities
      : typeof amenities === 'string'
      ? amenities.split(',').map((a) => a.trim()).filter(Boolean)
      : ['Power Backup', 'Security', 'Parking'];

    const propData = {
      title,
      description,
      propertyType: propertyType || 'Apartment',
      listingType: listingType || 'Sale',
      price: Number(price),
      priceFormatted: formattedPrice,
      location,
      city: city || 'Hyderabad',
      bedrooms: bedrooms ? Number(bedrooms) : 2,
      bathrooms: bathrooms ? Number(bathrooms) : 2,
      areaSqft: Number(areaSqft),
      primaryImage: primaryImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      images: [primaryImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      amenities: parsedAmenities,
      agentName: agentName || 'EstateX Advisory Partner',
      agentPhone: agentPhone || '+91 98765 43210',
      featured: false,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    let savedProperty;

    // Save to MongoDB if connected
    if (isDbConnected()) {
      try {
        savedProperty = await Property.create(propData);
      } catch (err) {
        console.warn('MongoDB save failed, using memory:', err.message);
      }
    }

    // Always maintain in memory store for instant responsiveness
    if (!savedProperty) {
      savedProperty = {
        ...propData,
        _id: `prop_mem_${Date.now()}`,
      };
    }

    memoryProperties.unshift(savedProperty);

    res.status(201).json({
      success: true,
      message: isDbConnected()
        ? 'Property created successfully in MongoDB'
        : 'Property saved successfully (In-Memory)',
      data: savedProperty,
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: error.message,
    });
  }
};

// @desc    Seed or reset properties in MongoDB
// @route   POST /api/properties/seed
export const seedPropertiesEndpoint = async (req, res) => {
  try {
    memoryProperties = sampleProperties.map((p, idx) => ({
      ...p,
      _id: `prop_mem_${idx + 1}`,
      createdAt: new Date().toISOString(),
    }));

    if (isDbConnected()) {
      await Property.deleteMany({});
      await Property.insertMany(sampleProperties);
    }

    res.json({
      success: true,
      message: `Successfully seeded ${sampleProperties.length} properties!`,
      data: memoryProperties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Seeding failed',
      error: error.message,
    });
  }
};
