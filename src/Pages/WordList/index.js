import ErrorDisplay from "../../component/ErrorDisplay";
import List from "./List";

// task 4: style the single input-field form

const WordList = () => {
  return (
    <div>
      <div
        style={{
          fontSize: "4rem",
          lineHeight: "4rem",
          fontWeight: "bold",
        }}
      >
        Saved Words
      </div>
      <div>
        <ErrorDisplay pageKey="word-list" />
        <List />
      </div>
    </div>
  );
};

export default WordList;
