import React from 'react';
import ReactDOM from 'react-dom';
import LinkManagerWrapper from './components/LinkManagerWrapper';
//import {AccountInfo} from '../AccountInfo.jsx';
var wrapper = document.getElementById('link-manager-wrapper');
if(typeof LinkManagerWrapper != 'undefined') ReactDOM.render(<LinkManagerWrapper />, wrapper);



// var wrapper = document.getElementById('account-info-wrapper');
// let userData = {
//   id:wrapper.dataset['id'],
//   name:wrapper.dataset['name'],
//   email:wrapper.dataset['email'],
//   active:wrapper.dataset['active'],
//   password:wrapper.dataset['password'],
//   role:wrapper.dataset['role'],
// }
// console.log(userData);
// if(typeof AccountInfo != 'undefined') ReactDOM.render(<AccountInfo user={userData} />, wrapper);
// wrapper.dataset = [];
