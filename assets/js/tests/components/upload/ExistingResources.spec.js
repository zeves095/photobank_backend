import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';
import utility from '../../../photobank/services/UtilityService';
import {ExistingResources} from '../../../photobank/components/ExistingResources';

Enzyme.configure({adapter: new Adapter()});

utility.initLocalstorage();

let bareProps = {
  fetchPresets:()=>{},
  fetchExisting:()=>{},
  default_view:null,
  existing:[],
  item_id:null,
  default_view:null,
  need_refresh:null,
  loading:null,
};

let existingProps = {
  fetchPresets:()=>{},
  fetchExisting:()=>{},
  default_view:null,
  existing:[{
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
  }],
  item_id:"00010598085",
  default_view:null,
  need_refresh:null,
  loading:false,
};

function setup(props){
    const component = shallow(<ExistingResources {...props} />);
    return{
      props,
      component
    }
}

describe('ExistingResources', ()=>{
  describe('render',()=>{
    it('Компонент рендерится', ()=>{
      const {component} = setup(existingProps);
      expect(component.find(selectors.upload.EXISTING_RESOURCES_WRAPPER).exists()).toBe(true);
    });
    it('Компонент отображает вложенный компонент', ()=>{
      const {component} = setup(existingProps);
      expect(component.find(selectors.components.EXISTING_RESOURCE_COMPONENT).exists()).toBe(true);
    });
  });
});
