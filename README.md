# RecalculateApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

```
├── 📁 app
│   ├── 📁 components
│   │   ├── 📁 config-form
│   │   │   ├── 🌐 config-form.html
│   │   │   ├── 🎨 config-form.scss
│   │   │   ├── 📄 config-form.spec.ts
│   │   │   └── 📄 config-form.ts
│   │   ├── 📁 controls
│   │   │   ├── 🌐 controls.html
│   │   │   ├── 🎨 controls.scss
│   │   │   ├── 📄 controls.spec.ts
│   │   │   └── 📄 controls.ts
│   │   ├── 📁 file-upload
│   │   │   ├── 🌐 file-upload.html
│   │   │   ├── 🎨 file-upload.scss
│   │   │   ├── 📄 file-upload.spec.ts
│   │   │   └── 📄 file-upload.ts
│   │   └── 📁 progress-dashboard
│   │       ├── 🌐 progress-dashboard.html
│   │       ├── 🎨 progress-dashboard.scss
│   │       ├── 📄 progress-dashboard.spec.ts
│   │       └── 📄 progress-dashboard.ts
│   ├── 📁 models
│   │   └── 📄 metric-data.model.ts
│   ├── 📁 services
│   │   ├── 📄 api.service.spec.ts
│   │   ├── 📄 api.service.ts
│   │   ├── 📄 email.service.spec.ts
│   │   ├── 📄 email.service.ts
│   │   ├── 📄 file-reader.service.spec.ts
│   │   ├── 📄 file-reader.service.ts
│   │   ├── 📄 progress.service.spec.ts
│   │   ├── 📄 progress.service.ts
│   │   ├── 📄 queue.service.spec.ts
│   │   └── 📄 queue.service.ts
│   ├── 📄 app.config.ts
│   ├── 🌐 app.html
│   ├── 🎨 app.scss
│   ├── 📄 app.spec.ts
│   └── 📄 app.ts
├── 🌐 index.html
├── 📄 main.ts
└── 🎨 styles.scss
```