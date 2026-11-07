import { SlActionRedo } from "react-icons/sl";
import { Link } from "react-router-dom";
import { TiDeleteOutline } from "react-icons/ti";
import { Color } from "../../constant/Color";
import useWordContext from "../../hook/useWordContext";
import { useState, useRef } from "react";
import useErrorContext from "../../hook/useErrorContext";

// task 1: functioning direction button
// task 2: functioning delete button
// task 3: double click the word to show the corresponding form
// task 4: implement all the functions of the form

const Row = ({ word, index }) => {
  const { deleteWord, updateWord } = useWordContext();
  const { reportErrors } = useErrorContext();

  // state variable that checks if we are in the editing mode
  const [isEditing, setIsEditing] = useState(false);
  // function that flips the isEditingState
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // state variable that stores the value of the input field
  const [inputValue, setInputValue] = useState(word);
  // function that updates the inputValue state
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleDelete = async () => {
    try {
      await deleteWord(word);
    } catch (error) {
      // error is an object, it has a few different fields such as message, name ,etc.
      reportErrors("word-list", error.message);
    }
  };

  const submitting = useRef(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;

    const trimmedValue = inputValue.trim();

    if (trimmedValue === "") {
      setIsEditing(false);
      return;
    }

    submitting.current = true;
    try {
      await updateWord(word, trimmedValue);
      setIsEditing(false);
    } catch {
      reportErrors(
        "word-list",
        "Could not rename this word. The original is still saved.",
      );
    } finally {
      submitting.current = false;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        padding: "2rem",
        width: "50vw",
        borderTop: index === 0 ? `1px solid ${Color.borderColor}` : "none",
        borderBottom: `1px solid ${Color.borderColor}`,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              aria-label="Rename saved word"
              value={inputValue}
              onChange={handleChange}
              onBlur={handleSubmit}
              autoFocus
              style={{
                fontSize: "1.2rem",
                lineHeight: "1.2rem",
                BorderColor: Color.accent,
                borderRadius: 5,
                borderWidth: 1,
                outline: "none",
                padding: 5,
              }}
            />
          </form>
        ) : (
          <div
            style={{ fontSize: "1.2rem", lineHeight: "1.2rem" }}
            role="button"
            tabIndex={0}
            aria-label={`Rename ${word}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDoubleClick();
              }
            }}
            onDoubleClick={handleDoubleClick}
          >
            {word}
          </div>
        )}

        <div>
          <Link
            aria-label={`Look up ${word}`}
            to={`/?word=${encodeURIComponent(word)}`}
            style={{
              textDecoration: "none",
              color: Color.primaryText,
            }}
          >
            <SlActionRedo />
          </Link>
        </div>
      </div>

      <div>
        <button
          type="button"
          className="icon-button"
          aria-label={`Delete ${word}`}
          onClick={handleDelete}
        >
          <TiDeleteOutline size={25} color={Color.accent} />
        </button>
      </div>
    </div>
  );
};

export default Row;
