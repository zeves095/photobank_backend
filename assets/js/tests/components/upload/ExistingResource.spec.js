import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';

import {ExistingResource} from '../../../photobank/components/ExistingResource';

Enzyme.configure({adapter: new Adapter()});

let bareProps = {
  addResourceToDownloads: null,
  updateResourceField: null,
  finished_presets: null,
  current_main: null,
  current_add: null,
  max_main: null,
  max_add: null,
  authorized: false,
  item_id: null,
  view: null,
  file: null,
};

let fileProps = {
  addResourceToDownloads: null,
  updateResourceField: null,
  finished_presets: [],
  current_main: null,
  current_add: null,
  max_main: null,
  max_add: null,
  authorized: false,
  item_id: null,
  view: null,
  file: {
    chunkPath:" ",
    comment:"00010598085",
    created_on:"25-10-2018 13:02:19",
    filename:"748ce62877d6f3026cb178742a7070c7.jpg",
    gid:78405,
    id:78405,
    is1c:true,
    isDefault:false,
    isDeleted:false,
    item:"00010598085",
    path:"/home/efimov/WORK/git/photobank_backend/private/uploads/00/01/05/98/08/5/748ce62877d6f3026cb178742a7070c7.jpg",
    preset:0,
    priority:2,
    size_bytes:172416,
    size_px:"1920/1080",
    src_filename:"00010598085_2.jpg",
    type:1,
    username:"user",
  },
};

function setup(props){
    const component = shallow(<ExistingResource {...props} />);
    return{
      props,
      component
    }
}

describe('ExistingResource', ()=>{
  describe('render',()=>{
    it('Компонент не рендерится без файла', ()=>{
      const {component} = setup(bareProps);
      expect(component.find(selectors.upload.EXISTING_RESOURCE_WRAPPER).exists()).toBe(false);
    });
    it('Компонент рендерится', ()=>{
      const {component} = setup(fileProps);
      expect(component.find(selectors.upload.EXISTING_RESOURCE_WRAPPER).exists()).toBe(true);
    });
    it('Компонент отображает информацию о ресусре и элементы управления', ()=>{
      const {component} = setup(fileProps);
      expect(component.find(".existing-files__file").exists()).toBe(true);
      expect(component.find(".file__file-name").exists()).toBe(true);
      expect(component.find(".file__thumbnail").exists()).toBe(true);
      expect(component.find(".existing-download-controls").exists()).toBe(true);
      expect(component.find(".edit-input").exists()).toBe(true);
      expect(component.find(".info__info-field.info-field.info__info-field--sizemb").exists()).toBe(true);
      expect(component.find(".info__info-field.info-field.info__info-field--uploaddate").exists()).toBe(true);
      expect(component.find(".info__info-field.info-field.info__info-field--username").exists()).toBe(true);
      expect(component.find(".info__info-field.info-field.info__info-field--comment").exists()).toBe(true);
      expect(component.find(".info__info-field.info-field.info__info-field--sizepx").exists()).toBe(true);
      expect(component.find(".file__file-src").exists()).toBe(true);
    });
  });
});
