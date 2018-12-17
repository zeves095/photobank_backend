import {SizeField} from '../fields/';

export default {
  schema: {
    title: "",
    description: "",
    type: "object",
    required: [],
    properties: {
      size: {
        type: "object",
        title:"",
        properties: {
          width: {
            type: "number",
            title: "Ширина",
            description: "Значения от 32 до 4096",
            maximum: 4096,
            minimum: 32
          },
          height: {
            type: "number",
            title: "Высота",
            description: "Значения от 32 до 2160",
            maximum: 2160,
            minimum: 32
          }
        }
      },
      target: {
        type: "string",
        title: "Группа"
      },
      max_requests: {
        type: "number",
        title: "Ограничение по числу запросов"
      },
      expires_by: {
        type: "string",
        title: "Срок действия",
        format: "date"
      },
      access: {
        type: "string",
        title: "Ограничение по IP"
      },
      resource:{
        type: "string",
        title: "Ресурс"
      }
    }
  },
  uiSchema: {
    target: {"ui:widget": "text"},
    size: {"ui:field":SizeField},
    // {
    //   width: {
    //     "ui:widget": "updown",
    //     "ui:help": "Значения от 32 до 4096"
    //   },
    //   height: {
    //     "ui:widget": "updown",
    //     "ui:help": "Значения от 32 до 2160"
    //   }
    // },
    max_requests: {"ui:widget": "hidden"},
    expires_by: {"ui:widget": "hidden"},
    access: {"ui:widget": "hidden"},
    resource: {"ui:widget": "hidden"},
  },
  uiSchema_admin:{
    size: {"ui:field":SizeField},
    // {
    //   width: {"ui:widget": "updown"},
    //   height: {"ui:widget": "updown"}
    // },
    target: {"ui:widget": "text"},
    max_requests: {"ui:widget": "updown"},
    expires_by: {"ui:widget": "date"},
    access: {"ui:widget": "text"},
    resource: {"ui:widget": "hidden"},
  }
};
