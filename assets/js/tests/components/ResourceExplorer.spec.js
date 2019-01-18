import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../account/link-manager/store';
import {mockResourcesFound} from '../mockdata/';
import {selectors} from '../selectors';

import {ResourceExplorer} from '../../account/link-manager/components/ResourceExplorer';
import {FormWrapper} from '../../forms/FormWrapper';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
};

function setup(props){
    const component = shallow(<ResourceExplorer {...props} />);

    return{
      props,
      component
    }
}

describe('ResourceExplorer', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.linkmanager.RESOURCE_EXPLORER_WRAPPER).exists()).toBe(true);
    });
    it('Вызван компонент формы поиска ресурсов', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.RESOURCE_SEARCH_FORM_COMPONENT).exists()).toBe(true);
    });
    it('Вызван компонент результатов поиска ресурсов', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.RESOURCE_SEARCH_RESULTS_COMPONENT).exists()).toBe(true);
    });
  });
});
