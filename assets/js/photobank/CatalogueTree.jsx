import React from 'react';
// import $ from 'jquery';

export class CatalogueTree extends React.Component {

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
