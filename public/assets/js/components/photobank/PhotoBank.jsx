class CatalogueTree extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": [],
      "catalogue_tree": [],
      "tracked_nodes": [],
      "current_node": 1,
      "crumbs": []
    }
    this.getCatalogueNodes = this.getCatalogueNodes.bind(this);
    this.getNodeById = this.getNodeById.bind(this);
    this.getNodeParent = this.getNodeParent.bind(this);
    this.populateCatalogue = this.populateCatalogue.bind(this);
    this.getNodeLevel = this.getNodeLevel.bind(this);
    this.getCrumbs = this.getCrumbs.bind(this);
    this.nodeChoiceHandler = this.nodeChoiceHandler.bind(this);
  }

  getCatalogueNodes(data){
    $.getJSON("/catalogue/nodes/"+this.state.current_node, (data)=>{
      let cat_data = [];
      for(var node in data){
        if(this.state.tracked_nodes.indexOf(data[node].id) == -1){
          cat_data.push(data[node]);
          this.state.tracked_nodes.push(data[node].id);
        }
      }
      if(cat_data.length>0){
        this.setState({
          "catalogue_data": this.state.catalogue_data.concat(cat_data)
        });
      }
      this.populateCatalogue();
    });
  }

  populateCatalogue(){
    let element = [];
    let parent = this.getNodeById(this.state.current_node);
    let children = this.getNodeChildren(parent);
    for(var i = 0; i<children.length; i++){
      let child = children[i];
      element.push(<span key={child.id} className="cat_item parent" onClick={this.nodeChoiceHandler} data-node={child.id}><b data-node={child.id}>{child.name}</b></span>);
    }
    let catalogueTree = element;
    this.setState({
      "catalogue_tree": catalogueTree
    });
    this.getCrumbs();
  }

  getCrumbs(){
    let crumbs = [];
    let cur_node = this.getNodeById(this.state.current_node);
    cur_node.active = true;
    crumbs.push(cur_node);
    while(this.getNodeParent(cur_node) != cur_node && this.getNodeParent(cur_node)!= null){
      let parent = this.getNodeParent(cur_node);
      parent.active = false;
      crumbs.push(parent);
      cur_node = this.getNodeById(parent.id);
    }
    crumbs = crumbs.map((crumb)=><span key={crumb.name} data-node={crumb.id} className={crumb.active?"active":""} onClick={this.nodeChoiceHandler}>{crumb.name}</span>);
    crumbs.reverse();
    this.setState({
      "crumbs":crumbs
    });
  }

  getNodeParent(node){
    for(var i = 0; i<this.state.catalogue_data.length; i++){
      if(node.parent == this.state.catalogue_data[i].id){
        return this.state.catalogue_data[i];
      }
    }
    return null;
  }

  getNodeChildren(node){
    let children = [];
    for(var i = 0; i<this.state.catalogue_data.length; i++){
      if(node.id == this.state.catalogue_data[i].parent && node.id !== this.state.catalogue_data[i].id){
        children.push(this.state.catalogue_data[i]);
      }
    }
    return children;
  }

  getNodeById(id){
    for(var i = 0; i<this.state.catalogue_data.length; i++){
      if(id == this.state.catalogue_data[i].id){
        return this.state.catalogue_data[i];
      }
    }
    return null;
  }

  getNodeLevel(node){
    if(node.parent !== 0){
      return this.getNodeLevel(this.getNodeParent(node))+1;
    }
    return 0;
  }

  nodeChoiceHandler(e){
    e.stopPropagation();
    let curr_id = e.target.getAttribute('data-node');
    this.state.current_node = curr_id;
    this.getCatalogueNodes(this.props.catalogue_data);
    this.props.nodeChoiceHandler(curr_id);
  }

  componentDidUpdate(prevProps){
    if(this.props.catalogue_data != prevProps.catalogue_data){
      this.state.catalogue_data = this.props.catalogue_data;
      this.getCatalogueNodes();
    }
  }

  render() {
    return (
      <div className="catalogue_tree">
        <h2 className="component_title">Каталог</h2>
        <div>
          <div className="crumbs">
            {this.state.crumbs}
          </div>
          <div className="catalogue_tree_inner">
          {this.state.catalogue_tree}
          </div>
        </div>
      </div>
    );
  }
}

class NodeViewer extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      "node": this.props.node,
      "node_items": []
    }
    this.getItems = this.getItems.bind(this);
  }

  componentDidUpdate(prevProps){
    if(this.props.node !== prevProps.node){
      this.setState({
        "node": this.props.node
      });
      this.getItems();
    }
  }

  componentDidMount(){
    this.getItems();
  }

  getItems(nodeId = this.props.node){
    $.getJSON("/catalogue/node/items/"+nodeId, (data)=>{
      this.setState({
        "node_items": data
      });
    });
  }

  render() {
    return (
      <div className="node_viewer">
        <h2 className="component_title">Просмотр категории</h2>
        <div className="node_viewer_inner">
        {this.state.node_items.map((item)=><div key={item.id}><ItemSection item_code={item.itemCode} item_id={item.id} name={item.name} open_by_default={false}/></div>)}
        </div>
      </div>
    );
  }
}

class ItemSection extends React.Component{
  constructor(props) {
    super(props);
    if(typeof window.resumableContainer[this.props.item_id] == 'undefined'){
      this.resumable = new Resumable({target: '/api/upload/'});
    } else {
      this.resumable = window.resumableContainer[this.props.item_id];
    }
    this.state={
      "resumable":this.resumable,
      "item_id":this.props.item_id,
      "item_code":this.props.item_code,
      "open":this.props.open_by_default,
      "ready":false,
      "existing": []
    };
    this.hashPool = [];
    this.uploads = [];

    this.buildList = this.buildList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.getHash = this.getHash.bind(this);
    this.resolveResumedUploads = this.resolveResumedUploads.bind(this);
    this.fetchExisting = this.fetchExisting.bind(this);
    this.handleResurceUpdate = this.handleResurceUpdate.bind(this);
  }

  fetchExisting(){
    $.getJSON("/catalogue/node/item/resources/"+this.props.item_id, (data)=>{
      data = data.map((file)=>
      <span key={file.filename+file.filehash}>{file.src_filename}
        <span className="edit_fields">
          <span className="edit_input"><input type="text" name="priority"/><label htmlFor="priority">Приоритет 1С</label></span>
          <span className="edit_input"><input type="checkbox" value="" name="1c"/><label htmlFor="1c">Использовать в 1С</label></span>
          <span className="edit_input"><input type="checkbox" value="" name="deleted"/><label htmlFor="deleted">Удален</label></span>
          <span className="edit_input"><input type="checkbox" value="" name="default"/><label htmlFor="default">По умолчанию</label></span>
          <input type="hidden" name="id" value={file.id}/>
          <button onClick={this.handleResurceUpdate}>Обновить</button>
        </span>
      </span>);
      this.setState({
        "existing": data
      });
    });
  }

  buildList() {
    if (typeof this.updateListTimer != 'undefined') {
      clearTimeout(this.updateListTimer);
    }
    this.updateListTimer = setTimeout(function() {
      let unfinishedUploads = $("#unfinished_uploads").val().split("|");

      this.uploads = [];

      if (unfinishedUploads !== "") {
        for (var i = 0; i < unfinishedUploads.length; i++) {
          let unfinishedParts = unfinishedUploads[i].split(',');
          if(unfinishedParts[0]==this.state.item_id){
            this.uploads.push({'filename': unfinishedParts[1], 'filehash': unfinishedParts[2], 'class': "unfinished", "ready": true});
          }
        }
      }

      for (var i = 0; i < this.resumable.files.length; i++) {
        let className = this.resumable.files[i].isComplete()?"completed":"pending";
        this.uploads.push({"filename": this.resumable.files[i].fileName, "filehash": this.resumable.files[i].uniqueIdentifier, "class": className, "ready": this.resumable.files[i].ready});
      }

      this.resolveResumedUploads();

      let uploads = this.uploads.map((upload)=><span key={upload.filename+upload.filehash} className={upload.class + (upload.ready? "": " processing")}>F: {upload.filename}<span className="delete_upload" data-item={upload.filehash} onClick={this.handleDelete}>X</span><span className="progress_bar" id={"progress_bar"+upload.filehash}><span></span></span></span>);
      this.setState({
        "uploads":uploads
      });
    }.bind(this), 300);
  }

  resolveResumedUploads(){
    for (var i = 0; i < this.uploads.length; i++) {
      for (var j = 0; j < this.uploads.length; j++) {
        if (this.uploads[i]["class"] == "unfinished" && i != j && this.uploads[i]["filename"] == this.uploads[j]["filename"] && this.uploads[i]["itemId"] == this.uploads[j]["itemId"] && this.uploads[i]["filehash"] == this.uploads[j]["filehash"]) {
          this.uploads.splice(i, 1);
          this.resolveResumedUploads();
        }
      }
    }
  }

  getHash(file) {
    let fileObj = file.file;
    let reader = new FileReader();
    reader.onload = function(e) {
      let hashable = e.target.result;
      hashable = new Uint8Array(hashable);
      hashable = CRC32.buf(hashable).toString();
      file.uniqueIdentifier = hex_md5(hashable+file.itemId + file.file.size);
      file.ready = true;
      this.buildList();
    }.bind(this);
    reader.readAsArrayBuffer(fileObj);
    this.buildList();
  }

  handleSubmit(){
    let ready = true;
    for(var i = 0; i< this.resumable.files.length; i++){
      if (!this.resumable.files[i].ready){
        ready = false;
      }
    }
    if (ready) {
      let uploadData = {};
      for (var i = 0; i < this.resumable.files.length; i++) {
        let obj = {
          'filehash': this.resumable.files[i].uniqueIdentifier,
          'filename': this.resumable.files[i].fileName,
          'itemid': this.resumable.files[i].itemId,
          'totalchuks': this.resumable.files[i].chunks.length
        }
        uploadData[i] = obj;
      }
      console.log(this.resumable.files);
      $.ajax({url: '/api/upload/commit', method: 'POST', data: uploadData})
      this.resumable.upload();
    }
  }

  componentDidMount(){
    this.resumable.assignBrowse(document.getElementById("browse" + this.props.item_id));
    this.resumable.assignDrop(document.getElementById("drop_target" + this.props.item_id));
    this.resumable.on('fileAdded', function(file, event) {
      file.itemId = this.state.item_id;
      file.itemCode = this.state.item_code;
      file.ready = false;
      //this.hashPool.push(file);
      this.getHash(file);
      if(window.resumableContainer[this.state.item_id] == undefined){
        window.resumableContainer[this.props.item_id] = this.resumable;
      }
    }.bind(this));
    this.resumable.on('fileSuccess', function(file,event){
      this.fetchExisting();
      this.buildList();
    }.bind(this));
    this.resumable.on('fileProgress', function(file,event){
      $("#progress_bar"+file.uniqueIdentifier+">span").css('width', file.progress()*100+"%");
      this.buildList();
    }.bind(this));
    this.fetchExisting();
    this.buildList();
  }

  handleDelete(e){
    let filehash = $(e.target).data("item");
    for(var i = 0; i<this.resumable.files.length; i++){
      if(this.resumable.files[i].uniqueIdentifier == filehash){
        this.resumable.files.splice(i,1);
        this.buildList();
      }
    }
  }

  handleResurceUpdate(e){
    let form = $(e.target).parent().parent();
    let data = {
      "id" : form.find("input[name='id']").val()
    };
    form.find(".edit_input").each(function(){
      let chk = $(this).find("input[type='checkbox']");
      let txt = $(this).find("input[type='text']");
      if(chk.length){data[chk.prop('name')]=chk.prop("checked")}
      if(txt.length){data[txt.prop('name')]=txt.val()}
    });
  }

  render() {
    return (
      <div className="item_view">
        <h4 onClick={()=>{this.setState({"open":!this.state.open})}}>{this.props.name}</h4>
        <div className={this.state.open?"item_view_inner open":"item_view_inner"}>
        <h4>Файлы товара</h4>
        <div className="file_list">{this.state.existing}</div>
        <h4>Загрузки</h4>
        <div className="file_list" id={"file_list" + this.props.item_id}>{this.state.uploads}</div>
        <div className="drop_target" id={"drop_target" + this.props.item_id}></div>
        <div className="button_block">
          <button type="button" id={"browse" + this.props.item_id}>Выбрать</button>
          <button type="button" onClick={this.handleSubmit} id={"submit" + this.props.item_id}>Загрузить</button>
        </div>
        </div>
      </div>
    );
  }
}

class UploadPool extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      "resumable_container": window.resumableContainer,
      "pool":[]
    }
    this.getResumableList = this.getResumableList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  getResumableList(){
    let resumables = [];
    let res_container = this.state.resumable_container;
    for(var itemId in res_container){
      resumables.push(<ItemSection key={itemId} item_id={itemId} open_by_default={true} />);
    }
    this.setState({
      "pool":resumables
    });
  }

  componentDidMount(){
    let container = window.resumableContainer;
    this.state.resumable_container = container;
    this.getResumableList();
  }

  handleSubmit(){
    for(var res in this.state.resumable_container){
      this.state.resumable_container[res].upload();
    }
  }

  render(){
    return(
      <div className="upload_pool">
        <h2 className="component_title">Загрузки</h2>
        <div className="upload_pool_inner">
          {this.state.pool}
          <button type="button" onClick={this.handleSubmit}>Загрузить</button>
        </div>
      </div>
    );
  }
}

class PhotoBank extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": {},
      "view_pool": false
    }
    this.fetchUnfinished();
    this.handleNodeChoice = this.handleNodeChoice.bind(this);
  }

  fetchUnfinished(){
    let unfinishedUploads = $("#unfinished_uploads").val().split("|");
    if (unfinishedUploads[0] !== "") {
      for (var i = 0; i < unfinishedUploads.length; i++) {
        let unfinishedParts = unfinishedUploads[i].split(',');
        if(typeof window.resumableContainer[unfinishedParts[0]] == 'undefined'){
          window.resumableContainer[unfinishedParts[0]]=new Resumable({target: '/api/upload/'});
        }
        if(unfinishedParts[0]==this.state.item_id){
          this.uploads.push({'filename': unfinishedParts[1], 'filehash': unfinishedParts[2], 'class': "unfinished", "ready": true});
        }
      }
    }
  }

  handleNodeChoice(id){
    this.setState({
      "selected_node": id
    });
  }

  componentWillMount(){
    //$.getJSON("/assets/js/components/photobank/dummy_data1.json", (data)=>{
    $.getJSON("/catalogue/nodes/", (data)=>{
      this.setState({
        "catalogue_data":data,
        "selected_node":1
      });
    });
  }

  render() {
    if(this.state.catalogue_data != {}){
    return (
      <div className="photobank_main">
      <div className="main_block">
        <CatalogueTree catalogue_data={this.state.catalogue_data} nodeChoiceHandler={this.handleNodeChoice} />
        <NodeViewer catalogue_data={this.state.catalogue_data} node={this.state.selected_node} />
        </div>
        {this.state.view_pool?<UploadPool />:""}
        <div className="butt-wrapper">
        <button type="button" className=" large_btn" onClick={()=>{this.setState({"view_pool":!this.state.view_pool})}}>{this.state.view_pool?"Скрыть":"Загрузки"}</button>
        </div>
      </div>
    );
  } else {return (<h1>ЗАГРУЗКА...</h1>)}
  }
}

if(typeof PhotoBank != 'undefined') ReactDOM.render(<PhotoBank />, document.getElementById('photobank-wrapper'));
