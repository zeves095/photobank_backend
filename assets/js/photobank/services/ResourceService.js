import $ from 'jquery';

class ResourceService{
  constructor(){
  }

  static fetchExisting(itemId){
    return new Promise((resolve, reject)=>{
      $.getJSON(window.config.existing_uploads_url+itemId, (data)=>{
        resolve(data);
      });
    });
  }

  static fetchExistingPresets(itemId, existing, start, end, finishedPresets){
    let presets = [];
    return new Promise((resolve,reject)=>{
      if(existing.length==0){resolve([])}

      let presetIterable = [];
      for(var i = start; i<end; i++){
        if(typeof existing[i] != "undefined"){
          presetIterable.push(this._getFinishedPresets(existing, i, finishedPresets));
        }
      }
      Promise.all(presetIterable).then((data)=>{
        for(var item in data){
          if(data[item]!=null){
            presets = presets.concat(data[item]);
          }
        }
        presets = presets.filter((preset)=>{
          for(var fin in finishedPresets){
             if(preset.preset==finishedPresets[fin].preset&&finishedPresets[fin].resource==preset.resource){
               return false;
             }
          }
          return true;
        });
        resolve(presets);
      });
    });
  }

  static _getFinishedPresets(existing, id, finishedPresets){
    let presetItems = [];
    let presets = [];
    return new Promise((resolve, reject)=>{

      if(typeof existing[id] == 'undefined'){resolve(null)}
      if(finishedPresets.filter((fin_preset)=>{return fin_preset.resource == existing[id].id}).length >= Object.keys(window.config['presets']).length){resolve(null)}

      for(var preset in window.config['presets']){

        let presetId = window.config['presets'][preset]['id'];
        let resId = existing[id].id;
        let url = window.config.resource_url + existing[id].id + "/" + presetId;

        presetItems.push(new Promise((resolvePreset,rejectPreset)=>{
          $.ajax({url: url, method: 'GET'}).done((data)=>{
            if(typeof data.id != "undefined"){
              resolvePreset({
                'id': data.id,
                'resource' : data.gid,
                'preset' : data.preset
              });
            }else{
              resolvePreset(null);
            }
          });
        }))
      }
      Promise.all(presetItems).then((result)=>{
        for(var i = 0; i<result.length; i++){
          if(result[i] !=  null){
            presets.push(result[i]);
          }
        }
        resolve(presets);
      });
    });
  }

  static updateResource(form){
    return new Promise((resolve, reject)=>{
      let data = {
        "id" : form.find("input[name='id']").val()
      };
      let sel = form.find("select");
      let chk = form.find("input[type='checkbox']");
      let txt = form.find("input[type='text']");
      if(sel.length){data[sel.prop('name')]=sel.val()}
      if(chk.length){data[chk.prop('name')]=chk.prop("checked")}
      if(txt.length){data[txt.prop('name')]=txt.val()}
      let dataJson = JSON.stringify(data);
      $.ajax({
        url: window.config.resource_url+data.id,
        method: 'PATCH',
        data: dataJson,
        contentType: "application/json; charset=utf-8",
        dataType: "json"
      }).done(()=>{
        resolve();
      });
      resolve();
    });
  }

}

export {ResourceService}
