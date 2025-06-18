const express = require('express');
const router = express.Router();
const peopleController = require('../controllers/peopleController');

// GET /api/people - List all people
router.get('/', peopleController.getAllPeople);

// GET /api/people/:name - Get person by name
router.get('/:name', peopleController.getPersonByName);

module.exports = router;