import React from 'react';

export class UserList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      "show_inactive": false,
      "chosen": null
    }
    this.handleUserChoice = this.handleUserChoice.bind(this);
    this.addUser = this.addUser.bind(this);
    this.showInactive = this.showInactive.bind(this);
  }

  handleUserChoice(e){
    let user_id = e.target.dataset["user"];
    this.props.userChoiceHandler(user_id);
    this.setState({
      "chosen": user_id
    });
  }

  addUser(){
    this.props.userChoiceHandler();
  }

  showInactive(){
    this.setState({
      "show_inactive":!this.state.show_inactive
    });
  }

  render() {
    let usersActive = this.props.users.filter((user)=>{
      return user.active;
    });
    let usersInactive = this.props.users.filter((user)=>{
      return !user.active;
    });
    let usersActiveMarkup = usersActive.map((user)=>{
      return <div key={"userl"+user.id} className={"user-item card-panel white-text "+(this.state.chosen == user.id?"light-blue accent-3":"blue-grey lighten-2")} data-user={user.id} onClick={this.handleUserChoice}><i className="fas fa-user"></i>{user.name}</div>
    });
    let usersInactiveMarkup = usersInactive.map((user)=>{
      return <div key={"userl"+user.id} className={"user-item inactive card-panel "+(this.state.chosen == user.id?"light-blue accent-1":"blue-grey lighten-4")} data-user={user.id} onClick={this.handleUserChoice}><i className="fas fa-user-slash"></i>{user.name}</div>
    });
    return(
      <div className="user-list col s4">
      <h4>Пользователи</h4>
    {usersActiveMarkup}
    <button className="blue-grey waves-effect waves-light btn" type="button" onClick={this.showInactive}>{this.state.show_inactive?"Скрыть неактивных":"Показать неактивных"}</button>
  <div className={"users-inactive" + (this.state.show_inactive?"":" hidden")}>
        {usersInactiveMarkup}
        </div>
        <button className="blue-grey waves-effect waves-light btn" type="button" onClick={this.addUser}><i class="fas fa-user-plus"></i>Добавить</button>
      </div>
    );
  }
}
