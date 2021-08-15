const createRequest = async (options) => {
  const baseURL = 'https://ahj-chat-back.herokuapp.com';
  const requestURL = `${baseURL}${options.query}`;
  const request = await fetch(requestURL, {
    method: options.method,
    body: options.data ? JSON.stringify(options.data) : null,
  });
  const response = await request.json();
  if (options.callback) {
    options.callback(response);
  }
  return response;
};

export default createRequest;
