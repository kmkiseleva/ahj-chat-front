import ChatAPI from './api/ChatAPI';
import eventBus from './EventBus';

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
  }

  init() {
    this.registerEvents();
    this.subscribeOnEvents();
  }

  registerEvents() {
    this.modalInput.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        this.sendMessage();
      }
    });
  }

  subscribeOnEvents() {
    eventBus.subscribe('connect-chat', this.onEnterChat, this);
  }

  get modalForm() {
    return document.querySelector('.modal__form');
  }

  get modalInput() {
    return document.querySelector('.modal__input');
  }

  get userListContainer() {
    return this.container.querySelector('.chat__userlist');
  }

  get inputElement() {
    return this.container.querySelector('.form__input');
  }

  get messageContainer() {
    return this.container.querySelector('chat__messages-container');
  }

  async onEnterChat(newUser) {
    const response = await this.api.create(newUser);
    if (response.status === 'ok') {
      this.modalForm.classList.add('hidden');
      this.user = response.user;
      this.websocket = new WebSocket('wss://ahj-chat-back.herokuapp.com/wss');
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
    const { value } = this.modalInput;
    this.websocket.send(JSON.stringify({ type: 'send', message: value, user: this.user }));
    this.modalInput.value = '';
  }

  renderMessage(event) {
    const receivedData = JSON.parse(event.data);
    if (Array.isArray(receivedData)) {
      this.userListContainer.textContent = '';
      receivedData.forEach((user) => {
        console.log(user);
      });
    }
    const sourceDate = new Date();
    const date = `${sourceDate
      .toLocaleTimeString()
      .slice(0, 5)} ${sourceDate.toLocaleDateString()}`;
  }
}
