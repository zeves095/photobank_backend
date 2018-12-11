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
            title: "Ширина"
          },
          height: {
            type: "number",
            title: "Высота"
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
    size:{
      width: {"ui:widget": "updown"},
      height: {"ui:widget": "updown"}
    },
    target: {"ui:widget": "text"},
    max_requests: {"ui:widget": "hidden"},
    expires_by: {"ui:widget": "hidden"},
    access: {"ui:widget": "hidden"},
    resource: {"ui:widget": "hidden"},
  },
  uiSchema_admin:{
    size:{
      width: {"ui:widget": "updown"},
      height: {"ui:widget": "updown"}
    },
    target: {"ui:widget": "text"},
    max_requests: {"ui:widget": "updown"},
    expires_by: {"ui:widget": "date"},
    access: {"ui:widget": "text"},
    resource: {"ui:widget": "hidden"},
  }
};
