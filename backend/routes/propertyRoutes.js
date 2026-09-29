import express from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  seedPropertiesEndpoint,
} from '../controllers/propertyController.js';

const router = express.Router();

router.route('/')
  .get(getProperties)
  .post(createProperty);

router.post('/seed', seedPropertiesEndpoint);

router.route('/:id')
  .get(getPropertyById);

export default router;
