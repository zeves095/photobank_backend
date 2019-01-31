import React from 'react';
import {connect} from 'react-redux';
import {addUser,chooseUser} from '../actionCreator';
import selectors from '../selectors';

/**
 * Компонент для отображения списка существующих пользователей
 */
export class UserList extends React.Component {

  /**
   * Конструктор компонента
   */
  constructor(props) {
    super(props);
    this.state = {
      "show_inactive": false
    }
  }

  /**
   * Показать/скрыть список неактивных пользователей
   */
  showInactive=()=>{
    this.setState({
      "show_inactive":!this.state.show_inactive
    });
  }

  render() {
    console.log(this.props);
    let usersActive = this.props.users_active.map((user)=>{
      return <div key={"userl"+user.id} className={"user-item card-panel white-text "+(this.props.user&&this.props.user.id==user.id?"light-blue accent-3":"blue-grey lighten-2")} onClick={()=>{this.props.chooseUser(user.id)}}><i className="fas fa-user"></i>{user.name}</div>
    });
    let usersInactive = this.props.users_inactive.map((user)=>{
      return <div key={"userl"+user.id} className={"user-item inactive card-panel "+(this.props.user&&this.props.user.id==user.id?"light-blue accent-1":"blue-grey lighten-4")} onClick={()=>{this.props.chooseUser(user.id)}}><i className="fas fa-user-slash"></i>{user.name}</div>
    });
    return(
      <div className="user-list col s4">
        <h4>Пользователи</h4>
        {usersActive}
        <button className="blue-grey waves-effect hoverable waves-light btn" type="button" onClick={this.showInactive}>{this.state.show_inactive?"Скрыть неактивных":"Показать неактивных"}</button>
        <div className={"users-inactive" + (this.state.show_inactive?"":" hidden")}>
          {usersInactive}
        </div>
        <button className="blue-grey waves-effect hoverable waves-light btn" type="button" onClick={()=>{this.props.addUser(this.props.users)}}><i className="fas fa-user-plus"></i>Добавить</button>
      </div>
    );
  }
}

const mapStateToProps = (state,props)=>{
  return({
    user: selectors.user.getCurrentUser(state,props),
    users: selectors.user.getUsers(state,props),
    users_active: selectors.user.getActiveUsers(state,props),
    users_inactive: selectors.user.getInactiveUsers(state,props),
  })
}

const mapDispatchToProps = {
  addUser,
  chooseUser
}

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
