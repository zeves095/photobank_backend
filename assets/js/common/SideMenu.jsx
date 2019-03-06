import {React} from 'react';

export class SideMenu extends React.Component{
  constructor(props){
    super(props);
    this.state={
      open:utility.localStorage
    }
  }

  render(){
    return(
          <div class="menublock open">
            <i class="menu-collapse"></i>
            <div class="account-info">
            <p><i class="fas fa-user-circle user-img"></i>
            <span class="collapsible">
          </span></p>
            <a href="{{ path('logout') }}" class="clogout-btn"><span class="collapsible">Выход</span></a>
            </div>
            <div class="nav">
            <a href="{{ path('upload') }}"><i class="fas fa-arrow-alt-circle-down"></i><span class="collapsible">Загрузка</span></a>
            <a href="{{ path('account') }}"><i class="fas fa-link"></i><span class="collapsible">Выгрузка ссылок</span></a>
            <a href="{{ path('usermanager') }}"><i class="fas fa-users"></i><span class="collapsible">Пользователи</span></a>
          </div>
          </div>
    );
  }
}
