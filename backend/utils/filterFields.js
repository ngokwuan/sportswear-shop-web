export const filterFields = (fields) => {
  Object.keys(fields).forEach((key) => {
    if (
      fields[key] === undefined ||
      fields[key] === null ||
      fields[key] === ''
    ) {
      delete fields[key];
    }
  });
  return fields;
};
