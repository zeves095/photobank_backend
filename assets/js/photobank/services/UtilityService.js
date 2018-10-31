import $ from 'jquery';

class UtilityService{

  constructor(){
    this.fileHashStack = [];
  }

  static getRole(){
    return new Promise((resolve, reject)=>{
      $.ajax({url: window.config.upload_url, method: 'POST'}).done(()=>{
        resolve(true);
      }).fail(()=>{
        resolve(false);
      });
    });
  }

}

export {UtilityService}
