import React from "react";
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import {SideMenu} from './SideMenu';
import PhotoBankWrapper from '../photobank/components/PhotoBankWrapper';
import LinkManagerWrapper from '../account/link-manager/components/LinkManagerWrapper';
import UserManagerWrapper from '../usermanager/components/UserManagerWrapper';
import utility from '../photobank/services/UtilityService';
import LocalStorageService from '../photobank/services/UtilityService';

class PhotoBankRouter extends React.Component {

  constructor(props){
    super(props);
    utility.initLocalstorage();
    this.state={
      menu_open:true,//LocalStorageService.get('menu_open'),
    }
  }

  render(){
    return (
      <Router>
        <div onClick={()=>{console.log('importing');import('react-simple-jstree')}} className="router-wrapper">
          <SideMenu />
          <Route path="/upload/" component={PhotoBankWrapper} />
          <Route path="/account/" component={LinkManagerWrapper} />
          <Route path="/usermanager/" component={UserManagerWrapper} />
        </div>
      </Router>
    )
  }

}

export default PhotoBankRouter;
