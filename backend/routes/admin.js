const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Auth Route (Public)
router.post('/login', adminController.loginAdmin);

router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Profile Routes
router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);
router.put('/change-password', adminController.changePassword);

router.get('/freshers', adminController.getAllFreshers);
router.put('/freshers/:id/block', adminController.blockUser);
router.delete('/freshers/:id', adminController.deleteUser);

router.get('/companies', adminController.getCompanies);
router.put('/companies/:id/approve', adminController.approveCompany);
router.put('/companies/:id/reject', adminController.rejectCompany);
router.put('/companies/:id/block', adminController.blockUser); // Can reuse blockUser
router.delete('/companies/:id', adminController.deleteUser); // Can reuse deleteUser

router.get('/jobs', adminController.getJobs);
// additional job admin routes can go here

router.get('/applications', adminController.getApplications);
router.put('/applications/status', adminController.updateApplicationStatus);

router.route('/assessments')
  .get(adminController.getAssessments)
  .post(adminController.createAssessment);
router.delete('/assessments/:id', adminController.deleteAssessment);

router.get('/certificates', adminController.getCertificates);

router.get('/interviews', adminController.getInterviews);

module.exports = router;
