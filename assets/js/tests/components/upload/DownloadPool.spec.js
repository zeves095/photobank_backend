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
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {selectors} from '../../constants';
import fetchMock from 'fetch-mock';
import utility from '../../../photobank/services/UtilityService';
import {mockConfig} from '../../mockdata/';

import {DownloadPool} from '../../../photobank/components/DownloadPool';

Enzyme.configure({adapter: new Adapter()});

jest.useFakeTimers();

fetchMock.getOnce("/upload/config",{
  body: JSON.stringify(mockConfig),
  headers: { 'content-type': 'application/json' }
});

utility.fetchConfig();

  let resources = ["1","2","3"];
  let resData = {
    id: 1,
    preset: 1,
    src_filename: "asd",
    size_px: "1/1",
  };
  resources.forEach(res=>{
    let data = resData;
    data.id=res;
    fetchMock.getOnce('/catalogue/node/item/resource/'+res, {
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' }
    });
  });

  let bareProps = {
    resources: [],
    clearDownloads: ()=>{},
    removeDownload: ()=>{},
  };

  let resourcesProps = {
    resources,
    clearDownloads: ()=>{},
    removeDownload: ()=>{},
  };

  function setup(props){
    const component = mount(<DownloadPool {...props} />);
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
        const {component} = setup(bareProps);
        component.setProps(resourcesProps);
        component.update();
      });
    });
  }, ()=>{
    expect(component.text()==="Нет загрузок").toBe(true);});
