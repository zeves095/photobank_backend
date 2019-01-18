import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../account/link-manager/store';
import {mockResourcesFound} from '../mockdata/';
import {selectors} from '../selectors';

import {ResourceSearchForm} from '../../account/link-manager/components/ResourceSearchForm';
import {FormWrapper} from '../../forms/FormWrapper';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  resource_presets: [],
  resource_types: [],
  searchResources: ()=>{},
};

function setup(props){
    const component = shallow(<ResourceSearchForm {...props} />);

    return{
      props,
      component
    }
}

describe('ResourceSearchForm', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.linkmanager.RESOURCE_SEARCH_FORM_WRAPPER).exists()).toBe(true);
    });
    it('Вызван компонент формы', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.FORM_WRAPPER_COMPONENT).exists()).toBe(true);
    });
  });
});
