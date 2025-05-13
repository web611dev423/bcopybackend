const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/quizzes/:id', quizController.getQuiz);
router.post('/quizzes', quizController.createQuiz);
router.get('/quizzes', quizController.getQuizzes);
router.get('/invitations', quizController.getInvitations);

router.post('/submit', quizController.submitResult);
router.get('/results', quizController.getResults);

router.get('/userlist', quizController.getQuizScorerList);

module.exports = router;