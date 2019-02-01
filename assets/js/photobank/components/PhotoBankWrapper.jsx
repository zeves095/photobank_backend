import React, { Component } from 'react';
import PhotoBank from './PhotoBank';
import {Provider} from 'react-redux';
import {store} from '../store';

/**
 * Обертка для основного компонента, служит для коннекта к Redux
 */
export class PhotoBankWrapper extends Component {
  render() {
    return (
      <div id="photobank-main">
        <Provider store = {store}>
          <PhotoBank />
        </Provider>
      </div>
    );
  }
}

export default PhotoBankWrapper;
