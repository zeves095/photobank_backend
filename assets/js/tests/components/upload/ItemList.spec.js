import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';

import {ItemList} from '../../../photobank/components/ItemList';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  chooseItem: ()=>{},
  items: [],
  current_item: null,
  items_filtered: [],
  loading: null,
};

let itemsExistProps = {
  chooseItem: ()=>{},
  items:[
    {id:"00010625609",
    itemCode:"00010625609",
    name:"Термобутылка 500 мл",
    node:"00010625608"},
    {id:"00010625610",
    itemCode:"00010625610",
    name:"Термобутылка 500 мл",
    node:"00010625608"},
    {id:"00010625611",
    itemCode:"00010625611",
    name:"Термокружка  450 мл",
    node:"00010625608"},
    {id:"00010625612",
    itemCode:"00010625612",
    name:"Термокружка  450 мл",
    node:"00010625608"},
    {id:"00010626506",
    itemCode:"00010626506",
    name:"Термокружка  450 мл",
    node:"00010625608"}],
  current_item: null,
  items_filtered: [
    {id:"00010625609",
    itemCode:"00010625609",
    name:"Термобутылка 500 мл",
    node:"00010625608"},
    {id:"00010625610",
    itemCode:"00010625610",
    name:"Термобутылка 500 мл",
    node:"00010625608"},
    {id:"00010625611",
    itemCode:"00010625611",
    name:"Термокружка  450 мл",
    node:"00010625608"},
    {id:"00010625612",
    itemCode:"00010625612",
    name:"Термокружка  450 мл",
    node:"00010625608"},
    {id:"00010626506",
    itemCode:"00010626506",
    name:"Термокружка  450 мл",
    node:"00010625608"}],
  loading: null,
};

function setup(props){
  const component = shallow(<ItemList {...props} />);
  return{
    props,
    component
  }
}

describe('ItemList', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.upload.ITEM_LIST_WRAPPER).exists()).toBe(true);
    });
    it('Компонент отображает список товаров', ()=>{
      const {component} = setup(itemsExistProps);
      expect(component.find(selectors.upload.ITEM_LIST_ITEM)).toHaveLength(itemsExistProps.items.length);
    });
  });
});
