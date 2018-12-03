import {createSelector} from 'reselect';

export const resourceId = (store)=>store.resource.resource_chosen;
export const resourceArr = (store)=>store.resource.resources_found;

export const  getChosenResource = createSelector(resourceId, resourceArr, (id, list)=>{
  return list.find((el)=>el.id===id);
});
