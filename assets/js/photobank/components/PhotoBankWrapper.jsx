import React, { Component } from 'react';
import {Provider} from 'react-redux';

import PhotoBank from './PhotoBank';
import {store} from '../store';

/**
 * Обертка для основного компонента, служит для коннекта к Redux
 */
export class PhotoBankWrapper extends Component {

  constructor(props){
    super(props);
    import('../../../scss/photobank.scss')
  }

  render() {
    return (
      <div id="photobank-main" onClick={this.testImport}>
        <Provider store = {store}>
          <PhotoBank />
        </Provider>
      </div>
    );
  }
}

export default PhotoBankWrapper;
