export {
  mockResourcesFound,
  mockResourcesChosen,
  mockLinksDone,
  mockLinkmanagerStore,
  mockFetchRequestData,
  mockFetchResponse,
  userList,
} from './linkmanager';

export {
  mockUploadStore,
  mockUploadFetchResponse
} from './upload';

export {
  mockUsermanagerStore
} from './usermanager';

export {LocalStorageMock} from './LocalStorageMock';

export let mockConfig = {
  commit_upload_url: "/api/upload/commit",
  existing_uploads_url: "/catalogue/node/item/resources/",
  get_items_url: "/catalogue/node/items/",
  get_nodes_url: "/catalogue/nodes/",
  item_search_url: "/catalogue/search/items/",
  item_url: "/catalogue/node/item/",
  max_additional_resources: 99,
  max_main_resources: 1,
  presets: {
    large:{
      height: 2160,
      id: 3,
      name: "large",
      width: 3840,
    },
    medium:{
      height: 1080,
      id: 2,
      name: "medium",
      width: 1920,
    },
    thumbnail:{
      height: 180,
      id: 1,
      name: "thumbnail",
      width: 320,
    },
  },
  remove_upload_url: "/api/upload/remove",
  resource_url: "/catalogue/node/item/resource/",
  unfinished_uploads_url: "/api/upload/unfinished/",
  upload_directory: "/home/efimov/WORK/git/photobank_backend/private/uploads",
  upload_target_url: "/api/upload/",
  upload_url: "/upload",
  user_get_url: "/usermanager/get",
  user_set_url: "/usermanager/set"
}
