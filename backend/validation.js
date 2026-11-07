function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  error.publicMessage = message;
  throw error;
}
function object(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    invalid("Expected an object.");
  return value;
}
function text(value, max, label) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.trim().length > max ||
    /[\x00-\x1f\x7f]/.test(value)
  )
    invalid(`Invalid ${label}.`);
  return value.trim();
}
function validateId(id) {
  return text(id, 128, "word");
}
function validateCreate(body) {
  object(body);
  const word = text(body.word, 128, "word");
  if (body._id !== undefined && body._id !== word)
    invalid("Word and identifier must match.");
  return { id: word, data: { word } };
}
function validateUpdate(body) {
  return validateCreate(body);
}
module.exports = { validateCreate, validateUpdate, validateId };
