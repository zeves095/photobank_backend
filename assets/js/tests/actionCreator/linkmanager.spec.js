import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../../account/link-manager/actionCreator';
import fetchMock from 'fetch-mock';
import Enzyme, {shallow} from 'enzyme';
import {mockFetchResponse, mockLinkmanagerStore} from '../mockdata/';

import * as constants from '../../account/link-manager/constants/';

const middleware = [thunk];
const mockStore = configureMockStore(middleware);

const mockId = 1;

describe('Actions', ()=>{
  afterEach(()=>{
      fetchMock.restore();
  });

  it('Инициализация linkmanager', ()=>{
    fetchMock.getOnce("/catalogue/resource/presets/",{
        body:mockFetchResponse.fetchPresetsBody,
        headers: { 'content-type': 'application/json' }
    });
    fetchMock.getOnce("/catalogue/resource/types/",{
        body:mockFetchResponse.fetchTypesBody,
        headers: { 'content-type': 'application/json' }
    });
    fetchMock.getOnce("/account/getinfo/",{
        body:mockFetchResponse.fetchUserInfoBody,
        headers: { 'content-type': 'application/json' }
    });
    fetchMock.get("/api/links/fetchall",{
        body:{},
        headers: { 'content-type': 'application/json' }
    });

    const expectedActions = [
      {
        type:constants.RESOURCE_PRESETS_FETCH+constants.SUCCESS,
        payload:mockFetchResponse.fetchPresetsBody
      },
      {
        type:constants.RESOURCE_TYPES_FETCH+constants.SUCCESS,
        payload:mockFetchResponse.fetchTypesBody
      },
      {
        type:constants.USER_INFO_FETCH+constants.SUCCESS,
        payload:mockFetchResponse.fetchUserInfoBody
      },
      {
        type:constants.LINK_FETCH+constants.START,
        payload:""
      },
    ];

    const store = mockStore(mockLinkmanagerStore);

    return store.dispatch(actions.init())
.then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Начало добавления ссылки', ()=>{
    const expectedAction ={
      type: constants.LINK_ADD,
      payload: ''
    };
    expect(actions.addLink()).toEqual(expectedAction);
  });

  it('Конец добавления ссылки', ()=>{
    const expectedAction ={
      type: constants.LINK_STOP_EDITING,
      payload: ''
    };
    expect(actions.stopEditing()).toEqual(expectedAction);
  });

  it('Получение превью для ресурсов', ()=>{
    fetchMock.postOnce("/catalogue/node/item/resource/thumbnails/",{
        body:mockFetchResponse.fetchThumbnailsBody,
        headers: { 'content-type': 'application/json' }
      });
    const expectedActions = [
      {
        type:constants.RESOURCE_THUMBNAIL+constants.SUCCESS,
        payload:mockFetchResponse.fetchThumbnailsBody
      },
    ];
    const store = mockStore(mockLinkmanagerStore);
    return store.dispatch(actions.getResourceThumbnails([1,2,3]))
.then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('Поиск ресурсов', ()=>{
    fetchMock.getOnce("/catalogue/search/resources",{
        body:mockFetchResponse.searchResourcesBody,
        headers: { 'content-type': 'application/json' }
    });
    fetchMock.postOnce("/catalogue/node/item/resource/thumbnails/",{
        body:mockFetchResponse.fetchThumbnailsBody,
        headers: { 'content-type': 'application/json' }
    });
    const expectedActions = [
      {
        type:constants.RESOURCE_SEARCH+constants.START,
        payload:""
      },
      {
        type:constants.RESOURCE_SEARCH+constants.SUCCESS,
        payload:mockFetchResponse.searchResourcesBody
      },
    ];
    const store = mockStore(mockLinkmanagerStore);
    return store.dispatch(actions.searchResources())
.then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('Выбор ресурса для добавления', ()=>{
    const expectedAction ={
      type: constants.RESOURCE_CHOICE,
      payload: mockId
    };
    expect(actions.chooseResource(mockId)).toEqual(expectedAction);
  });

  it('Добавление ресурса в список', ()=>{
    const expectedAction ={
      type: constants.RESOURCE_ADD,
      payload: mockId
    };
    expect(actions.addResourceToPool(mockId)).toEqual(expectedAction);
  });

  it('Исключение ресурса из списка', ()=>{
    const expectedAction ={
      type: constants.RESOURCE_REMOVE,
      payload: mockId
    };
    expect(actions.removeResourceFromPool(mockId)).toEqual(expectedAction);
  });

  it('Обнуление списка ресурсов', ()=>{
    const expectedAction ={
      type: constants.RESOURCE_REMOVE_ALL,
      payload: mockId
    };
    expect(actions.removeAllFromPool(mockId)).toEqual(expectedAction);
  });

  it('Удаление ссылки', ()=>{
    fetchMock.getOnce("/api/links/delete/1",{
        body:{},
        headers: { 'content-type': 'application/json' }
    });
    fetchMock.get("/api/links/fetchall",{
        body: [],
        headers: {}
    });
    const expectedActions = [
      {
        type:constants.LINK_DELETE+constants.START,
        payload:""
      },
      {
        type:constants.LINK_DELETE+constants.SUCCESS,
        payload:{}
      },
      {
        type:constants.LINK_FETCH+constants.START,
        payload:""
      },
    ];
    const store = mockStore(mockLinkmanagerStore);
    return store.dispatch(actions.deleteLink("1"))
.then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('Получение списка ссылок', ()=>{
    fetchMock.mock("/api/links/fetchall",{
        body: [],
        headers: { 'content-type': 'application/json' }
    });
    const expectedActions = [
      {
        type:constants.LINK_FETCH+constants.START,
        payload:""
      },
      {
        type:constants.LINK_FETCH+constants.SUCCESS,
        payload:[]
      },
    ];
    const store = mockStore(mockLinkmanagerStore);
    return store.dispatch(actions.fetchLinks())
.then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('Создание ссылки', ()=>{
    fetchMock.postOnce("/api/links/submit",{
        body: {},
        headers: { 'content-type': 'application/json' }
    });
    fetchMock.getOnce("/api/links/fetchall",{
        body: {},
        headers: { 'content-type': 'application/json' }
    });
    const expectedActions = [
      {
        type:constants.LINK_SUBMIT+constants.START,
        payload:""
      },
      {
        type:constants.LINK_SUBMIT+constants.SUCCESS,
        payload:{}
      },
      {
        type:constants.LINK_FETCH+constants.START,
        payload:""
      },
    ];
    const store = mockStore(mockLinkmanagerStore);
    return store.dispatch(actions.submitLink({}))
.then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('Обновление ссылки', ()=>{
    fetchMock.postOnce("/api/links/update/1",{
        body: {},
        headers: { 'content-type': 'application/json' }
    });
    fetchMock.getOnce("/api/links/fetchall",{
        body: {},
        headers: { 'content-type': 'application/json' }
    });
    const expectedActions = [
      {
        type:constants.LINK_UPDATE+constants.SUCCESS,
        payload:{"id": 1}
      },
      {
        type:constants.LINK_FETCH+constants.START,
        payload:""
      },
    ];
    const store = mockStore(mockLinkmanagerStore);
    return store.dispatch(actions.updateLink({},1))
.then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

});
