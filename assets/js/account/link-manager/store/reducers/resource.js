import { RESOURCE_SEARCH, RESOURCE_CHOICE, RESOURCE_THUMBNAIL, SUCCESS } from '../../constants'

let defaultState = {
  resources_found:[],
  resource_chosen:''
}

let mockData = [
  {
    id:"1",
    code_1c:"00000000000"
  },
  {
    id:"2",
    code_1c:"00000000001"
  },
  {
    id:"3",
    code_1c:"00000000002"
  }
]

export default (resource = defaultState, action) => {
    switch(action.type){
      case RESOURCE_SEARCH+SUCCESS:
        resource = {...resource, resources_found:action.payload};
        break;
      case RESOURCE_CHOICE:
        let id = action.payload;
        resource = {...resource, resource_chosen:id};
        break;
      case RESOURCE_THUMBNAIL+SUCCESS:
        let found = resource.resources_found;
        action.payload.forEach((actionResource)=>{
          let resourceIndex = found.findIndex((resource)=>{
            return resource.id === actionResource.id;
          });
          found[resourceIndex] = {...found[resourceIndex], thumbnail:actionResource.thumbnail};
        });
        found = found.slice();
        resource = {...resource, resources_found:found};
    }
    return resource;
}
