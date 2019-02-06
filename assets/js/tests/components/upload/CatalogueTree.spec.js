import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';

import {CatalogueTree} from '../../../photobank/components/CatalogueTree';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  chooseNode: ()=>{},
  catalogue_data: [],
  current_node: null,
  pushCrumbs: ()=>{},
  chooseCatalogueViewType: ()=>{},
  view: null,
  crumbs: {},
  loading: null,
};

function setup(props){
    const component = shallow(<CatalogueTree {...props} />);
    return{
      props,
      component
    }
}

describe('CatalogueTree', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.usermanager.NODE_VIEWER_WRAPPER).exists()).toBe(true);
    });
    it('Компонент отображает вложенные компоненты', ()=>{
      const {component} = setup(userProps);
      expect(component.find(selectors.usermanager.ITEM_LIST_COMPONENT).exists()).toBe(true);
      expect(component.find(selectors.usermanager.ITEM_SECTION_COMPONENT).exists()).toBe(true);
    });
  });
});
