// Serialize initial cookie-setting reads across tabs; a late response must not
// replace the identity already used to save an item in another tab.
export async function privateSessionRead(operation) {
  if (!navigator.locks) {
    throw new Error("Private saves require a current browser over HTTPS.");
  }
  return navigator.locks.request("original-private-session", operation);
}
