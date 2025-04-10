import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withEnabledBlockingInitialNavigation, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations, provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

// Core interceptors
import { coreInterceptors } from './app/core/interceptors';

// Register locale data for internationalization
registerLocaleData(localeRu);

// Application bootstrap with optimized configuration
bootstrapApplication(AppComponent, {
  providers: [
    // Routing with modern features
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
      withComponentInputBinding() // Direct route params to component inputs
    ),

    // HTTP client optimized for modern browsers
    provideHttpClient(
      withFetch(), // Better performance than XHR
      withInterceptors(coreInterceptors)
    ),

    // Conditional animations (noop for tests, full for app)
    environment.test ? provideNoopAnimations() : provideAnimations(),

    // Zoneless for maximum performance
    provideZonelessChangeDetection(),

    // Internationalization
    {
      provide: 'LOCALE_ID',
      useValue: 'ru-RU' // или 'en-US' в зависимости от проекта
    },

    // Global configuration
    {
      provide: 'APP_CONFIG',
      useValue: {
        version: environment.version,
        buildDate: environment.buildDate,
        features: {
          zoneless: true,
          signals: true,
          standalone: true
        }
      }
    }
  ]
}).catch(err => {
  const bootstrapError = {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  };

  // Error handling for different environments
  if (environment.production) {
    // Log to error reporting service
    console.error('Production bootstrap error:', bootstrapError);
  } else {
    // Detailed error for development
    console.error('Bootstrap failed:', err);

    // Optional: Display error UI
    displayBootstrapError(err);
  }
});

// Fallback UI for bootstrap errors
function displayBootstrapError(error: Error): void {
  const appRoot = document.getElementById('app-root');
  if (appRoot) {
    appRoot.innerHTML = `
      <div style="padding: 20px; font-family: Arial; text-align: center;">
        <h1>🚨 Application Failed to Load</h1>
        <p>${error.message}</p>
        <button onclick="window.location.reload()">Reload Application</button>
        ${environment.production ? '' : `<pre>${error.stack}</pre>`}
      </div>
    `;
  }
}
