import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const existingResources = (store,props)=>store.resource.get('resources_existing');
export const finishedPresets = (store,props)=>store.resource.get('finished_presets');
export const resourceId = (store,props)=>props.file.id||null;
export const itemId = (store,props)=>props.item_id||null;

export const getExisting = createSelector(existingResources,(existing)=>{
  return existing.toArray();
});

export const getFinishedPresets = createSelector(finishedPresets, resourceId, (finished, id)=>{
  let response = finished;
  if(id){
    response = response.filter(preset=>{
      return preset.resource===id;
    }).map(preset=>{
      preset.link = window.config['resource_url']+ preset.id+".jpg";
      return preset;
    });
  }
  return response.toArray();
});

export const getMaxMainResources = createSelector(()=>{
  return window.config.max_main_resources;
});

export const getMaxAddResources = createSelector(()=>{
  return window.config.max_additional_resources;
});

export const getCurrentMainResources = createSelector(existingResources, itemId, (existing, id)=>{
  return existing.filter(resource=>{
    return resource.type===1&&resource.item===id;
  }).size;
});

export const getCurrentAddResources = createSelector(existingResources, itemId, (existing, id)=>{
  return existing.filter(resource=>{
    return resource.type===2&&resource.item===id;
  }).size;
});
