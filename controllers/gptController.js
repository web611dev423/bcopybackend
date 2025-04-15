const axios = require('axios');
const { response } = require('express');

const convertCode = async (req, res) => {
  const prompt = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
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
    console.error(err.response?.data || err.message);
    res.status(500).json({
      message: error.message || " message ",
      response: err.response.data || " response",
    });
  }
}

module.exports = { convertCode };