import React, { Component } from 'react';
import LinkManager from './LinkManager';
import {Provider} from 'react-redux';
import {store} from '../store';

class LinkManagerWrapper extends Component {
  render() {
    return (
      <div id="link-manager">
        <Provider store = {store}>
          <LinkManager />
        </Provider>
      </div>
    );
  }
}

export default LinkManagerWrapper;
