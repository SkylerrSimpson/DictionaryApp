import { useContext, useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import { WordProvider, WordContext } from "./context/WordContext";
import { ErrorProvider } from "./context/ErrorContext";
jest.mock("axios", () => {
  const api = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
  api.create = () => api;
  return { __esModule: true, default: api };
});
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: { request: (_, operation) => operation() },
  });
});
function SavedWordsHarness() {
  const { words, updateWord } = useContext(WordContext);
  const [failed, setFailed] = useState(false);
  return (
    <>
      <ul>
        {words.map((word) => (
          <li key={word._id}>{word.word}</li>
        ))}
      </ul>
      <button
        onClick={() =>
          updateWord("hello", "world").catch(() => setFailed(true))
        }
      >
        Rename
      </button>
      {failed && <p role="alert">Rename failed</p>}
    </>
  );
}
test("a failed atomic rename preserves the saved word without a destructive delete", async () => {
  axios.get.mockResolvedValue({ data: [{ _id: "hello", word: "hello" }] });
  axios.patch.mockRejectedValue(new Error("duplicate"));
  render(
    <ErrorProvider>
      <WordProvider>
        <SavedWordsHarness />
      </WordProvider>
    </ErrorProvider>,
  );
  expect(await screen.findByText("hello")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Rename" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Rename failed");
  expect(screen.getByText("hello")).toBeInTheDocument();
  expect(axios.patch).toHaveBeenCalledWith("/words/hello", {
    _id: "world",
    word: "world",
  });
  expect(axios.delete).not.toHaveBeenCalled();
});
