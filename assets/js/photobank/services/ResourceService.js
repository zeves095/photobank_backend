import $ from 'jquery';

class ResourceService{
  constructor(){

  }

  static fetchUnfinished(item){
    let unfinished = [];
    return new Promise((resolve, reject)=>{
      $.getJSON(window.config.unfinished_uploads_url, (data)=>{
        console.warn(item);
        for (var i = 0; i < data.length; i++) {
          let unfinishedUpload = data[i];
          if(unfinishedUpload[0]==item){
            unfinished.push({'filename': unfinishedUpload[1], 'filehash': unfinishedUpload[2], 'class': "unfinished", "ready": true, "completed":unfinishedUpload[3],"total":unfinishedUpload[4]});
          }
        }
        resolve(unfinished);
      });
    });
  }

}

export {ResourceService}
