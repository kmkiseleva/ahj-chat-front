import ChatAPI from './api/ChatAPI';

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
  }

  init() {
    this.registerEvents();
  }

  registerEvents() {
    this.modalInput.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        const newUser = {
          name: this.modalInput.value,
        };
        this.onEnterChat(newUser);
      }
    });
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        this.sendMessage();
      }
    });
  }

  get userListContainer() {
    return this.container.querySelector('.chat__users');
  }

  get modalForm() {
    return document.querySelector('.modal__form');
  }

  get modalInput() {
    return document.querySelector('.modal__form .form__input');
  }

  get inputElement() {
    return document.querySelector('.form__input');
  }

  get connectButton() {
    return this.container.querySelector('.chat__start');
  }

  get messageContainer() {
    return this.container.querySelector('chat__messages-container');
  }

  async onEnterChat(newUser) {
    const response = await this.api.create(newUser);
    if (response.status === 'ok') {
      this.modalForm.classList.add('hidden');
      this.user = response.user;
      this.websocket = new WebSocket('ws://ahj-chat-back.herokuapp.com/chat');
      this.websocket.addEventListener('message', (event) => this.renderMessage(event));
      window.addEventListener('beforeunload', () =>
        this.websocket.send(
          JSON.stringify({
            type: 'exit',
            user: this.user,
          })
        )
      );
    } else {
      console.log('Already Ex');
    }
  }

  sendMessage() {
    const { value } = this.inputElement;
    this.websocket.send(JSON.stringify({ type: 'send', message: value, user: this.user }));
    this.inputElement.value = '';
  }

  renderMessage(event) {
    const receivedData = JSON.parse(event.data);
    if (Array.isArray(receivedData)) {
      this.userListContainer.textContent = '';
      receivedData.forEach((user) => {
        console.log(user);
      });
    }
  }
}
