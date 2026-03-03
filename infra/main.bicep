targetScope = subscription

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

param webAppName string = ''
param appServicePlanName string = ''

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: { 'azd-env-name': environmentName }
}

// App Service Plan
module appServicePlan 'core/host/appserviceplan.bicep' = {
  name: 'appServicePlan'
  scope: rg
  params: {
    name: !empty(appServicePlanName) ? appServicePlanName : 'asp-${environmentName}'
    location: location
    tags: { 'azd-env-name': environmentName }
    sku: {
      name: 'B1'
      tier: 'Basic'
      size: 'B1'
      family: 'B'
      capacity: 1
    }
    kind: 'linux'
  }
}

// Web App
module webApp 'core/host/appservice.bicep' = {
  name: 'webApp'
  scope: rg
  params: {
    name: !empty(webAppName) ? webAppName : 'app-${environmentName}'
    location: location
    tags: { 'azd-env-name': environmentName }
    appServicePlanId: appServicePlan.outputs.id
    runtimeName: 'node'
    runtimeVersion: '18-lts'
    scmDoBuildDuringDeployment: true
    appSettings: {
      PORT: '8080'
      JWT_SECRET: 'caresync_secret_key_2025'
      STRIPE_SECRET_KEY: 'sk_test_placeholder'
      NODE_ENV: 'production'
      WEBSITE_NODE_DEFAULT_VERSION: '18.x'
    }
  }
}

// Outputs
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = rg.name
output AZURE_APP_SERVICE_PLAN string = appServicePlan.outputs.name
output AZURE_WEB_APP_NAME string = webApp.outputs.name
output AZURE_WEB_APP_ENDPOINTS array = [webApp.outputs.uri]
