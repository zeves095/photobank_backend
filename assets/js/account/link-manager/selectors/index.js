import {createSelector} from 'reselect';

export const resourceChosen = (store)=>store.resource.resource_chosen;
export const resourceArr = (store)=>store.resource.resources_found;

export const linkArr = (store)=>store.link.links_done;

export const  getChosenResource = createSelector(resourceChosen, resourceArr, (chosen, list)=>{
  return list.filter((el)=>chosen.includes(el.id));
});

export const getLinkTargets = createSelector(linkArr, (list)=>{
  return Array.from(new Set(list.filter((item)=>item.target!=="").map((item)=>{if(item.target===''){return null}return item.target;})));
});
