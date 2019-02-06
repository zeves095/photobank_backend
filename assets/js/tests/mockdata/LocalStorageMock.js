class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    let response = this.store[key]===null||typeof this.store[key] ==="undefined"?'':this.store[key];
    return response;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
};

export {LocalStorageMock};
