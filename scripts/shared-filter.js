const state = {};
 
export function setSharedData(key, value) {
  state[key] = value;
}
 
export function getSharedData(key) {
  return state[key];
}