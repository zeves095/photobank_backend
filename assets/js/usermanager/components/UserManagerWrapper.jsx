import React from 'react';
import {store} from '../store'
import UserManager from './UserManager';
import {Provider} from 'react-redux';

/**
 * Интерфейс работы с поьзователями
 */
export class UserManagerWrapper extends React.Component {
  constructor(props){
    super(props);
    import('../../../scss/usermanager.scss');
  }

  render(){
    return(
      <div className="user-manager-wrapper">
        <Provider store={store}>
          <UserManager />
        </Provider>
      </div>
    );
  }

}

export default UserManagerWrapper;
