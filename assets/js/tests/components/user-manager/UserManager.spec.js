import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';

import {UserManager} from '../../../usermanager/UserManager';

Enzyme.configure({adapter: new Adapter()});

function setup(props){
    const component = shallow(<UserManager {...props} />);
    return{
      component
    }
}

describe('UserManager', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup({});
      expect(component.find(selectors.usermanager.USER_MANAGER_WRAPPER).exists()).toBe(true);
    });
  });
});
