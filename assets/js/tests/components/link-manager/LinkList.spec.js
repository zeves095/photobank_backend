import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../../account/link-manager/store';
import {mockLinksDone} from '../../mockdata/';
import {selectors} from '../../constants';

import {LinkList} from '../../../account/link-manager/components/LinkList';
import {FormWrapper} from '../../../forms/FormWrapper';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  fetchLinks: ()=>{},
  links: [],
  chooseLink: ()=>{},
  editing: false,
  adding: false,
  stopEditing: ()=>{},
  addLink: ()=>{},
  deleteLink: ()=>{},
  thumbs: [],
  targets: [],
  loading: false,
};

let linksExistProps={
  fetchLinks: ()=>{},
  links: mockLinksDone,
  chooseLink: ()=>{},
  editing: false,
  adding: false,
  stopEditing: ()=>{},
  addLink: ()=>{},
  deleteLink: ()=>{},
  thumbs: [],
  targets: [],
  loading: false,
}

function setup(props){
    const component = shallow(<LinkList {...props} />);

    return{
      props,
      component
    }
}

describe('LinkList', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.linkmanager.LINK_LIST_WRAPPER).exists()).toBe(true);
    });
    it('Отображаются элементы', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.common.COMPONENT_HEADER).exists()).toBe(true);
      expect(component.find(selectors.common.COMPONENT_TITLE).exists()).toBe(true);
      expect(component.find(selectors.common.COMPONENT_TOP_SECTION).exists()).toBe(true);
      expect(component.find(selectors.common.BUTTON_BLOCK).exists()).toBe(true);
      expect(component.find(selectors.common.HELP_TEXT).exists()).toBe(true);
      expect(component.find(selectors.linkmanager.LINK_TARGETS).exists()).toBe(true);
      expect(component.find(selectors.common.COMPONENT_HEADER).exists()).toBe(true);
    });
    it('Отображаются существующие ссылки', ()=>{
      const {component} = setup(linksExistProps);
      expect(component.find(selectors.linkmanager.LINK_LIST_ITEM).length).toBe(mockLinksDone.length);
    });
  });
});
