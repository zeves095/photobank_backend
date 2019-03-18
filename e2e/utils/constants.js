module.exports = {
  MAX_SLEEP: 30000,
  DEBUG_SLEEP: 1000,
  DEBUG: false,
  SHORT_WAIT: 200,
  WAIT: 400,
  LONG_WAIT: 4000,

  SITE_URL: 'http://localhost:8000',
  PAGE_UPLOAD: '/upload',
  PAGE_LINKS: '/account',
  PAGE_USERS: '/usermanager',

  USERS: {
    ADMIN: {
      LOGIN: 'efimov',
      PASSWORD: '300ljkkfhjd'
    },
    INCORRECT: {
      LOGIN: 'none',
      PASSWORD: 'none'
    }
  },
  FORM_DATA: {
    ITEM_NAME: 'Кружка',
    NODE_NAME: 'Кружка',
  },
  SELECTORS: {
    LOGIN: 'input[name="_username"]',
    PASSWORD: 'input[name="_password"]',
    LOGIN_ERROR_MESSAGE: '.auth__item.auth__item--error',
    LOGOUT_BUTTON: '.clogout-btn',
    LOADER: '.loading',
    upload: {
      ITEM_SEARCH_FORM: '.item-search',
      ITEM_SEARCH_NAME_INPUT: '#srchinpt1',
      ITEM_SEARCH_NODE_INPUT: '#srchinpt2',
      ITEM_SEARCH_ITEM_CODE: '#srchinpt3',
      ITEM_SEARCH_NESTED_INPUT: '#srchinpt4',
      ITEM_SEARCH_SUBMIT_BTN: '#srchbtn',
      ITEM_LIST_ITEM: '.item-list .list-item',
      ITEM_LIST_FILTER: '#nodesearchinpt',
      CATALOGUE_TREE_SEARCH_VIEW: '.component-title__view-icons>i[data-view="3"]',
      CATALOGUE_TREE_LIST_VIEW: '.component-title__view-icons>i[data-view="1"]',
      CATALOGUE_TREE_TREE_VIEW: '.component-title__view-icons>i[data-view="2"]',
      CATALOGUE_TREE_LIST_ITEM: '.list-view__cat_item[data-node]',
      CATALOGUE_TREE_LIST_ROOT: '.catalogue-tree__crumbs .crumbs__crumb:first-child',
      CATALOGUE_TREE_TREE_NODE: '.jstree-anchor',
      CATALOGUE_TREE_TREE_CHILDREN: '.jstree-children',
      CATALOGUE_TREE_LIST_UP: '.list-view__cat_item:not([data-node])',
      RESOURCE_LIST_ITEM: '.existing-files__file',
    },
    linkmanager: {
      ADD_LINK_BTN: ".link-list .add-button",
      RESOURCE_SEARCH_ITEM_NAME: ".resource-search-form #root_item_search_name",
      RESOURCE_SEARCH_NODE_NAME: ".resource-search-form #root_item_search_parent_name",
      RESOURCE_SEARCH_SEARCH_NESTED: ".resource-search-form #root_item_search_search_nested",
      RESOURCE_SEARCH_ITEM_CODE: ".resource-search-form #root_item_search_code",
      RESOURCE_SEARCH_RESOURCE_ID: ".resource-search-form #root_resource_search_id",
      RESOURCE_SEARCH_PRESET_ID: ".resource-search-form #root_resource_search_preset",
      RESOURCE_SEARCH_TYPE_ID: ".resource-search-form #root_resource_search_type",
      RESOURCE_SEARCH_SUBMIT: ".resource-search-form button[type=submit]",
      RESOURCE_SEARCH_RESULT: ".resource.list-item",
      RESOURCE_SEARCH_SELECT_ALL: ".resource-search-results button[name=button]",
    },
    notloading: {
      ITEM_LIST: ".item-list .view-inner__container:not(.loading)",
      NODE_LIST: ".catalogue-tree__view-inner:not(.loading)",
      RESOURCE_SEARCH_RESULTS: ".resource-search-results:not(.loading)",
      UNFINISHED_UPLOADS: ".item-uploads__unfinished:not(.loading)",
      RESOURCE_LIST: ".item-resources:not(.loading)",
      LINK_LIST: ".link-list .component-body:not(.loading)"
    }
  },
};
