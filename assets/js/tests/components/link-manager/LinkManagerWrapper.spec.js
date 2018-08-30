import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../../account/link-manager/store';
import {mockResourcesFound} from '../../mockdata/';
import {selectors} from '../../constants';

import LinkManagerWrapper from '../../../account/link-manager/components/LinkManagerWrapper';
import {FormWrapper} from '../../../forms/FormWrapper';

Enzyme.configure({adapter: new Adapter()});

function setup(){
    const component = shallow(<LinkManagerWrapper />);

    return{
      component
    }
}

describe('LinkManagerWrapper', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup();
      expect(component.find(selectors.linkmanager.LINK_MANAGER_WRAPPER_WRAPPER).exists()).toBe(true);
    });
    it('Вызван компонент формы', ()=>{
      const {component} = setup();
      expect(component.find(selectors.components.LINK_MANAGER_COMPONENT).exists()).toBe(true);
    });
  });
});
