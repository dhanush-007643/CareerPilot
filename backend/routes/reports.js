const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.use(protect);
router.use(authorize('admin'));

router.get('/', reportController.getReports);
router.put('/:id', reportController.resolveReport);

module.exports = router;
