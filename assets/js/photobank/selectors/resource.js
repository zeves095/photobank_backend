import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const existingResources = (store)=>store.resource.get('resources_existing');
export const finishedPresets = (store)=>store.resource.get('finished_presets');

export const getExisting = createSelector(existingResources,(existing)=>{
  return existing.toArray();
});

export const getFinishedPresets = createSelector(finishedPresets,(finished)=>{
  return finished.toArray();
});
