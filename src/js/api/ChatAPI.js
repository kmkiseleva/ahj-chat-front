import createRequest from './createRequest';

export default class ChatAPI {
  create(data, callback) {
    const options = {
      method: 'POST',
      query: '/newuser',
      data,
      callback,
    };
    return createRequest(options);
  }
}
