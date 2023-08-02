// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  hmr: false,
  apiUrl: 'https://eco-quality-erp-crud-service.vercel.app',
  authUrl: 'https://eco-quality-auth.vercel.app',
  filesUrl: 'https://eq-files.onrender.com',
  recoveryCodeKey: "210_SANTI_Y_3_SILVIA_2_LOS_AMO_1",
  adminTables: {
    profile: 'Perfiles',
    users: 'Usuarios',
    mainUsersModule: '_eq__admin_manager',
    mainUsersTable: 'users'
  }
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
  // import 'zone.js/plugins/zone-error';  // Included with Angular CLI.