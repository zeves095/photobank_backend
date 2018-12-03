import { SUCCESS, FAIL } from '../../constants';
import { fetchLinks } from '../../actionCreator';

export default (store) => (next) => (action) => {
  const{meta, type, payload} = action;
  if(typeof meta === 'undefined'){next(action);return;}
  let params = {method:meta.api.method};
  let fetchUrl = meta.api.url;
  if(meta.api.method === "POST"){
    params.headers = {
      "Content-Type": "application/json; charset=utf-8",
    };
    params.body = JSON.stringify(payload);
  }else if(meta.api.method == "GET"){
    fetchUrl = meta.api.url+"?"+Object.keys(payload).map(key=>key + '=' + payload[key]).join('&');
  }
  fetch(fetchUrl, params)
  .then((response) => response.json())
  .then((response) => {
    store.dispatch({
      type: type+SUCCESS,
      payload: response
    });
    if(type == LINK_FETCH){
      store.dispatch(fetchLinks());
    }
  })
  .catch((error) =>{
    store.dispatch({
      type: type+FAIL,
      payload: error
    })
  }
  )
}
