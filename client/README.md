# Main

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.5.

## Development server
Run `yarn start` to launch the development server. Using `yarn` to run scripts ensures that the Angular CLI version is the same as the local version, however you may use a globally installed Angular CLI if you wish.

### Development Scripts 
- `start` - use default dev configuration to compile app, launch dev server on `http://127.0.0.1:4200`, watch for changes
- `start:production` - use production configuration to compile app, launch dev server, watch for changes
- `generate-apollo` - generate [`angular-apollo`](https://apollo-angular.com) client library from server GraphQL schema and client `*.gql` query files (to export a fresh GQL server schema, execute `rake graphql:schema:dump` in `civic-v2/server`)
- `generate-apollo:start` - generate [`angular-apollo`](https://apollo-angular.com) client, watch for changes
- `generate-svgo` - prepare custom icons SVG files for conversion to typescript library 
- `generate-icons` - create typescript library from icons processed by svgo

### Code scaffolding
Run `yarn ng generate component component-name` to generate a new component. You can also use `yarn ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build
Run `yarn build` to build the project. The build artifacts will be stored in the Rails repository's public server directory, `civic-v2/server/public`. 

### Build Scripts
- `build` - build the production app in `civic-v2/server/public/`
- `build:stats` - generate build statistics and launch [`webpack-bundle-analyzer`](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- `build:watch` - build production app, launch dev server on `http://127.0.0.1:4210`, watch for changes (useful for debugging issues with production builds)

## Running unit tests

Run `yarn ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `yarn ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `yarn ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
