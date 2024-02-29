export const docsData = [
  {
    "endpoint": "create-row",
    "endpointLabel": "Crear Fila",
    "endpointDescription": "Este endpoint permite crear una nueva fila en un módulo y tabla específicos, aplicando restricciones si es necesario.",
    "requestType": "HTTP Request",
    "method": "POST",
    "url": "/rows/create/:module/:table",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo donde se creará la fila."
      },
      {
        "name": "table",
        "description": "El nombre de la tabla donde se creará la fila."
      },
      {
        "name": "createRowDto",
        "description": "Objeto que contiene los datos de la fila a crear, incluyendo restricciones si es necesario."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Fila creada exitosamente, incluyendo cualquier restricción aplicada."
    }
  },
  {
    "endpoint": "find-all-rows",
    "endpointLabel": "Encontrar Todas las Filas",
    "endpointDescription": "Este endpoint devuelve todas las filas para un módulo y tabla específicos, aplicando filtros de visibilidad basados en los metadatos de las columnas.",
    "requestType": "HTTP Request",
    "method": "GET",
    "url": "/rows/:module/:table",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo del cual se quieren obtener las filas."
      },
      {
        "name": "table",
        "description": "El nombre de la tabla de la cual se quieren obtener las filas."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Lista de todas las filas encontradas, con filtros de visibilidad aplicados."
    }
  },
  {
    "endpoint": "find-many-by-column-and-value",
    "endpointLabel": "Buscar Filas por Columna y Valor",
    "endpointDescription": "Este endpoint busca filas basadas en un valor específico de una columna dada, para un módulo y tabla específicos.",
    "requestType": "HTTP Request",
    "method": "GET",
    "url": "/rows/filter/:module/:table/:column/:value",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo."
      },
      {
        "name": "table",
        "description": "El nombre de la tabla."
      },
      {
        "name": "column",
        "description": "El nombre de la columna por la cual filtrar."
      },
      {
        "name": "value",
        "description": "El valor específico a buscar en la columna."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Lista de filas que coinciden con el criterio de búsqueda."
    }
  },
  {
    "endpoint": "update-row",
    "endpointLabel": "Actualizar Fila",
    "endpointDescription": "Este endpoint permite actualizar una fila existente en un módulo y tabla específicos, aplicando restricciones si es necesario.",
    "requestType": "HTTP Request",
    "method": "PATCH",
    "url": "/rows/update/:module/:table",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo donde se actualizará la fila."
      },
      {
        "name": "table",
        "description": "El nombre de la tabla donde se actualizará la fila."
      },
      {
        "name": "updateRowDto",
        "description": "Objeto que contiene los datos actualizados de la fila."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Fila actualizada exitosamente."
    }
  },
  {
    "endpoint": "delete-row",
    "endpointLabel": "Eliminar Fila",
    "endpointDescription": "Este endpoint permite eliminar una o varias filas específicas en un módulo y tabla determinados.",
    "requestType": "HTTP Request",
    "method": "POST",
    "url": "/rows/delete/:module/:table",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo de donde se eliminarán las filas."
      },
      {
        "name": "table",
        "description": "El nombre de la tabla de donde se eliminarán las filas."
      },
      {
        "name": "deleteIds",
        "description": "ID o IDs de las filas a eliminar."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Filas eliminadas correctamente."
    }
  },

  {
    "endpoint": "upsert-column",
    "endpointLabel": "Insertar o Actualizar Columna",
    "endpointDescription": "Este endpoint permite insertar una nueva columna o actualizar una existente, incluyendo la definición de restricciones y otros metadatos asociados a la columna.",
    "requestType": "HTTP Request",
    "method": "POST",
    "url": "/columns/upsert",
    "params": [
      {
        "name": "createColumnDto",
        "description": "Objeto DTO que contiene los datos de la columna a insertar o actualizar. Incluye información como el nombre de la columna, tipo de datos, restricciones, etc."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Columna insertada o actualizada exitosamente en la base de datos."
    }
  },
  {
    "endpoint": "find-all-columns",
    "endpointLabel": "Encontrar Todas las Columnas",
    "endpointDescription": "Este endpoint recupera todas las columnas definidas para un módulo y una tabla específicos, devolviendo detalles como el nombre de la columna, tipo, restricciones aplicables, y otros metadatos.",
    "requestType": "HTTP Request",
    "method": "GET",
    "url": "/columns/:module/:table",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo que contiene la tabla."
      },
      {
        "name": "table",
        "description": "El nombre de la tabla para la cual se quieren recuperar las columnas."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Lista de todas las columnas encontradas para el módulo y tabla especificados."
    }
  },
  {
    "endpoint": "find-one-column",
    "endpointLabel": "Buscar Una Columna Específica",
    "endpointDescription": "Este endpoint busca y devuelve información detallada sobre una columna específica, identificada por su ID, dentro de un módulo y tabla dados.",
    "requestType": "HTTP Request",
    "method": "GET",
    "url": "/columns/:module/:table/:columnid",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo que contiene la tabla."
      },
      {
        "name": "table",
        "description": "El nombre de la tabla que contiene la columna."
      },
      {
        "name": "columnid",
        "description": "El identificador único de la columna a buscar."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Detalles de la columna encontrada, incluyendo nombre, tipo, restricciones y otros metadatos."
    }
  },
  {
    "endpoint": "delete-column",
    "endpointLabel": "Eliminar Columna",
    "endpointDescription": "Este endpoint permite eliminar una columna específica de la base de datos, identificada por su ID, dentro de un módulo y tabla determinados.",
    "requestType": "HTTP Request",
    "method": "POST",
    "url": "/columns/delete",
    "params": [
      {
        "name": "updateColumnDto",
        "description": "Objeto DTO que contiene el ID de la columna a eliminar, así como el módulo y nombre de la tabla correspondientes."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Confirmación de que la columna ha sido eliminada correctamente."
    }
  },

  {
    "endpoint": "create-table",
    "endpointLabel": "Crear Tabla",
    "endpointDescription": "Este endpoint permite crear una nueva tabla dentro de un módulo específico, incluyendo la definición de columnas y configuraciones iniciales.",
    "requestType": "HTTP Request",
    "method": "POST",
    "url": "/tables/create/:module/:table",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo donde se creará la tabla."
      },
      {
        "name": "CreateTableDto",
        "description": "Objeto DTO que contiene los datos de la tabla a crear. Incluye nombres de columnas, tipos de datos, y configuraciones adicionales."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Tabla creada exitosamente con las configuraciones proporcionadas."
    }
  },
  {
    "endpoint": "get-table-metadata",
    "endpointLabel": "Obtener Metadatos de Tabla",
    "endpointDescription": "Este endpoint recupera los metadatos de una tabla específica dentro de un módulo, incluyendo configuraciones y estructura de columnas.",
    "requestType": "HTTP Request",
    "method": "GET",
    "url": "/tables/metadata/:module/:table",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo que contiene la tabla."
      },
      {
        "name": "table",
        "description": "El nombre de la tabla de la cual se quieren recuperar los metadatos."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Metadatos de la tabla especificada, incluyendo estructura y configuraciones."
    }
  },
  {
    "endpoint": "find-all-tables",
    "endpointLabel": "Encontrar Todas las Tablas",
    "endpointDescription": "Este endpoint devuelve una lista de todas las tablas disponibles dentro de un módulo específico, incluyendo detalles básicos y estructura.",
    "requestType": "HTTP Request",
    "method": "GET",
    "url": "/tables/:module",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo del cual se quieren obtener las tablas."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Lista de todas las tablas encontradas dentro del módulo especificado."
    }
  },
  {
    "endpoint": "customize-table",
    "endpointLabel": "Personalizar Tabla",
    "endpointDescription": "Este endpoint permite personalizar la configuración de una tabla existente dentro de un módulo, incluyendo la adición o modificación de columnas y otras configuraciones.",
    "requestType": "HTTP Request",
    "method": "POST",
    "url": "/tables/customize/:module",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo que contiene la tabla a personalizar."
      },
      {
        "name": "Table",
        "description": "Objeto que representa la tabla a personalizar, incluyendo las modificaciones a aplicar."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Configuración de la tabla actualizada exitosamente."
    }
  },
  {
    "endpoint": "delete-table",
    "endpointLabel": "Eliminar Tabla",
    "endpointDescription": "Este endpoint permite eliminar una tabla específica de un módulo, eliminando también todas las filas y configuraciones asociadas a ella.",
    "requestType": "HTTP Request",
    "method": "POST",
    "url": "/tables/delete/:module/:table",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo que contiene la tabla a eliminar."
      },
      {
        "name": "table",
        "description": "El nombre de la tabla a eliminar."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Tabla eliminada correctamente del módulo."
    }
  },
  {
    "endpoint": "create-module",
    "endpointLabel": "Crear Módulo",
    "endpointDescription": "Este endpoint permite crear un nuevo módulo en el sistema.",
    "requestType": "HTTP Request",
    "method": "POST",
    "url": "/modules/create",
    "params": [
      {
        "name": "module",
        "description": "El nombre del módulo a crear."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Módulo creado exitosamente."
    }
  },
  {
    "endpoint": "list-modules",
    "endpointLabel": "Listar Módulos",
    "endpointDescription": "Este endpoint devuelve una lista de todos los módulos disponibles en el sistema.",
    "requestType": "HTTP Request",
    "method": "GET",
    "url": "/modules/",
    "response": {
      "name": "respuesta",
      "description": "Lista de módulos disponibles."
    }
  },
  {
    "endpoint": "findAllModulesTables",
    "endpointLabel": "Buscar Todas las Tablas de los Módulos",
    "endpointDescription": "Este endpoint devuelve una lista de todas las tablas asociadas a cada módulo disponible en el sistema.",
    "requestType": "HTTP Request",
    "method": "GET",
    "url": "/modules/modulestables",
    "response": {
      "name": "respuesta",
      "description": "Lista de tablas de módulos disponibles."
    }
  },
  {
    "endpoint": "customizeModule",
    "endpointLabel": "Personalizar Módulo",
    "endpointDescription": "Este endpoint permite personalizar la configuración de un módulo existente, incluyendo la adición, eliminación o modificación de tablas y columnas dentro del módulo.",
    "requestType": "HTTP Request",
    "method": "POST",
    "url": "/modules/customize",
    "params": [
      {
        "name": "module",
        "description": "Datos del módulo a personalizar, incluyendo cualquier cambio en la configuración."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Configuración del módulo actualizada exitosamente."
    }
  },
  {
    "endpoint": "findOne",
    "endpointLabel": "Buscar Módulo por Nombre",
    "endpointDescription": "Este endpoint busca y devuelve información detallada sobre un módulo específico, identificado por su nombre.",
    "requestType": "HTTP Request",
    "method": "GET",
    "url": "/modules/findone/:module",
    "params": [
      {
        "name": "moduleName",
        "description": "Nombre del módulo a buscar."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Información detallada del módulo encontrado."
    }
  },
  {
    "endpoint": "update",
    "endpointLabel": "Actualizar Módulo",
    "endpointDescription": "Este endpoint permite actualizar los datos de un módulo existente, incluyendo la modificación de su configuración y estructura.",
    "requestType": "HTTP Request",
    "method": "PATCH",
    "url": "/modules/:id",
    "params": [
      {
        "name": "id",
        "description": "ID del módulo a actualizar."
      },
      {
        "name": "updateModuleDto",
        "description": "Datos actualizados del módulo."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Módulo actualizado correctamente."
    }
  },
  {
    "endpoint": "remove",
    "endpointLabel": "Eliminar Módulo",
    "endpointDescription": "Este endpoint permite eliminar un módulo existente del sistema, junto con todas sus tablas y configuraciones asociadas.",
    "requestType": "HTTP Request",
    "method": "POST",
    "url": "/modules/:module",
    "params": [
      {
        "name": "module",
        "description": "Nombre del módulo a eliminar."
      }
    ],
    "response": {
      "name": "respuesta",
      "description": "Módulo eliminado correctamente del sistema."
    }
  }

];
