export const genUsername = (): string => {
  const userNamePrefix = 'user-';
  const randomChars = Math.random().toString(36).slice(2);

  const username = userNamePrefix + randomChars;
  return username;
};
