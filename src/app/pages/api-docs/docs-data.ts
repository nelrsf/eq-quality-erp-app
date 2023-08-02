export const docsData = [
    {
      endpoint: "create-module",
      endpointLabel: "Crear Módulo",
      endpointDescription: "Este endpoint permite crear un nuevo módulo.",
      requestType: "HTTP Request",
      method: "POST",
      url: "/modules/create",
      params: [
        {
          name: "module",
          description: "El nombre del módulo a crear.",
        },
      ],
      response: {
        name: "respuesta",
        description: "Módulo creado exitosamente.",
      },
    },
    {
      endpoint: "list-modules",
      endpointLabel: "Listar Módulos",
      endpointDescription: "Este endpoint devuelve una lista de todos los módulos disponibles.",
      requestType: "HTTP Request",
      method: "GET",
      url: "/modules/",
      response: {
        name: "respuesta",
        description: "Lista de módulos disponibles.",
      },
    },
    {
      endpoint: "findAllModulesTables",
      endpointLabel: "Buscar Todas las Tablas de los Módulos",
      endpointDescription: "Este endpoint devuelve una lista de todas las tablas de los módulos disponibles.",
      requestType: "HTTP Request",
      method: "GET",
      url: "/modules/modulestables",
      response: {
        name: "respuesta",
        description: "Lista de tablas de módulos disponibles.",
      },
    },
    {
      endpoint: "customizeModule",
      endpointLabel: "Personalizar Módulo",
      endpointDescription: "Este endpoint permite personalizar la configuración de un módulo.",
      requestType: "HTTP Request",
      method: "POST",
      url: "/modules/customize",
      params: [
        {
          name: "module",
          description: "Datos del módulo a personalizar.",
        },
      ],
      response: {
        name: "respuesta",
        description: "Configuración del módulo actualizada exitosamente.",
      },
    },
    {
      endpoint: "findOne",
      endpointLabel: "Buscar Módulo por Nombre",
      endpointDescription: "Este endpoint busca y devuelve información sobre un módulo específico por su nombre.",
      requestType: "HTTP Request",
      method: "GET",
      url: "/modules/findone/:module",
      params: [
        {
          name: "moduleName",
          description: "Nombre del módulo a buscar.",
        },
      ],
      response: {
        name: "respuesta",
        description: "Información del módulo encontrado.",
      },
    },
    {
      endpoint: "update",
      endpointLabel: "Actualizar Módulo",
      endpointDescription: "Este endpoint permite actualizar la información de un módulo existente.",
      requestType: "HTTP Request",
      method: "PATCH",
      url: "/modules/:id",
      params: [
        {
          name: "id",
          description: "ID del módulo a actualizar.",
        },
        {
          name: "updateModuleDto",
          description: "Datos actualizados del módulo.",
        },
      ],
    },
    {
      endpoint: "remove",
      endpointLabel: "Eliminar Módulo",
      endpointDescription: "Este endpoint permite eliminar un módulo existente.",
      requestType: "HTTP Request",
      method: "POST",
      url: "/modules/:module",
      params: [
        {
          name: "module",
          description: "Nombre del módulo a eliminar.",
        },
      ],
      response: {
        name: "respuesta",
        description: "Módulo eliminado correctamente.",
      },
    },
  ];
  