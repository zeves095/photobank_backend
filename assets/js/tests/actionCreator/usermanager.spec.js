import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../../usermanager/actionCreator';
import fetchMock from 'fetch-mock';
import Enzyme, {shallow} from 'enzyme';
import {mockUsermanagerStore, mockConfig} from '../mockdata/';
import utility from '../../photobank/services/UtilityService';
import {UserService} from '../../usermanager/services/UserService';

import * as constants from '../../usermanager/constants/';

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

  it('Получение списка пользователей', ()=>{

    let users = mockUsermanagerStore.user.users;

    fetchMock.getOnce(utility.config.user_get_url,{
        body:users,
        headers: { 'content-type': 'application/json' }
    });

    const expectedActions = [
      {
        type:constants.FETCH_USERS+constants.START,
        payload:""
      },
      {
        type:constants.FETCH_USERS+constants.SUCCESS,
        payload:users
      }
    ];

    const store = mockStore(mockUsermanagerStore);

    return store.dispatch(actions.fetchUsers()).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

  it('Выбор пользователя', ()=>{
    let user = mockUsermanagerStore.user.users[0];
    let expectedAction = {
      type:constants.CHOOSE_USER,
      payload:user
    };
    return expect(actions.chooseUser(user)(value=>value)).toEqual(expectedAction);
  });

  it('Добавление пользователя', ()=>{
    let users = mockUsermanagerStore.user.users;
    let newUser = UserService.getBlankUser(users);
    let expectedAction = {
      type:constants.ADD_USER,
      payload:newUser
    };
    return expect(actions.addUser(users)(value=>value)).toEqual(expectedAction);
  });

  it('Получение списка пользователей', ()=>{

    let users = mockUsermanagerStore.user.users;
    let user = users[0];

    fetchMock.postOnce(utility.config.user_set_url,200);
    fetchMock.getOnce(utility.config.user_get_url,{
        body:users,
        headers: { 'content-type': 'application/json' }
    });

    const expectedActions = [
      {
        type: constants.SUBMIT_USER+constants.START,
        payload: user.id
      },
      {
        type:constants.SUBMIT_USER+constants.SUCCESS,
        payload: user
      },
      {
        type:constants.FETCH_USERS+constants.START,
        payload:""
      }
    ];

    const store = mockStore(mockUsermanagerStore);

    return store.dispatch(actions.submitUser(user)).then(()=>{
      expect(store.getActions()).toEqual(expectedActions);
    });

  });

});
