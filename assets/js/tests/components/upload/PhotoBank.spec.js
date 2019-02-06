import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';
import {PhotoBank} from '../../../photobank/components/PhotoBank';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  init: ()=>{return new Promise((a,b)=>{a({})})},
  catalogue_data: [],
  show_node_viewer: false,
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
      expect(component.find(selectors.upload.PHOTOBANK_WRAPPER).exists()).toBe(true);
    });
    it('Компонент апускает вложенные компоненты', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.CATALOGUE_TREE_COMPONENT).exists()).toBe(true);
      expect(component.find(selectors.components.NODE_VIEWER_COMPONENT).exists()).toBe(false);
    });
  });
});
