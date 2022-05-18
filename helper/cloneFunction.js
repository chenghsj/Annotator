function cloneObject(value) {
  let newObject;
  if (value && typeof value === "object" && Object.keys(value).length > 0) {
    newObject = {};
    for (let key in value) {
      if (typeof value[key] === "object") {
        newObject[key] = Array.isArray(value) ? this.cloneArray(value[key]) : this.cloneObject(value[key]);
      } else {
        newObject[key] = value[key];
      }
    }
  } else if (value && typeof value === "object" && Object.keys(value).length === 0) {
    newObject = {};
  } else if (value === null) {
    newObject = null;
  }
  return newObject;
}

export { cloneObject };
