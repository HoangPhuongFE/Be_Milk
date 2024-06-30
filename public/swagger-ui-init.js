window.onload = function() {
    // Build a system
    var url = window.location.search.match(/url=([^&]+)/);
    if (url && url.length > 1) {
      url = decodeURIComponent(url[1]);
    } else {
      url = window.location.origin;
    }
    var options = {
      "swaggerDoc": {
        "openapi": "3.0.0",
        "info": {
          "title": "Be Milk API",
          "version": "1.0.0",
          "description": "API documentation for Be Milk",
          "contact": {
            "name": "Be Milk"
          },
          "servers": [
            {
              "url": "http://localhost:5000"
            }
          ]
        },
        "components": {
          "securitySchemes": {
            "bearerAuth": {
              "type": "http",
              "scheme": "bearer",
              "bearerFormat": "JWT"
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "paths": {},
        "tags": []
      },
      "customOptions": {}
    };
    url = options.swaggerUrl || url
    var urls = options.swaggerUrls
    var customOptions = options.customOptions
    var spec1 = options.swaggerDoc
    var swaggerOptions = {
      spec: spec1,
      url: url,
      urls: urls,
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ],
      layout: "StandaloneLayout"
    }
    for (var attrname in customOptions) {
      swaggerOptions[attrname] = customOptions[attrname];
    }
    var ui = SwaggerUIBundle(swaggerOptions)
  
    if (customOptions.oauth) {
      ui.initOAuth(customOptions.oauth)
    }
  
    if (customOptions.preauthorizeApiKey) {
      const key = customOptions.preauthorizeApiKey.authDefinitionKey;
      const value = customOptions.preauthorizeApiKey.apiKeyValue;
      if (!!key && !!value) {
        const pid = setInterval(() => {
          const authorized = ui.preauthorizeApiKey(key, value);
          if(!!authorized) clearInterval(pid);
        }, 500)
      }
    }
  
    if (customOptions.authAction) {
      ui.authActions.authorize(customOptions.authAction)
    }
  
    window.ui = ui
  }
  