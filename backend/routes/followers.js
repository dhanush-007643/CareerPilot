const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  followCompany,
  unfollowCompany,
  getFollowedCompanies,
  getCompanyFollowers
} = require('../controllers/followController');

router.post('/follow', protect, followCompany);
router.delete('/unfollow/:companyId', protect, unfollowCompany);
router.get('/my-followed-companies', protect, getFollowedCompanies);
router.get('/company-followers', protect, getCompanyFollowers);
router.get('/company-followers/:companyId', protect, getCompanyFollowers);

module.exports = router;
