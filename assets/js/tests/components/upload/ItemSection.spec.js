import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';

import {ItemSection} from '../../../photobank/components/ItemSection';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  open_by_default: null,
  chooseListViewType: null,
  pushResumable: ()=>{},
  fetchItemData: ()=>{},
  resumable: null,
  authorized: null,
  view: null,
  render_existing: null,
  authorized: null,
  addDownloadHandler: ()=>{},
  item_id: null,
  item: null,
};

let itemExistsProps = {
  open_by_default: null,
  chooseListViewType: null,
  pushResumable: ()=>{},
  fetchItemData: ()=>{},
  resumable: null,
  authorized: null,
  view: null,
  render_existing: true,
  authorized: null,
  addDownloadHandler: ()=>{},
  item_id: "00010598085",
  item: {
    id:"00010598085",
    itemCode:"00010598085",
    name:"Гель для посудомоечных машин \"Очарование\" флакон-дозатор, 480гр",
    node:"00010598084"},
};

let unAuthorizedProps = {
  open_by_default: null,
  chooseListViewType: null,
  pushResumable: ()=>{},
  fetchItemData: ()=>{},
  resumable: true,
  authorized: false,
  view: null,
  render_existing: true,
  authorized: false,
  addDownloadHandler: ()=>{},
  item_id: "00010598085",
  item: {
    id:"00010598085",
    itemCode:"00010598085",
    name:"Гель для посудомоечных машин \"Очарование\" флакон-дозатор, 480гр",
    node:"00010598084"},
};

let authorizedProps = {
  open_by_default: null,
  chooseListViewType: null,
  pushResumable: ()=>{},
  fetchItemData: ()=>{},
  resumable: true,
  authorized: true,
  view: null,
  render_existing: true,
  authorized: true,
  addDownloadHandler: ()=>{},
  item_id: "00010598085",
  item: {
    id:"00010598085",
    itemCode:"00010598085",
    name:"Гель для посудомоечных машин \"Очарование\" флакон-дозатор, 480гр",
    node:"00010598084"},
};

let hideExistingProps = {
  open_by_default: null,
  chooseListViewType: null,
  pushResumable: ()=>{},
  fetchItemData: ()=>{},
  resumable: true,
  authorized: true,
  view: null,
  render_existing: false,
  authorized: true,
  addDownloadHandler: ()=>{},
  item_id: "00010598085",
  item: {
    id:"00010598085",
    itemCode:"00010598085",
    name:"Гель для посудомоечных машин \"Очарование\" флакон-дозатор, 480гр",
    node:"00010598084"},
};

function setup(props){
    const component = shallow(<ItemSection {...props} />);
    return{
      props,
      component
    }
}

describe('ItemSection', ()=>{
  describe('render',()=>{
    it('Компонент не рендерится без товара', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.upload.ITEM_SECTION_WRAPPER).exists()).toBe(false);
    });
    it('Компонент рендерится', ()=>{
      const {component} = setup(itemExistsProps);
      expect(component.find(selectors.upload.ITEM_SECTION_WRAPPER).exists()).toBe(true);
    });
    it('Компонент отображает вложенные компоненты', ()=>{
      const {component} = setup(unAuthorizedProps);
      expect(component.find(selectors.components.EXISTING_RESOURCES_COMPONENT).exists()).toBe(true);
      expect(component.find(selectors.components.UPLOADS_COMPONENT).exists()).toBe(false);
    });
    it('Компонент отображает вложенные компоненты с правами редактора', ()=>{
      const {component} = setup(authorizedProps);
      expect(component.find(selectors.components.EXISTING_RESOURCES_COMPONENT).exists()).toBe(true);
      expect(component.find(selectors.components.UPLOADS_COMPONENT).exists()).toBe(true);
    });
    it('Компонент скрывает существующие ресурсы', ()=>{
      const {component} = setup(hideExistingProps);
      expect(component.find(selectors.components.EXISTING_RESOURCES_COMPONENT).exists()).toBe(false);
    });
  });
});
