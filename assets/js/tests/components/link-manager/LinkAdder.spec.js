import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../../account/link-manager/store';
import {selectors} from '../../constants';

import {LinkAdder} from '../../../account/link-manager/components/LinkAdder';

Enzyme.configure({adapter: new Adapter()});

const bareProps = {
  link_adding:false
};

const addingProps = {
  link_adding:true
};

function setup(props){

    const component = shallow(<LinkAdder {...props} />);

    return{
      props,
      component
    }
}

describe('LinkAdder', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.linkmanager.LINK_ADDER_WRAPPER).exists()).toBe(true);
    });
    it('Не вызван компонент формы пока не идет добавление ссылки', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.LINK_ADD_FORM_COMPONENT).exists()).toBe(false);
    });
    it('Не вызван компонент выбранного ресурса пока не идет добавление ссылки', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.LINK_RESOURCE_COMPONENT).exists()).toBe(false);
    });
    it('Не вызван компонент поиска ресурсов пока не идет добавление ссылки', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.RESOURCE_EXPLORER_COMPONENT).exists()).toBe(false);
    });
    it('Вызван компонент формы', ()=>{
      const {component} = setup(addingProps);
      expect(component.find(selectors.components.LINK_ADD_FORM_COMPONENT).exists()).toBe(true);
    });
    it('Вызван компонент выбранного ресурса', ()=>{
      const {component} = setup(addingProps);
      expect(component.find(selectors.components.LINK_RESOURCE_COMPONENT).exists()).toBe(true);
    });
    it('Вызван компонент поиска ресурсов', ()=>{
      const {component} = setup(addingProps);
      expect(component.find(selectors.components.RESOURCE_EXPLORER_COMPONENT).exists()).toBe(true);
    });
  });
});
