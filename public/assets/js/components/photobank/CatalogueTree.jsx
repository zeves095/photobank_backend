class CatalogueTree extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "catalogue_nodes": [],
      "catalogue_tree": []
    }
    this.parseCatalogueStructure = this.parseCatalogueStructure.bind(this);
    this.getNodeById = this.getNodeById.bind(this);
    this.getNodeParent = this.getNodeParent.bind(this);
    this.getNodeChildren = this.getNodeChildren.bind(this);
    this.getNodeLevel = this.getNodeLevel.bind(this);
    this.populateTree = this.populateTree.bind(this);
    this.getEntity = this.getEntity.bind(this);
  }

  parseCatalogueStructure(data){
    let nodes = this.getEntity("cnode", data);
    let items = this.getEntity("item", data);
    this.setState({
      "catalogue_nodes": nodes,
      "catalogue_items": items
    });
    let catalogueData = [];
    catalogueData = nodes.map((cnode)=>{
      cnode.hasChildren = this.getNodeChildren(cnode).length>0;
      cnode.catLevel = 0;
      cnode.level = this.getNodeLevel(cnode);
      return cnode;
    });
    this.setState({
      "catalogue_nodes": catalogueData
    });
    let catalogueTree = this.populateTree();
    this.setState({
      "catalogue_tree": catalogueTree
    });
  }

  getEntity(type, src){
    let result = [];
    for(var i = 0; i<src.length; i++){
      if(src[i].type == type){
        result.push(src[i]);
      }
    }
    return result;
  }

  populateTree(baseParent=0){
    let element = [];
    let parent = this.getNodeById(baseParent);
    console.log(parent);
    let children = this.getNodeChildren(parent);
    for(var i = 0; i<children.length; i++){
      let child = children[i];
      if(child.type=="cnode"){
        if(child.hasChildren){
          element.push(<li key={child.id}><b>{child.name}</b><ul>{this.populateTree(child.id)}</ul></li>);
        } else {
          element.push(<li key={child.id}><b>{child.name}</b></li>)  ;
        }
      } else if(child.type=="item"){
        element.push(<li key={child.id}><i>{child.name}</i></li>)  ;
      }
    }
    return element;
  }

  getNodeParent(node){
    for(var i = 0; i<this.state.catalogue_nodes.length; i++){
      if(node.parent == this.state.catalogue_nodes[i].id){
        return this.state.catalogue_nodes[i];
      }
    }
    return null;
  }

  getNodeById(id){
    for(var i = 0; i<this.state.catalogue_nodes.length; i++){
      if(id == this.state.catalogue_nodes[i].id){
        return this.state.catalogue_nodes[i];
      }
    }
    return null;
  }

  getNodeChildren(node){
    console.log(node);
    let children = [];
    for(var i = 0; i<this.state.catalogue_nodes.length; i++){
      if(node.id == this.state.catalogue_nodes[i].parent && node.id !== this.state.catalogue_nodes[i].id){
        children.push(this.state.catalogue_nodes[i]);
      }
    }
    for(var i = 0; i<this.state.catalogue_items.length; i++){
      if(node.id == this.state.catalogue_items[i].parent && node.id !== this.state.catalogue_items[i].id){
        children.push(this.state.catalogue_items[i]);
      }
    }
    return children;
  }

  getNodeLevel(node){
    if(node.parent !== 0){
      return this.getNodeLevel(this.getNodeParent(node))+1;
    }
    return 0;
  }

  componentDidMount(){
    $.getJSON("/assets/js/components/photobank/dummy_data1.json", (data)=>{this.parseCatalogueStructure(this.props.catalogue_data)});
  }

  render() {

    return (
      <div className="catalogue_tree">
        <ul>
          {this.state.catalogue_tree}
        </ul>
      </div>
    );
  }
}

// export default new CatalogueTree();
