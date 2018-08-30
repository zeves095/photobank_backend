import { JSDOM } from 'jsdom';

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
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

import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';
import jQuery from 'jquery';
global.$ = jQuery(window);


import {Uploads} from '../../../photobank/components/Uploads';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  deleteUnfinishedUploads: ()=>{},
  prepareFileForUpload: ()=>{},
  completeUpload: ()=>{},
  deleteUpload: ()=>{},
  uploads_ready: [],
  uploads: [],
  resumable: null,
  item_id: null,
  item: null,
};

let itemExistsProps = {
  deleteUnfinishedUploads: ()=>{},
  prepareFileForUpload: ()=>{},
  completeUpload: ()=>{},
  deleteUpload: ()=>{},
  uploads_ready: [],
  uploads: [],
  resumable: null,
  item_id: "00010598086",
  item: {id:"00010598086",
  itemCode:"00010598086",
  name:"Гель для посудомоечных машин \"Очарование\" флакон, 840гр",
  node:"00010598084",},
};

let renderProps = {
  deleteUnfinishedUploads: ()=>{},
  prepareFileForUpload: ()=>{},
  completeUpload: ()=>{},
  deleteUpload: ()=>{},
  uploads_ready: [],
  uploads: [],
  resumable: {
    addFile:()=>{},
    addFiles:()=>{},
    assignBrowse:()=>{},
    assignDrop:()=>{},
    cancel:()=>{},
    defaults:{},
    events:[],
    files:[],
    fire:()=>{},
    getFromUniqueIdentifier:()=>{},
    getOpt:()=>{},
    getSize:()=>{},
    handleChangeEvent:()=>{},
    handleDropEvent:()=>{},
    indexOf:()=>{},
    isUploading:()=>{},
    on:()=>{},
    opts:{},
    pause:()=>{},
    progress:()=>{},
    removeFile:()=>{},
    support:true,
    unAssignDrop:()=>{},
    updateQuery:()=>{},
    upload:()=>{},
    uploadNextChunk:()=>{},
    version:1,
  },
  item_id: "00010598086",
  item: {id:"00010598086",
  itemCode:"00010598086",
  name:"Гель для посудомоечных машин \"Очарование\" флакон, 840гр",
  node:"00010598084",},
};

function setup(props){
    const component = shallow(<Uploads {...props} />);
    return{
      props,
      component
    }
}

describe('Uploads', ()=>{
  describe('render',()=>{
    it('Компонент не рендерится без товара', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.upload.UPLOADS_WRAPPER).exists()).toBe(false);
    });
    it('Компонент не рендерится без resumable', ()=>{
      const {component} = setup(itemExistsProps);
      expect(component.find(selectors.upload.UPLOADS_WRAPPER).exists()).toBe(false);
    });
    it('Компонент рендерится', ()=>{
      const {component} = setup(renderProps);
      expect(component.find(selectors.upload.UPLOADS_WRAPPER).exists()).toBe(true);
      expect(component.find(selectors.components.UNFINISHED_UPLOADS_COMPONENT).exists()).toBe(true);
    });
  });
});
