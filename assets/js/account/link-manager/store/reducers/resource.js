import { RESOURCE_SEARCH,
  RESOURCE_CHOICE,
  RESOURCE_THUMBNAIL,
  RESOURCE_ADD,
  RESOURCE_REMOVE,
  RESOURCE_PRESETS_FETCH,
  RESOURCE_TYPES_FETCH,
  SUCCESS
} from '../../constants'

let defaultState = {
  resources_found:[],
  resources_thumbnails:[],
  resource_chosen:[],
  resource_types:[],
  resource_presets:[]
}

export default (resource = defaultState, action) => {
    let resPool = resource.resource_chosen;
    switch(action.type){
      case RESOURCE_SEARCH+SUCCESS:
        resource = {...resource, resources_found:action.payload};
        break;
      case RESOURCE_CHOICE:
        let id = action.payload;
        resource = {...resource, resource_chosen:id};
        break;
      case RESOURCE_PRESETS_FETCH+SUCCESS:
        resource = {...resource, resource_presets:action.payload};
        break;
      case RESOURCE_TYPES_FETCH+SUCCESS:
        resource = {...resource, resource_types:action.payload};
        break;
      case RESOURCE_ADD:
        let addingResource = resource.resources_found.find((res)=>res.id===action.payload);
        resPool.push(addingResource);
        resPool = resPool.slice();
        resource = {...resource, resource_chosen:resPool};
        break;
      case RESOURCE_REMOVE:
        let removingResource = resource.resources_found.find((res)=>res.id===action.payload);
        resPool.pop(removingResource);
        resPool = resPool.slice();
        resource = {...resource, resource_chosen:resPool};
        break;
      case RESOURCE_THUMBNAIL+SUCCESS:
        // let found = resource.resources_found;
        // action.payload.forEach((actionResource)=>{
        //   let resourceIndex = found.findIndex((resource)=>{
        //     return resource.id === actionResource.id;
        //   });
        //   found[resourceIndex] = {...found[resourceIndex], thumbnail:actionResource.thumb_id};
        // });
        // found = found.slice();
        // console.log(found);
        resource = {...resource, resources_thumbnails:Array.from(new Set(action.payload.concat(resource.resources_thumbnails)))};
    }
    return resource;
}
