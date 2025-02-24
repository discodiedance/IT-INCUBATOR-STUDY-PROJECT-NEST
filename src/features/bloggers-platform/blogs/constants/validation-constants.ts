export const blogNameConstraints = {
  maxLength: 15,
};

export const blogDescriptionConstraints = {
  maxLength: 500,
};

export const blogWebsiteUrlConstraints = {
  maxLength: 100,
  match: new RegExp(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  ),
};
