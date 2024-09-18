import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import useErrorContext from '../hook/useErrorContext';

// step 1: create a context instance
// step 2: create a provider component
// step 3: wrap up the app with the provider component
// step 4: access the context value in the child component; create a custom hook

const WordContext = createContext({
  words: [], // represent all words in the database
  addWord: () => {},
  removeWord: () => {}, // only one shared by two pages
  updateWord: () => {},
});

const REACT_APP_API_URL = process.env.REACT_APP_URL;

const WordProvider = ({ children }) => {
  const [words, setWords] = useState([]); // [{ id: 'hello', word: 'hello' }]

  const { reportErrors } = useErrorContext();

  useEffect(() => {
    // purpose 1: fetch all words from the database
    // purpose 2: set the words to the state
    console.log(REACT_APP_API_URL); // check if this logs correctly
    const fetchWords = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/words`);
        const data = response.data;
        setWords(data);
      } catch (error) {
        reportErrors('word-list', error.message);
        reportErrors('home', error.message);
      }
    };
    fetchWords();
  }, []); // [] is second argument

  // purpose 1: add a new word to the database
  // purpose 2: update the words state
  const addWord = async (word) => {
    console.log(REACT_APP_API_URL); // check if this logs correctly

      const response = await axios.post(`${REACT_APP_API_URL}/words`, {
        _id: word,
        word: word,
      });
      const data = response.data;
      setWords([...words, data]);
  };

  // purpose 1: update a word in the database
  // purpose 2: update the words state
  const updateWord = async (oldWord, newWord) => {
      // make a delete request to delete the old word
      await axios.delete(`${REACT_APP_API_URL}/words/${oldWord}`);
      // make a post request to add the new word
      const response = await axios.post(`${REACT_APP_API_URL}/words`, {
        _id: newWord,
        word: newWord,
      });

      const data = response.data;
      const updatedWords = words.map((word) => {
        if (word._id === oldWord) {
          return data;
        }
        return word;
      });
      setWords(updatedWords);
  };

  // delete a word
  // purpose 1: delete a word from the database
  // purpose 2: update the words state
  const deleteWord = async (word) => {
      await axios.delete(`${REACT_APP_API_URL}/words/${word}`);
      const updatedWords = words.filter((w) => w._id !== word);
      setWords(updatedWords);
  };

  return (
    <WordContext.Provider
      value={{ words: words, addWord: addWord, updateWord: updateWord, deleteWord: deleteWord }}
    >
      {children}
    </WordContext.Provider>
  );
};

export { WordContext, WordProvider };
export default WordContext;
