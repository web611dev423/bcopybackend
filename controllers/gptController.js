const axios = require('axios');
const { response } = require('express');

const convertCode = async (req, res) => {
  const prompt = req.body;
  try {
    require('dotenv').config();
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const code = response.data.choices[0].message.content;
    res.status(200).json({ code });
  } catch (err) {
    const errorData = err.response?.data || err.message || err;
    console.error('OpenAI API Error:', errorData);
    res.status(500).json({
      message: 'Something went wrong',
      error: errorData,
    });
  }
}

module.exports = { convertCode };