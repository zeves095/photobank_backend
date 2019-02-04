import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../../photobank/actionCreator';
import fetchMock from 'fetch-mock';
import Enzyme, {shallow} from 'enzyme';
import {mockUploadStore, mockUploadFetchResponse, mockConfig} from '../mockdata/';
import utility from '../../photobank/services/UtilityService';

import * as constants from '../../photobank/constants/';

const middleware = [thunk];
const mockStore = configureMockStore(middleware);

const mockId = 1;

describe('Actions', ()=>{
  beforeEach(()=>{
    fetchMock.getOnce("/upload/config",{
      body: JSON.stringify(mockConfig),
      headers: { 'content-type': 'application/json' }
    });
    return utility.fetchConfig();
  });

  afterEach(()=>{
      fetchMock.restore();
  });

  it('Получение списка незаконенных загрузок', ()=>{
    fetchMock.getOnce(utility.config.unfinished_uploads_url,{
        body: JSON.stringify(mockUploadFetchResponse.unfinishedUploads),
        headers: { 'content-type': 'application/json' }
    });

    let expectedActions = [
      {
        type:  constants.UPLOADS_UNFINISHED_FETCH+constants.START,
        payload: ''
      },
      {
        type:  constants.UPLOADS_UNFINISHED_FETCH+constants.SUCCESS,
        payload: mockUploadFetchResponse.unfinishedUploads
      }
    ];

    mockUploadFetchResponse.unfinishedUploads.forEach(upload=>{
      expectedActions.push({
        type:  constants.RESUMABLE_PUSH,
        payload: upload.id
      });
    });

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.fetchUnfinished()).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Добавление resumable в контейнер', ()=>{
    let id = 1;
    const expectedAction = {
      type: constants.RESUMABLE_PUSH,
      payload: id
    };
    expect(actions.pushResumable(id)).toEqual(expectedAction);
  });

  it('Чистка неактивных товаров', ()=>{
    const expectedAction = {
      type: constants.PURGE_EMPTY_ITEMS,
      payload: ""
    };
    expect(actions.purgeEmptyItems()).toEqual(expectedAction);
  });

  it('Получение структуры каталога до корневой директории', ()=>{
    let nodes = ["00010594588","00010537972","00010533714","00000000000"];
    let nodeResponses = [
      {"id":nodes[0],"name":"\u0410\u043d\u0442\u0430\u0440\u0435\u0441 \u0422\u0440\u0435\u0439\u0434","parent":nodes[1],"children":["00010537973","00010559346","00010580834","00010588806","00010592967","00010594588","00010596759","00010597345","00010632551"]},
      {"id":nodes[1],"name":"\u0410\u043d\u0442\u0430\u0440\u0435\u0441 \u0422\u0440\u0435\u0439\u0434","parent":nodes[2],"children":["00010537973","00010559346","00010580834","00010588806","00010592967","00010594588","00010596759","00010597345","00010632551"]},
      {"id":nodes[2],"name":"\u0410\u043d\u0442\u0430\u0440\u0435\u0441 \u0422\u0440\u0435\u0439\u0434","parent":nodes[3],"children":["00010537973","00010559346","00010580834","00010588806","00010592967","00010594588","00010596759","00010597345","00010632551"]},
      {"id":nodes[3],"name":"\u0410\u043d\u0442\u0430\u0440\u0435\u0441 \u0422\u0440\u0435\u0439\u0434","parent":null,"children":["00010537973","00010559346","00010580834","00010588806","00010592967","00010594588","00010596759","00010597345","00010632551"]},
    ];
    let responses = nodeResponses.map(response=>{
      response.items_count = 12;
      return [response];
    });
    responses.forEach(response=>{
      console.log(response);
      fetchMock.get(utility.config.get_nodes_url+(response[0].id!==nodes.slice(-1)[0]&&response[0].id),{
        body: JSON.stringify(response[0]),
        headers: { 'content-type': 'application/json' }
      });
    });
    fetchMock.get(utility.config.get_nodes_url,{
      body: JSON.stringify(responses.slice(-1)[0][0]),
      headers: { 'content-type': 'application/json' }
    });
    nodes.forEach(node=>{
      fetchMock.getOnce("/catalogue/node/"+node,{
        body: JSON.stringify(nodeResponses[0]),
        headers: { 'content-type': 'application/json' }
      });
    });
    //let mockResponse = nodeResponses.map(response=>response[0]);
    //console.log(mockResponse);
    let expectedActions = [
      {type:  constants.CATALOGUE_ROOT_NODES_FETCH+constants.START,
        payload: nodes[0]},
      {type:  constants.CATALOGUE_ROOT_NODES_FETCH+constants.SUCCESS,
        payload: nodeResponses},
    ];
    const store = mockStore(mockUploadStore);
    return store.dispatch(actions.fetchRootNodes(nodes[0])).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

});
