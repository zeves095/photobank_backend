import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';

import {PhotoBank} from '../../../photobank/components/PhotoBank';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  user:null,
  UpdateHandler: ()=>{}
};

let userProps = {
  user:{
    id: "1",
    name: "Admin",
    email: "admin@site.com",
    active: true,
    password: "s3cr3t",
    role: "ROLE_ADMIN",
  },
  UpdateHandler: ()=>{}
};

function setup(props){
    const component = shallow(<PhotoBank {...props} />);
    return{
      props,
      component
    }
}

describe('PhotoBank', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.usermanager.USER_EDITOR_WRAPPER).exists()).toBe(true);
    });
    it('Компонент отображает форму для редактирования пользователя', ()=>{
      const {component} = setup(userProps);
      expect(component.find(selectors.usermanager.USER_EDITOR_INPUT_NAME).exists()).toBe(true);
      expect(component.find(selectors.usermanager.USER_EDITOR_INPUT_ID).exists()).toBe(true);
      expect(component.find(selectors.usermanager.USER_EDITOR_INPUT_EMAIL).exists()).toBe(true);
      expect(component.find(selectors.usermanager.USER_EDITOR_INPUT_PASSWORD).exists()).toBe(true);
      expect(component.find(selectors.usermanager.USER_EDITOR_INPUT_ROLE).exists()).toBe(true);
    });
  });
});
