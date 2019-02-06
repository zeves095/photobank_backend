import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../../photobank/actionCreator';
import fetchMock from 'fetch-mock';
import Enzyme, {shallow} from 'enzyme';
import {mockUploadStore, mockUploadFetchResponse, mockConfig, LocalStorageMock} from '../mockdata/';
import utility from '../../photobank/services/UtilityService';
import {ItemQueryObject, UploadService, LocalStorageService, CatalogueService} from '../../photobank/services/';

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
    utility.initLocalstorage();
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
    fetchMock.getOnce(utility.config.get_nodes_url+responses[0][0].id,{
      body: [],
      headers: { 'content-type': 'application/json' },
    });
    responses.forEach(response=>{
      fetchMock.getOnce(utility.config.get_nodes_url+(response[0].parent),{
        body: (response),
        headers: { 'content-type': 'application/json' },
      });
    });
    nodeResponses.forEach(response=>{
      fetchMock.getOnce('/catalogue/node/'+(response.id),{
        body: (response),
        headers: { 'content-type': 'application/json' },
      });
    });
    fetchMock.getOnce(utility.config.get_nodes_url,{
      body: (responses.slice(-1)[0][0]),
      headers: { 'content-type': 'application/json' },
    });
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

  it('Получение списка дочерних разделов каталога', ()=>{

    let cat_data = mockUploadStore.catalogue.catalogue_data;
    let firstId = cat_data[0].id;
    let children = cat_data.filter(node=>node.parent = firstId);

    fetchMock.getOnce(utility.config.get_nodes_url+firstId,{
        body: JSON.stringify(children),
        headers: { 'content-type': 'application/json' }
    });

    let expectedActions = [
      {
        type:  constants.CATALOGUE_DATA_FETCH+constants.START,
        payload: ''
      },
      {
        type:  constants.CATALOGUE_DATA_FETCH+constants.SUCCESS,
        payload: children
      }
    ];

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.fetchNodes(firstId,cat_data)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Выбор активного раздела каталога', ()=>{

    let cat_data = mockUploadStore.catalogue.catalogue_data;
    let items = mockUploadStore.catalogue.items;
    let node = cat_data.filter(node=>items.map(item=>item.node).includes(node.id))[0];
    let subnodes = cat_data.filter(node=>node.parent===node.id);
    let chosen_items = items.filter(item=>item.node===node.id);

    fetchMock.getOnce(utility.config.get_items_url+node.id,{
        body: JSON.stringify(chosen_items),
        headers: { 'content-type': 'application/json' }
    });

    fetchMock.getOnce(utility.config.get_nodes_url+node.id,{
        body: JSON.stringify(subnodes),
        headers: { 'content-type': 'application/json' }
    });

    let expectedActions = [
      {
        type:  constants.ITEMS_FETCH+constants.START,
        payload: ""
      },
      {
        type:  constants.LOCAL_STORAGE_VALUE_SET,
        payload: {key:"current_node", value:node.id}
      },
      {
        type:  constants.CATALOGUE_DATA_FETCH+constants.START,
        payload: ''
      },
      {
        type:  constants.CATALOGUE_DATA_FETCH+constants.SUCCESS,
        payload: subnodes
      },
      {
        type:  constants.ITEMS_FETCH+constants.SUCCESS,
        payload: chosen_items
      },
      {
        type:  constants.NODE_CHOICE,
        payload: node.id
      },
    ];

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.chooseNode(node.id, cat_data)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Получение списка существующих ресурсов для товара', ()=>{

    let cat_data = mockUploadStore.catalogue.catalogue_data;
    let items = mockUploadStore.catalogue.items;
    let resources = mockUploadStore.resource.resources_existing;
    let item = items.filter(item=>resources.map(resource=>resource.item).includes(item.id))[0];
    let chosen_resources = resources.filter(resource=>resource.item===item.id);

    fetchMock.getOnce(utility.config.existing_uploads_url+item.id,{
        body: JSON.stringify(chosen_resources),
        headers: { 'content-type': 'application/json' }
    });

    let expectedActions = [
      {
        type:  constants.EXISTING_RESOURCES_FETCH+constants.START,
        payload: ""
      },
      {
        type:  constants.EXISTING_RESOURCES_FETCH+constants.SUCCESS,
        payload: chosen_resources
      },
    ];

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.fetchExisting(item.id)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Получение списка обработанных пресетов для отображаемых ресурсов', ()=>{

    let cat_data = mockUploadStore.catalogue.catalogue_data;
    let items = mockUploadStore.catalogue.items;
    let resources = mockUploadStore.resource.resources_existing;
    let item = items.filter(item=>resources.map(resource=>resource.item).includes(item.id))[0];
    let chosen_resources = resources.filter(resource=>resource.item===item.id);
    let pagination = {start:0, end:5};

    let result = [];

    for(let i = pagination.start; i<pagination.end; i++){
      for(let j = 0; j<utility.config.presets.length; j++){
        fetchMock.getOnce(utility.config.resource_url+resources[i]+"/"+j,{
          body: JSON.stringify(resource[0]),
          headers: { 'content-type': 'application/json' }
        });
        result.push({id:resource[0].id, resource:resource[0].gid, preset:resource[0].preset});
      }
    }


    let expectedActions = [
      {
        type:  constants.EXISTING_PRESETS_FETCH+constants.START,
        payload: ""
      },
      {
        type:  constants.EXISTING_PRESETS_FETCH+constants.SUCCESS,
        payload: result
      },
    ];

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.fetchPresets(resources,pagination)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Выбор активного товара', ()=>{

    let items = mockUploadStore.catalogue.items;
    let itemId = items[0].id;

    let expectedActions = [
      {
        type:  constants.RESUMABLE_PUSH,
        payload: itemId
      },
      {
        type:constants.PURGE_EMPTY_ITEMS,
        payload: ""
      },
      {
        type:constants.LOCAL_STORAGE_VALUE_SET,
        payload: {key:"current_item", value:itemId}
      },
      {
        type: constants.ITEM_CHOICE,
        payload: itemId
      }
    ];

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.chooseItem(itemId)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Получение списка товаров по разделу каталога', ()=>{

    let cat_data = mockUploadStore.catalogue.catalogue_data;
    let items = mockUploadStore.catalogue.items;
    let resources = mockUploadStore.resource.resources_existing;
    let node = cat_data.filter(node=>items.map(item=>item.node).includes(node.id))[0];
    let child_items = items.filter(item=>item.node===node.id);

    fetchMock.getOnce(utility.config.get_items_url+node.id,{
      body: JSON.stringify(child_items),
      headers: { 'content-type': 'application/json' }
    });

    let expectedActions = [
      {
        type: constants.ITEMS_FETCH+constants.START,
        payload: ''
      },
      {
        type: constants.ITEMS_FETCH+constants.SUCCESS,
        payload: child_items
      },
    ];

    let qo = new ItemQueryObject();
    qo.nodeId = node.id;

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.fetchItems(qo)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Удаление записи о загрузке', ()=>{

    let unfinished = mockUploadStore.upload.uploads_unfinished;
    let upload = unfinished[0];

    let hash = upload.filehash;
    let item = upload.id;

    fetchMock.postOnce(utility.config.remove_upload_url,200);

    let expectedActions = [
      {
        type: constants.UPLOAD_DELETE,
        payload: {hash,item}
      },
    ];

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.deleteUpload(hash, item)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Удаление готовых к отправке файлов', ()=>{

    let resumable = mockUploadStore.upload.resumable_container.find(resumable=>resumable.instance.files.length>0);
    let pending = resumable.instance.files;
    let item = resumable.id;

    fetchMock.post(utility.config.remove_upload_url,200);

    let expectedActions = [];
    pending.forEach(upload=>{
      expectedActions.push({
        type: constants.UPLOAD_DELETE,
        payload: {hash:upload.uniqueIdentifier, item}
      });
    });

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.deletePendingUploads(item, pending)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Удаление всех записей о незаконченных загрузках для товара', ()=>{

    let unfinished = mockUploadStore.upload.uploads_unfinished;
    let item = unfinished[0].id;
    let itemUnfinished = unfinished.filter(upload=>upload.id===item);

    fetchMock.post(utility.config.remove_upload_url,200);

    let expectedActions = [];
    itemUnfinished.forEach(upload=>{
      expectedActions.push({
        type: constants.UPLOAD_DELETE,
        payload: {hash:upload.file_hash, item}
      });
    })

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.deleteUnfinishedUploads(itemUnfinished,item)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Установка значения переменной localstorage', ()=>{

    let key = "current_item";
    let value = mockUploadStore.catalogue.items[0].id;

    let expectedAction = {
      type: constants.LOCAL_STORAGE_VALUE_SET,
      payload: {key,value}
    };

    return expect(actions.setLocalValue(key,value)(value=>value)).toEqual(expectedAction);

  });

  it("Добавление к списку localstorage", ()=>{
    let key = "pending_downloads";
    let existing_data = LocalStorageService.getList(key);
    let download = "123";

    let expectedAction = {
      type: constants.LOCAL_STORAGE_VALUE_SET,
      payload: {key, value:[download]}
    };

    return expect(actions.addToLocalValue(key,download)(value=>value)).toEqual(expectedAction);
  });

  it("Удаление из списка localstorage", ()=>{

    let key = "pending_downloads";
    let download = "123";
    LocalStorageService.addTo(key, download);

    let expectedAction = {
      type: constants.LOCAL_STORAGE_VALUE_SET,
      payload: {key, value:[]}
    };

    return expect(actions.spliceFromLocalValue(key,download)(value=>value)).toEqual(expectedAction);

  });

  it("Сброс списка загрузок", ()=>{

    let key = "pending_downloads";
    let downloads = ["123","124","125"];
    downloads.forEach(dl=>{
      LocalStorageService.addTo(key, dl);
    });
    let expectedAction = {
      type: constants.LOCAL_STORAGE_VALUE_SET,
      payload: {key, value:[]}
    };
    return expect(actions.clearDownloads()(value=>value)).toEqual(expectedAction);

  });

  it("Получение значений localstorage", ()=>{
    let key = "pending_downloads";
    let downloads = ["123","124","125"];
    downloads.forEach(dl=>{
      LocalStorageService.addTo(key, dl);
    });
    let localData = LocalStorageService.get();
    let expectedAction = {
      type: constants.LOCAL_STORAGE_VALUE_SET+constants.ALL,
      payload: localData
    };
    return expect(actions.getLocalStorage()(value=>value)).toEqual(expectedAction);
  });

  it("Выбор представления загрузок и ресурсов", (id=1)=>{
    let key = "list_view_type";
    let viewType = "3";
    let expectedAction = {
      type: constants.LOCAL_STORAGE_VALUE_SET,
      payload: {key, value:viewType}
    };
    return expect(actions.chooseListViewType(viewType)(value=>value)(value=>value)).toEqual(expectedAction);
  });

  it("Выбор представления каталога", ()=>{
    let key = "catalogue_view";
    let viewType = "3";
    let expectedAction = {
      type: constants.LOCAL_STORAGE_VALUE_SET,
      payload: {key, value:viewType}
    };
    return expect(actions.chooseCatalogueViewType(viewType)(value=>value)(value=>value)).toEqual(expectedAction);
  });

  it("Удаление неактивных товаров из контейнера resumable", ()=>{
    let expectedAction =  {
      type: constants.PURGE_EMPTY_ITEMS,
      payload: ""
    };
    return expect(actions.purgeEmptyItems()).toEqual(expectedAction);
  });

  it('Получение данных о пользователе', ()=>{

    let uid = 2;
    let userData = {
      user_active: true,
      user_email: "efimov@domfarfora.ru",
      user_id: uid,
      user_name: "efimov",
      user_password: "s3cr3t",
      user_roles: ["ROLE_SUPER_ADMIN"],
    }

    fetchMock.getOnce("/account/getinfo/",{
      body: JSON.stringify(userData),
      headers: { 'content-type': 'application/json' }
    });

    let expectedActions = [
      {
        type: constants.USER_INFO_FETCH+constants.SUCCESS,
        payload: userData
      }
    ];
    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.getUserInfo()).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Получение данных о товаре', ()=>{

    let itemId = mockUploadStore.catalogue.items[0].id;
    let itemData = mockUploadStore.catalogue.items[0];

    fetchMock.getOnce("/catalogue/node/item/"+itemId,{
      body: JSON.stringify(itemData),
      headers: { 'content-type': 'application/json' }
    });

    let expectedActions = [
      {
        type: constants.ITEM_INFO_FETCH+constants.SUCCESS,
        payload: itemData
      }
    ];
    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.fetchItemData(itemId)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it("Добавление ресурса к списку загрузок", ()=>{
    let key = "pending_downloads";
    let existing_data = LocalStorageService.getList(key);
    let download = "123";

    let expectedAction = {
      type: constants.LOCAL_STORAGE_VALUE_SET,
      payload: {key, value:[download]}
    };

    return expect(actions.addResourceToDownloads(download)(value=>value)(value=>value)).toEqual(expectedAction);
  });

  it("Обновление информации о ресурсе", ()=>{

    let resource = mockUploadStore.resource.resources_existing[0];
    let file = {
      id:resource.id,
      type:resource.type
    };
    let itemId = file.item;
    let resources = mockUploadStore.resource.resources_existing.filter(resource=>resource.item===itemId);

    fetchMock.patchOnce(utility.config.resource_url+file.id, 200);
    fetchMock.getOnce(utility.config.existing_uploads_url+itemId,{
        body: JSON.stringify(resources),
        headers: { 'content-type': 'application/json' }
    });

    let expectedActions = [
      {
        type:  constants.EXISTING_RESOURCES_FETCH+constants.START,
        payload: ""
      },
    ];

    const store = mockStore(mockUploadStore);

    let params = {
      file,
      type:3,
      item:itemId
    }

    return store.dispatch(actions.updateResourceField(params)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it("Поиск товаров", ()=>{

    let searchFields = {
      name: "Кружка",
      code: "",
      parent_name: "Каталог",
      search_nested: 1,
      article: ""
    }

    let allItems = mockUploadStore.catalogue.items;

    let getParams = "?"+Object.keys(searchFields).map(key=>{return "item_search_"+key+"="+searchFields[key]}).join("&");

    fetchMock.getOnce(utility.config.item_search_url+getParams,{
      body: JSON.stringify(allItems),
      headers: { 'content-type': 'application/json' }
    });

    let expectedActions = [
      {
        type:  constants.ITEMS_FETCH+constants.START,
        payload: ""
      },
      {
        type:  constants.ITEMS_FETCH+constants.SUCCESS,
        payload: allItems
      },
    ];

    const store = mockStore(mockUploadStore);

    return store.dispatch(actions.searchItems(searchFields)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it("Получение хлебных крошек", ()=>{

    let cat_data = mockUploadStore.catalogue.catalogue_data;
    let node = cat_data[0];

    let expectedAction = {
      type: constants.CRUMBS_UPDATE,
      payload: CatalogueService.getCrumbs(cat_data, node.id)
    };

    return expect(actions.pushCrumbs(cat_data, node.id)).toEqual(expectedAction);
  });

  it("Удаление ресурса из списка загрузок", ()=>{

    let key = "pending_downloads";
    let download = "123";
    LocalStorageService.addTo(key, download);

    let expectedAction = {
      type: constants.LOCAL_STORAGE_VALUE_SET,
      payload: {key, value:[]}
    };

    return expect(actions.removeDownload(download)(value=>value)(value=>value)).toEqual(expectedAction);

  });

});
