import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../../account/link-manager/store';
import {mockResourcesFound} from '../../mockdata/';
import {selectors} from '../../constants';

import {LinkResource} from '../../../account/link-manager/components/LinkResource';
import {FormWrapper} from '../../../forms/FormWrapper';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  removeResourceFromPool:()=>{},
  removeAllFromPool:()=>{},
  resources:[],
};

let resourceExistsProps = {
  removeResourceFromPool:()=>{},
  removeAllFromPool:()=>{},
  resources:[mockResourcesFound[0]],
};

function setup(props){
    const component = shallow(<LinkResource {...props} />);

    return{
      props,
      component
    }
}

describe('LinkResource', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.linkmanager.LINK_RESOURCE_WRAPPER).exists()).toBe(true);
    });
    it('По умолчанию список ресурсов пустой', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.linkmanager.RESOURCE_LIST_ITEM).exists()).toBe(false);
    });
    it('Отображается выбранный ресурс', ()=>{
      const {component} = setup(resourceExistsProps);
      expect(component.find(selectors.linkmanager.RESOURCE_LIST_ITEM).exists()).toBe(true);
    });
  });
});
