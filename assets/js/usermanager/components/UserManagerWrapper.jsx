import React from 'react';
import {store} from '../store'
import UserManager from './UserManager';
import {Provider} from 'react-redux';

/**
 * Интерфейс работы с поьзователями
 */
export class UserManagerWrapper extends React.Component {

  render() {
    return(
      <div className="user-manager-wrapper">
        <Provider store={store}>
          <UserManager />
        </Provider>
      </div>
    );
  }
}
