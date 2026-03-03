metadata description = 'Creates an Azure App Service instance.'
param name string
param location string = resourceGroup().location
param tags object = {}

// Reference to existing app service plan
param appServicePlanId string

// Runtime properties
param runtimeName string
param runtimeVersion string
param runtimeNameAndVersion string = '${runtimeName}|${runtimeVersion}'

// Deployment settings
param scmDoBuildDuringDeployment bool = false
param enableOryxBuild bool = contains(runtimeNameAndVersion, 'node')

// App settings
param appSettings object = {}
param additionalAppSettings array = []

// Create the merged app settings
var mergedAppSettings = union(appSettings, additionalAppSettings)

resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: name
  location: location
  tags: tags
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlanId
    siteConfig: {
      linuxFxVersion: runtimeNameAndVersion
      alwaysOn: true
      ftpsState: 'FtpsOnly'
      minTlsVersion: '1.2'
      appSettings: [
        for key in objectKeys(mergedAppSettings): {
          name: key
          value: mergedAppSettings[key]
        }
      ]
    }
    httpsOnly: true
  }
}

output id string = appService.id
output name string = appService.name
output uri string = 'https://${appService.properties.defaultHostName}'
output hostname string = appService.properties.defaultHostName
