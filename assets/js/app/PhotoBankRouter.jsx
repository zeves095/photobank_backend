import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import PhotoBankWrapper from '../photobank/components/PhotoBankWrapper';
import LinkManagerWrapper from '../account/link-manager/components/LinkManagerWrapper';
import UserManagerWrapper from '../usermanager/components/UserManagerWrapper';
import utility from '../photobank/services/UtilityService';
import LocalStorageService from '../photobank/services/UtilityService';

class PhotoBankRouter extends React.Component {
  constructor(props){
    super(props);
    //utility.initLocalstorage;
    this.state={
      menu_open:true,//LocalStorageService.get('menu_open'),
    }
  }

  render(){
    return (
      <Router>
      <div className={"menublock"+(this.state.menu_open?" open":"")}>
        <i className="menu-collapse" ></i>
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
          <Route path="/upload/" component={PhotoBankWrapper} />
          <Route path="/account/" component={LinkManagerWrapper} />
          <Route path="/usermanager/" component={UserManagerWrapper} />
      </Router>
    )
  }
}

export default PhotoBankRouter;
