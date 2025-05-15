const {Word} = require('../models/Word');

// get all Word items: controller function
exports.getWords = async (req, res) => {
  try {
    const words = await Word.find();
    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create a new Word item: controller function
exports.createWord = async (req, res) => {
  try {
    const word = req.body;
    const newWord = new Word(word);
    await newWord.save();
    res.status(201).json(newWord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete a Word item: controller function
// URI: /Words/:_id
exports.deleteWord = async (req, res) => {
  try {
    const wordId = req.params._id;
    await Word.findByIdAndDelete(wordId);
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};