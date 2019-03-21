import React from 'react';
import {UserEditor} from './../usermanager/UserEditor';
import {UserService} from './../usermanager/services/UserService';
import {NotificationService} from '../services/NotificationService';

/**
 * Обертка для компонента интерфейса личного кабинета
 */
export class AccountInfo extends React.Component {

  constructor(props){
    super(props);
    this.state={};
  }

render(){
    return(
      <div className="account-info__inner">
      <div className="card horizontal user-info blue-grey lighten-2 white-text">
        <div className="card-image">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className="card-content">
        </div>
      </div>
      <UserEditor user={this.props.user}/>
  </div>
    );
}

}
