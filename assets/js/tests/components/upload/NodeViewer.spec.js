import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';

import { NodeViewer } from '../../../photobank/components/NodeViewer';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  current_item: null,
  stored_item_id: null,
  crumbs: [],
  authorized: null,
  collection_type: 0
};

let itemChosenProps = {
  current_item: {
    id:"00010598085",
    itemCode:"00010598085",
    name:"Гель для посудомоечных машин \"Очарование\" флакон-дозатор, 480гр",
    node:"00010598084",
  },
  stored_item_id: "00010598085",
  crumbs: [],
  authorized: null,
  collection_type: 0
};

function setup(props){
    const component = shallow(<NodeViewer {...props} />);
    return{
      props,
      component
    }
}

describe('NodeViewer', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.upload.NODE_VIEWER_WRAPPER).exists()).toBe(true);
    });
    it('Компонент отображает вложенные компоненты', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.components.ITEM_LIST_COMPONENT).exists()).toBe(true);
      expect(component.find(selectors.upload.ITEM_SECTION_OUTER).exists()).toBe(true);
    });
    it('Компонент отображает выбранный товар', ()=>{
      const {component} = setup(itemChosenProps);
      expect(component.find(selectors.components.ITEM_SECTION_COMPONENT).exists()).toBe(true);
    });
  });
});
