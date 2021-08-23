import ChatAPI from './api/ChatAPI';

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;

    this.userListContainer = document.querySelector('.chat__users');
    this.modalForm = document.querySelector('.modal__form');
    this.modalInput = document.querySelector('.modal__form .form__input');
    this.inputElement = document.querySelector('.form__input');
    this.messageContainer = document.querySelector('.chat__messages-container');
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

  async onEnterChat(newUser) {
    const response = await this.api.create(newUser);
    if (response.status === 'ok') {
      this.modalForm.classList.add('hidden');
      this.user = response.user;
      this.websocket = new WebSocket('wss://ahj-chat-back.herokuapp.com/chat');
      this.websocket.addEventListener('message', (event) => {
        this.renderMessage(event);
      });
      window.addEventListener('beforeunload', () =>
        this.websocket.send(
          JSON.stringify({
            type: 'exit',
            user: this.user,
          })
        )
      );
    } else {
      alert('Such nick has already exist! Choose the other one');
      this.modalInput.value = '';
    }
  }

  sendMessage() {
    const { value } = this.inputElement;
    this.websocket.send(JSON.stringify({ type: 'send', message: value, user: this.user }));
    this.inputElement.value = '';

    const youMsg = this.renderYouMessage(value);
    this.messageContainer.insertAdjacentHTML('afterbegin', youMsg);
  }

  renderMessage(event) {
    const receivedData = JSON.parse(event.data);
    if (Array.isArray(receivedData)) {
      this.userListContainer.textContent = '';

      receivedData.forEach((user) => {
        if (user.name === this.user.name) {
          const you = this.renderYouHTML(user);
          this.userListContainer.insertAdjacentHTML('afterbegin', you);
        } else {
          const newuser = this.renderUsersHTML(user);
          this.userListContainer.insertAdjacentHTML('beforeend', newuser);
        }
      });

      if (receivedData.message) {
        if (receivedData.user.name === this.user.name) return;
        const userMsg = this.renderUsersMessage(receivedData);
        this.messageContainer.insertAdjacentHTML('afterbegin', userMsg);
      }
    }
  }

  renderUsersHTML(user) {
    return `
    <div class="chat__user" data-user-id=${user.id}>${user.name}</div>
    `;
  }

  renderYouHTML(user) {
    return `
    <div class="chat__user you" data-user-id=${user.id}>You</div>
    `;
  }

  renderYouMessage(value) {
    const sourceDate = new Date();
    const date = `${sourceDate
      .toLocaleTimeString()
      .slice(0, 5)} ${sourceDate.toLocaleDateString()} `;
    return `
    <div class="message yourself">
                <div class="message__header">You, ${date}</div>
                <div class="message__text">${value}</div>
              </div>
    `;
  }

  renderUsersMessage(receivedData) {
    const sourceDate = new Date();
    const date = `${sourceDate
      .toLocaleTimeString()
      .slice(0, 5)} ${sourceDate.toLocaleDateString()} `;
    return `
    <div class="message yourself">
                <div class="message__header">${this.user.name}, ${date}</div>
                <div class="message__text">${receivedData.message}</div>
              </div>
    `;
  }
}
