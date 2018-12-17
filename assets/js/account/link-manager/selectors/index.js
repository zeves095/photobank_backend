import {createSelector} from 'reselect';

export const resourceChosen = (store)=>store.resource.resource_chosen;
export const resourceArr = (store)=>store.resource.resources_found;
export const thumbArr = (store)=>store.resource.resources_thumbnails;
export const linkArr = (store)=>store.link.links_done;

export const getChosenResource = createSelector(resourceChosen, linkArr, (chosen, links)=>{
  let res_chosen = chosen.map((res)=>{
    let targLinks = links.filter((link)=>{return link.resource_id === res.id});
    if(targLinks.length>0){
      res.link_exists = true;
      res.link_targets = targLinks.map((link)=>{return link.target});
    }else{
      res.link_exists = false;
      res.link_targets = [];
    }
    return res;
  });
  return res_chosen;
});

export const getLinkTargets = createSelector(linkArr, (list)=>{
  return Array.from(new Set(list.filter((item)=>item.target!==''&&item.target!==null).map((item)=>{if(item.target===''){return null}return item.target;})));
});

export const getResourcesWithThumbnails = createSelector(resourceArr, thumbArr, (list, thumbs)=>{
  return list.map((item)=>{
    let th = thumbs.find((thumb)=>thumb.id === item.id);
    if(typeof th !== 'undefined'){
      item['thumbnail'] = th.thumb_id;
    }
    return item
  });
});
