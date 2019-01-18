import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../account/link-manager/store';
import {mockResourcesFound} from '../mockdata/';
import {selectors} from '../selectors';

import {LinkAddForm} from '../../account/link-manager/components/LinkAddForm';
import {FormWrapper} from '../../forms/FormWrapper';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  resource_chosen:[],
  submitLink: ()=>{},
  validateLinkAddForm: ()=>{},
  targets:[],
  form_error:""
};

function setup(props){
    const component = shallow(<LinkAddForm {...props} />);

    return{
      props,
      component
    }
}

describe('LinkAddForm', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.linkmanager.LINK_ADD_FORM_WRAPPER).exists()).toBe(true);
    });
    it('Вызван компонент формы', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.FORM_WRAPPER_COMPONENT).exists()).toBe(true);
    });
  });
});
