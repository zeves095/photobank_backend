import React from 'react';

import {Link} from 'react-router-dom';

export class SideMenu extends React.Component{
  constructor(props){
    super(props);
    this.state={
      open:true,
    }
  }

  handleMenuCollapse=()=>{
    this.setState({open:!this.state.open});
  }

  render(){
    return(
      <div className={"menublock"+(this.state.open?" open":"")}>
        <i className="menu-collapse" onClick={this.handleMenuCollapse}></i>
        <div className="account-info">
          <p><i className="fas fa-user-circle user-img"></i>
          <span className="collapsible">
          </span></p>
          <a href="/logout" className="clogout-btn"><span className="collapsible">Выход</span></a>
        </div>
        <div className="nav">
          <Link to="/upload/"><i className="fas fa-arrow-alt-circle-down"></i><span className="collapsible">Загрузка</span></Link>
          <Link to="/account/"><i className="fas fa-link"></i><span className="collapsible">Выгрузка ссылок</span></Link>
          <Link to="/usermanager/"><i className="fas fa-users"></i><span className="collapsible">Пользователи</span></Link>
        </div>
      </div>
    )
  }
}
