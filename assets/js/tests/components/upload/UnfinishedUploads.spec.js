import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';

import {UnfinishedUploads} from '../../../photobank/components/UnfinishedUploads';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  deleteUpload: ()=>{},
  deleteUnfinishedUploads: ()=>{},
  item: {},
  unfinished: [],
};

let realProps = {
  deleteUpload: ()=>{},
  deleteUnfinishedUploads: ()=>{},
  item: {
    id:"00010598085",
    itemCode:"00010598085",
    name:"Гель для посудомоечных машин \"Очарование\" флакон-дозатор, 480гр",
    node:"00010598084",
    item_id:"00010598085",},
  unfinished: [{chunks_completed:0,
  chunks_total:1,
  file_hash:"d1ea38dfe3e1f7e0ddf1b0e07124dfbd",
  file_name:"00010590725_2 (4).jpg",
  id:"00010598085",},
  {chunks_completed:0,
  chunks_total:1,
  file_hash:"449e821e794a70e8724c941ae8c36659",
  file_name:"00010595613_4 (3) (1) (1) (5).jpg",
  id:"00010598085",},
  {chunks_completed:0,
  chunks_total:1,
  file_hash:"59ab68ddceb58c8d0f1a5716faa99eda",
  file_name:"00010594175_4 (5).jpg",
  id:"00010598085",},],
};

function setup(props){
    const component = shallow(<UnfinishedUploads {...props} />);
    return{
      props,
      component
    }
}

describe('UnfinishedUploads', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.upload.UNFINISHED_UPLOADS_WRAPPER).exists()).toBe(true);
    });
    it('Компонент отображает незаконченные загрузки', ()=>{
      const {component} = setup(realProps);
      expect(component.find(selectors.upload.UNFINISHED_UPLOAD)).toHaveLength(realProps.unfinished.length);
      expect(component.find(selectors.upload.UNFINISHED_UPLOADS_WRAPPER+" .file-item__file-name").exists()).toBe(true);
      expect(component.find(selectors.upload.UNFINISHED_UPLOADS_WRAPPER+" .file-item__upload-status").exists()).toBe(true);
      expect(component.find(selectors.upload.UNFINISHED_UPLOADS_WRAPPER+" .file-item__delete-upload").exists()).toBe(true);
      expect(component.find(selectors.upload.UNFINISHED_UPLOADS_WRAPPER+" .progress-bar__percentage").exists()).toBe(true);
    });
  });
});
