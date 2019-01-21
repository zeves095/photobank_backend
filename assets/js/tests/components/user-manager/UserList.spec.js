import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';
import {userList} from '../../mockdata';

import {UserList} from '../../../usermanager/UserList';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  userChoiceHandler: ()=>{},
  users: []
};

let userProps = {
  userChoiceHandler: ()=>{},
  users: userList
};

function setup(props){
    const component = shallow(<UserList {...props} />);
    return{
      props,
      component
    }
}

describe('UserList', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.usermanager.USER_LIST_WRAPPER).exists()).toBe(true);
    });
    it('Отображается список пользователей', ()=>{
      const {component} = setup(userProps);
      expect(component.find(selectors.usermanager.USER_LIST_ITEM).length).toBe(userList.filter((user)=>{return user.active}).length);
    });
  });
});
