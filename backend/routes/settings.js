const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(settingsController.getSettings)
  .put(settingsController.updateSettings);

module.exports = router;
