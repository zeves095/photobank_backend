import * as selectors from '../../account/link-manager/selectors/index.js';
import {mockLinkmanagerStore, mockResourcesChosen} from '../mockdata';
import {createSelector} from 'reselect';
import {store} from '../../account/link-manager/store';

describe('Селекторы redux работают корректно',()=>{
  it('Получение списка выбранных ресурсов',()=>{
    let results = selectors.getChosenResource(mockLinkmanagerStore);
    for(let i = 0; i<results.length; i++){
      expect(results[i]).toHaveProperty('link_targets');
      expect(results[i]).toHaveProperty('link_exists');
    }
  });
  it('Получение списка групп ссылок',()=>{
    let results = selectors.getLinkTargets(mockLinkmanagerStore);
    let mockTargets = [];
    for(let i = 0; i<mockLinkmanagerStore.link.links_done.length; i++){
      if(mockLinkmanagerStore.link.links_done[i].target !== null){
        mockTargets.push(mockLinkmanagerStore.link.links_done[i].target);
      }
    }
    mockTargets = Array.from(new Set(mockTargets));
    expect(results).toEqual(mockTargets);
  });
  it('Получение id превью ресурсов',()=>{
    let results = selectors.getResourcesWithThumbnails(mockLinkmanagerStore);
    let resources_thumbnails = mockLinkmanagerStore.resource.resources_thumbnails;
    for(let i = 0; i<resources_thumbnails.length; i++){
      let res_thumb = results.find((res)=>(res.thumbnail === resources_thumbnails[i].thumb_id && res.id === resources_thumbnails[i].id));
      expect(typeof res_thumb).not.toBe('undefined');
    }
  });
});
