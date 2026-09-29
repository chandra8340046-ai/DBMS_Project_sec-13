import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    propertyTitle: {
      type: String,
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      trim: true,
    },
    message: {
      type: String,
      default: 'I am interested in this property and would like to schedule a visit.',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Closed'],
      default: 'New',
    },
  },
  {
    timestamps: true,
  }
);

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
