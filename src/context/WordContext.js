import { privateSessionRead } from "../lib/private-session";
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import useErrorContext from "../hook/useErrorContext";

const WordContext = createContext({ words: [] });
// The maintained server serves the original React build and API on one origin.
const api = axios.create({ baseURL: "", withCredentials: true });
let initialRequest;
const loadWords = () =>
  initialRequest ||
  (initialRequest = privateSessionRead(() => api.get("/words")).finally(() => {
    initialRequest = null;
  }));

const WordProvider = ({ children }) => {
  const [words, setWords] = useState([]);
  const { reportErrors } = useErrorContext();
  useEffect(() => {
    let active = true;
    loadWords()
      .then(({ data }) => {
        if (active) setWords(data);
      })
      .catch(() => {
        if (active) {
          reportErrors("word-list", "Could not load saved words.");
          reportErrors("home", "Could not load saved words.");
        }
      });
    return () => {
      active = false;
    };
  }, [reportErrors]);
  const addWord = async (word) => {
    const { data } = await api.post("/words", { _id: word, word });
    setWords((current) => [...current.filter((w) => w._id !== data._id), data]);
  };
  const updateWord = async (oldWord, newWord) => {
    const { data } = await api.patch(`/words/${encodeURIComponent(oldWord)}`, {
      _id: newWord,
      word: newWord,
    });
    setWords((current) =>
      current.map((word) => (word._id === oldWord ? data : word)),
    );
  };
  const deleteWord = async (word) => {
    await api.delete(`/words/${encodeURIComponent(word)}`);
    setWords((current) => current.filter((w) => w._id !== word));
  };
  return (
    <WordContext.Provider value={{ words, addWord, updateWord, deleteWord }}>
      {children}
    </WordContext.Provider>
  );
};
export { WordContext, WordProvider };
export default WordContext;
