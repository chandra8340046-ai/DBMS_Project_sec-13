import express from 'express';
import { createEnquiry, getEnquiries } from '../controllers/enquiryController.js';

const router = express.Router();

router.route('/')
  .post(createEnquiry)
  .get(getEnquiries);

export default router;
