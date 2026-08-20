const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const auth = require('../middleware/auth');

router.use(auth); // Protect all subject routes

router.get('/', subjectController.getSubjects);
router.post('/', subjectController.createSubject);
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;
