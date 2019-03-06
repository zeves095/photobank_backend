import utility from './photobank/services/UtilityService';
Promise.all([
  utility.initLocalstorage(),
  utility.fetchConfig()
]).then(()=>{
  import('./app/index.js');
})
