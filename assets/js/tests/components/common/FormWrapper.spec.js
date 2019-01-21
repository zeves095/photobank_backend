import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../../account/link-manager/store';
import {selectors} from '../../constants';

import {FormWrapper} from '../../../forms/FormWrapper';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  onError:()=>{},
  onChange:()=>{},
  onSubmit:()=>{},
  onError:()=>{},
  onBlur:()=>{},
  form:"",
  isAdmin:false,
  submit:()=>{},
  defaults:{},
  validate:()=>{},
};

let linkAddFormProps = {
  defaults:{
    resource:"5,7,9",
    size:{},
  },
  dispatch: ()=>{},
  form:"link-add",
  isAdmin: ()=>{},
  onBlur: ()=>{},
  onChange: ()=>{},
  onError: ()=>{},
  onSubmit: ()=>{},
  submit: ()=>{},
  validate: ()=>{},
}

function setup(props){
    const component = shallow(<FormWrapper {...props} />);

    return{
      props,
      component
    }
}

describe('FormWrapper', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.common.FORM_WRAPPER_WRAPPER).exists()).toBe(true);
    });
    it('По умолчанию дочерний компонент не рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.FORM_SUBCOMPONENT).exists()).toBe(false);
    });
    it('Дочерний компонент отображается при указании формы', ()=>{
      const {component} = setup(linkAddFormProps);
      expect(component.find(selectors.components.FORM_SUBCOMPONENT).exists()).toBe(true);
    });
  });
});
