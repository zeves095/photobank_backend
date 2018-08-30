import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';

import {UploadPool} from '../../../photobank/components/UploadPool';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  container: [],
  chooseListViewType: ()=>{},
  view: null,
};

let activeItemsProps = {
  container: [{id:1},{id:2}],
  chooseListViewType: ()=>{},
  view: null,
};

function setup(props){
    const component = shallow(<UploadPool {...props} />);
    return{
      props,
      component
    }
}

describe('UploadPool', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.upload.UPLOAD_POOL_WRAPPER).exists()).toBe(true);
    });
    it('Компонент отображает активные загрузки', ()=>{
      const {component} = setup(activeItemsProps);
      expect(component.find(selectors.components.ITEM_SECTION_COMPONENT).exists()).toBe(true);
    });
  });
});
