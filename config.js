const environment={};

environment.staging={
    'httpPort':3000,
    'httpsPort':3001,
    'envName':'Staging'
}

environment.production={
    'httpPort':5000,
    'httpsPort':5001,
    'envName':'Production'
}

const currentEnvironmentName = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "staging" ;
let environmentToExport=environment.staging;
if (currentEnvironmentName in environment ){
    environmentToExport=environment[currentEnvironmentName];
}

module.exports = environmentToExport;