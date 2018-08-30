import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../../account/link-manager/store';
import {selectors} from '../../constants';

import {Confirmator} from '../../../common/Confirmator';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  active: false,
  prehook: ()=>{},
  questions: [],
  onConfirm: ()=>{},
  buttonTitle: "",
  disabled: false,
  customClass: "",
  inline: false,
};
let disabledProps = {
  active: false,
  prehook: ()=>{},
  questions: [],
  onConfirm: ()=>{},
  buttonTitle: "",
  disabled: true,
  customClass: "",
  inline: false,
};
let questionProps = {
  active: true,
  prehook: ()=>{},
  questions: ['Question1','Question2'],
  onConfirm: ()=>{},
  buttonTitle: "",
  disabled: false,
  customClass: "",
  inline: false,
};

function setup(props){
    const component = shallow(<Confirmator {...props} />);
    return{
      props,
      component
    }
}

describe('Confirmator', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.common.CONFIRMATOR_WRAPPER).exists()).toBe(true);
    });
    it('Disabled работает', ()=>{
      const {component} = setup(disabledProps);
      expect(component.find(selectors.common.CONFIRMATOR_WRAPPER+" button[disabled]").exists()).toBe(true);
    });
    it('Задает вопросы', ()=>{
      const {component} = setup(questionProps);
      component.setState({step:1});
      expect(component.find(selectors.common.CONFIRMATOR_WRAPPER+" .confirmator-question").exists()).toBe(true);
    });
  });
});
