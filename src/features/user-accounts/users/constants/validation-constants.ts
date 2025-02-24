export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: new RegExp(/^[a-zA-Z0-9_-]*$/),
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  minLength: 3,
  maxLength: 30,
  match: new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
};
