export default {
  schema: {
    title: "",
    description: "",
    type: "object",
    required: [],
    properties: {
      item_search_name: {
        type: "string",
        title: "Название товара"
      },
      item_search_parent_name: {
        type: "string",
        title: "Папка"
      },
      item_search_search_nested: {
        type: "boolean",
        title: "Искать во вложенных разделах"
      },
      item_search_code: {
        type: "string",
        title: "Код 1С товара"
      },
      resource_search_id: {
        type: "number",
        title: "ID Ресурса"
      },
      resource_search_preset: {
        type: "number",
        title: "Пресет"
      },
      resource_search_type: {
        type: "number",
        title: "Тип ресурса"
      },
    }
  },
  widgets:{

  },
  fields:{

  },
  uiSchema: {
    item_search_name: {"ui:widget": "text"},
    item_search_parent_name: {"ui:widget": "text"},
    item_search_search_nested: {"ui:widget": "hidden"},
    item_search_code: {"ui:widget": "text"},
    resource_search_id: {"ui:widget": "hidden"},
    resource_search_preset: {"ui:widget": "hidden"},
    resource_search_type: {"ui:widget": "hidden"},
  },
  uiSchema_admin: {
    item_search_name: {"ui:widget": "text"},
    item_search_parent_name: {"ui:widget": "text"},
    item_search_code: {"ui:widget": "text"},
    resource_search_id: {"ui:widget": "updown"},
    resource_search_preset: {"ui:widget": "text"},
    resource_search_type: {"ui:widget": "text"},
  }
};
