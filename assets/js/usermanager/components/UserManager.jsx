import React from 'react';
import {connect} from 'react-redux';
import UserList from './UserList';
import UserEditor from './UserEditor';
import UserService from '../services/UserService';
import {NotificationService} from '../../services/NotificationService';
import {fetchUsers} from '../actionCreator';
import selectors from '../selectors';

/**
 * Интерфейс работы с поьзователями
 */
export class UserManager extends React.Component {

  /**
   * Конструктор компонента
   * users - Список существующих пользователей
   * current_user - Пользователь, который редактируется в данный момент
   */
  constructor(props) {
    super(props);
  }

  componentWillMount(){
    this.props.fetchUsers();
  }

  render() {
    return(
      <div className="user-manager-main row">
        <div id="notification-overlay">

        </div>
      <nav className="nav-wrapper blue-grey darken-2">
        <div className="brand-logo"><i className="fas fa-camera"></i>PhotoBank - Редактор пользователей</div>
        </nav>
        <UserList />
        <UserEditor />
      </div>
    );
  }
}

const mapStateToProps = (state,props)=>{
  return({

  })
}

const mapDispatchToProps = {
  fetchUsers,
}

export default connect(mapStateToProps, mapDispatchToProps)(UserManager);
