class EventBus {
  constructor() {
    this.handlers = [];
  }

  /**
   *
   * @param {string} event
   * @param {function} handler
   * @param {object} context
   */
  subscribe(event, handler, context) {
    if (typeof context === 'undefined') {
      context = handler;
    }
    this.handlers.push({
      event,
      handler: handler.bind(context),
    });
  }

  emit(event, ...args) {
    if (args.length === 1) {
      // eslint-disable-next-line prefer-destructuring
      args = args[0];
    }
    this.handlers.forEach((topic) => {
      if (topic.event === event) {
        topic.handler(args);
      }
    });
  }
}

const eventBus = new EventBus();

export default eventBus;
