import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../account/link-manager/store';
import {selectors} from '../selectors';

import {LinkManager} from '../../account/link-manager/components/LinkManager';

Enzyme.configure({adapter: new Adapter()});

const bareProps = {
  init: ()=>{}
};

function setup(props){
    const component = shallow(<LinkManager {...props} />);

    return{
      props,
      component
    }
}

describe('LinkManager', ()=>{
  describe('render',()=>{
    it('Обертка для компонента рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.linkmanager.LINK_MANAGER_WRAPPER).exists()).toBe(true);
    });
    it('Обертка для уведомлений рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.NOTIFICATION_OVERLAY).exists()).toBe(true);
    });
    it('Вызван компонент поиска ресурсов', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.LINK_LIST_COMPONENT).exists()).toBe(true);
    });
    it('Вызван компонент добавления ссылки', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.LINK_ADDER_COMPONENT).exists()).toBe(true);
    });
  });
});
