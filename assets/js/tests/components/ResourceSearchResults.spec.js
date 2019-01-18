import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../account/link-manager/store';
import {mockResourcesFound, mockResourcesChosen} from '../mockdata/';
import {selectors} from '../selectors';

import {ResourceSearchResults} from '../../account/link-manager/components/ResourceSearchResults';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  addResourceToPool:()=>{},
  resources_found:[],
  resources_chosen:[],
  loading:false,
};

let resourcesFoundProps = {
  addResourceToPool:()=>{},
  resources_found:mockResourcesFound,
  resources_chosen:mockResourcesChosen,
  loading:false,
};

function setup(props){
    const component = shallow(<ResourceSearchResults {...props} />);

    return{
      props,
      component
    }
}

describe('ResourceSearchResults', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.linkmanager.RESOURCE_SEARCH_RESULTS_WRAPPER).exists()).toBe(true);
    });
    it('По умолчанию ресурсы не отображаются', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.linkmanager.RESOURCE_LIST_ITEM).exists()).toBe(false);
    });
    it('Отображаются найденные ресурсы', ()=>{
      const {component} = setup(resourcesFoundProps);
      expect(component.find(selectors.linkmanager.RESOURCE_LIST_ITEM).exists()).toBe(true);
      expect(component.find(selectors.linkmanager.RESOURCE_LIST_ITEM).length).toBe(mockResourcesFound.length);
    });
    it('Отображены выбранные ресурсы', ()=>{
      const {component} = setup(resourcesFoundProps);
      expect(component.find(selectors.linkmanager.RESOURCE_LIST_ITEM_SELECTED).exists()).toBe(true);
      expect(component.find(selectors.linkmanager.RESOURCE_LIST_ITEM_SELECTED).length).toBe(mockResourcesChosen.length);
    });
  });
});
