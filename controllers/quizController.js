const axios = require('axios');
const Quiz = require('../models/quizModel');
const User = require('../models/userModel');

// OpenTDB API client
const fetchTriviaQuestions = async (
  amount,
  category,
  difficulty,
  type
) => {
  let url = `https://opentdb.com/api.php?amount=${amount}`;

  if (category) url += `&category=${category}`;
  if (difficulty && difficulty != "anyDifficulty") url += `&difficulty=${difficulty}`;
  if (type && type != "anyType") url += `&type=${type}`;

  try {
    const response = await axios.get(url);

    if (response.data.response_code === 0) {
      // Transform OpenTDB format to our Question format
      return response.data.results.map((q, index) => ({
        id: `${Date.now()}-${index}`,
        category: q.category,
        type: q.type,
        difficulty: q.difficulty,
        question: q.question,
        correct_answer: q.correct_answer,
        incorrect_answers: q.incorrect_answers
      }));
    } else {
      throw new Error(`OpenTDB API error: ${response.data.response_code}`);
    }
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    throw error;
  }
};

exports.createQuiz = async (req, res) => {
  const quiz = req.body;
  try {
    // Fetch trivia questions
    const questions = await fetchTriviaQuestions(
      quiz.amount,
      quiz.category,
      quiz.difficulty,
      quiz.type
    );

    // Add additional quiz properties
    quiz.questions = questions;
    quiz.id = `quiz-${Date.now()}`;
    quiz.createdAt = new Date();
    quiz.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Save the quiz to the database
    const savedQuiz = await new Quiz(quiz).save();

    // Send the response
    res.status(201).json({
      message: "Create Quiz Successfully",
      data: savedQuiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

exports.getQuiz = (req, res) => {
  try {
    Quiz.findById(req.params.id).then((quiz) => {
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      return quiz;
    }
    ).catch((error) => {
      console.error('Error fetching quiz:', error);
      return res.status(500).json({ error: 'Failed to fetch quiz' });
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

exports.getQuizzes = (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      Quiz.find({ creatorId: userId }).sort({ createdAt: -1 }).then((quizzes) => {
        if (!quizzes || quizzes.length === 0) {
          return res.status(404).json({ error: 'No quizzes found for this user' });
        }
        return res.json({
          message: 'Fetched quizzes successfully',
          data: quizzes
        });
      }
      ).catch((error) => {
        console.error('Error fetching quizzes:', error);
        return res.status(500).json({ error: 'Failed to fetch quizzes' });
      });
    }
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

exports.getInvitations = async (req, res) => {
  console.log(req.query);
  const { userId } = req.query;

  try {
    // Find quizzes where participants include the inviteeId
    const quizzes = await Quiz.find({
      participants: {
        $elemMatch: {
          userId: userId,
          status: { $in: ['pending', 'accepted', 'completed'] }
        }
      },
    }).lean();

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ error: 'No quizzes found for this invitee' });
    }

    res.status(200).json({
      message: 'Fetched quizzes successfully',
      data: quizzes,
    });
  } catch (error) {
    console.error('Error fetching quizzes by invitee:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

// Results
exports.submitResult = async (req, res) => {
  const { quizId, userId, score, totalQuestions, startedAt, completedAt, timeElapsedMs } = req.body;

  try {
    // Find the quiz by ID
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Find the participant in the quiz
    const participant = quiz.participants.find(
      (p) => p.userId.toString() === userId
    );

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found in this quiz' });
    }

    // Update the participant's result and status
    participant.result = {
      score,
      totalQuestions,
      startedAt,
      completedAt,
      timeElapsedMs,
    };
    participant.status = 'completed';

    // Save the updated quiz
    await quiz.save();

    // Respond with the updated participant result
    res.status(201).json({
      message: 'Result submitted successfully',
      data: quiz,
    }
    );
  } catch (error) {
    console.error('Error submitting result:', error);
    res.status(500).json({ error: 'Failed to submit result' });
  }
};

exports.getResults = async (req, res) => {
  const { quizId, userId } = req.query;

  try {
    // Find the quiz by ID
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Filter results based on userId if provided
    let results = quiz.participants.map((participant) => ({
      userId: participant.userId,
      result: participant.result,
    }));

    if (userId) {
      results = results.filter((r) => r.userId.toString() === userId);
    }

    // Respond with the filtered results
    res.json(
      {
        message: "fetch result success",
        data: results
      });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

exports.getQuizScorerList = async (req, res) => {
  try {

    const users = await User.find({}).select('name email _id connected quizScore country').lean();

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    res.status(200).json({
      message: 'fetch user list success',
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};