export function log(message, ...optionalParams) {
    console.log(`[${new Date().toISOString()}] ${message}`, ...optionalParams);
  }
  
  export function error(message, ...optionalParams) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...optionalParams);
  }
  