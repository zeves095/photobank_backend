import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';
import utility from '../../../photobank/services/UtilityService';
import {ResourceService} from '../../../services/ResourceService';

import {DownloadPool} from '../../../photobank/components/DownloadPool';

Enzyme.configure({adapter: new Adapter()});

  let bareProps = {
    resources: [],
    downloads: [],
    clearDownloads: ()=>{},
    getDownloadResourceData: ()=>{},
    removeDownload: ()=>{},
  };

  let resourcesProps = {
    resources: [78399,78397],
    downloads:[
      {
        id: 78399,
        preset: 'thumbnail',
        name: '00010598080_2.jpg',
        sizepx: '1920/1080'
      },
      {
        id: 78397,
        preset: 'thumbnail',
        name: '00010598079_2.jpg',
        sizepx: '1920/1080'
      }
    ],
    clearDownloads: ()=>{},
    getDownloadResourceData: ()=>{},
    removeDownload: ()=>{},
  };

  function setup(props){
    const component = shallow(<DownloadPool {...props} />);
    return{
      props,
      component
    }
  }

  describe('DownloadPool', ()=>{
    describe('render',()=>{
      it('Компонент рендерится', ()=>{
        const {component} = setup(bareProps);
        expect(component.text()==="Нет загрузок").toBe(true);
      });
      it('Отображаются загрузки', ()=>{
        console.log(ResourceService);
        const spy = jest.spyOn(ResourceService, '_getLinkById').mockImplementation(() => "link");
        const {component} = setup(resourcesProps);
        expect(component.find(selectors.upload.DOWNLOAD_LIST_ITEM)).toHaveLength(resourcesProps.downloads.length);
      });
    });
  }, ()=>{
    expect(component.text()==="Нет загрузок").toBe(true);});
