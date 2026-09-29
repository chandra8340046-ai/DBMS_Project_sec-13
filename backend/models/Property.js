import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a property title'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    propertyType: {
      type: String,
      required: [true, 'Please select property type'],
      enum: ['Apartment', 'Villa', 'House', 'Plot', 'Commercial', 'Flat'],
      default: 'Apartment',
    },
    listingType: {
      type: String,
      required: [true, 'Please select listing type'],
      enum: ['Sale', 'Rent', 'Buy'],
      default: 'Sale',
    },
    price: {
      type: Number,
      required: [true, 'Please provide the price in INR'],
    },
    priceFormatted: {
      type: String, // e.g. "₹1.8 Cr" or "₹85 Lakhs"
    },
    location: {
      type: String,
      required: [true, 'Please specify the neighborhood / location'],
      trim: true,
    },
    city: {
      type: String,
      default: 'Hyderabad',
      trim: true,
    },
    bedrooms: {
      type: Number,
      default: 2,
    },
    bathrooms: {
      type: Number,
      default: 2,
    },
    areaSqft: {
      type: Number,
      required: [true, 'Please provide the area in sq.ft'],
    },
    status: {
      type: String,
      enum: ['Available', 'Sold', 'Rented'],
      default: 'Available',
    },
    images: {
      type: [String],
      default: [],
    },
    primaryImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    },
    amenities: {
      type: [String],
      default: ['Power Backup', 'Security', 'Parking'],
    },
    virtualTourUrl: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    agentName: {
      type: String,
      default: 'EstateX Premier Advisory',
    },
    agentPhone: {
      type: String,
      default: '+91 98765 43210',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
propertySchema.index({ title: 'text', location: 'text', city: 'text', description: 'text' });

export const Property = mongoose.model('Property', propertySchema);
export default Property;
