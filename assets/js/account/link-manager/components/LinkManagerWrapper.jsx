import React, { Component } from 'react';
import LinkManager from './LinkManager';
import {Provider} from 'react-redux';
import {store} from '../store';

/**
 * Обертка для основного компонента, служит для коннекта к Redux
 */
export class LinkManagerWrapper extends Component {

  constructor(props){
    super(props);
    import('../../../../scss/account.scss')
  }

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
