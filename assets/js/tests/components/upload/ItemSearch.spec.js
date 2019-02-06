import React from 'react';
import Enzyme, {shallow, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';

import {ItemSearch} from '../../../photobank/components/ItemSearch'

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  searchItems: ()=>{},
  filterid: null,
};

import { JSDOM } from 'jsdom';

const jsdom = new JSDOM(render(<ItemSearch {...bareProps} />));
const { window } = jsdom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
global.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};
copyProps(window, global);

function setup(props){
    const component = shallow(<ItemSearch {...props} />);
    return{
      props,
      component
    }
}

describe('ItemSearch', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.upload.ITEM_SEARCH_WRAPPER).exists()).toBe(true);
    });
    it('Компонент отображает форму для поиска товаров', ()=>{
      const {component} = setup(bareProps);
      expect(component.find('input[name="name"]').exists()).toBe(true);
      expect(component.find('input[name="parent_name"]').exists()).toBe(true);
      expect(component.find('input[name="search_nested"]').exists()).toBe(true);
      expect(component.find('input[name="code"]').exists()).toBe(true);
      expect(component.find('input[name="article"]').exists()).toBe(true);
    });
  });
});
