import React from 'react';
import ReactDOM from 'react-dom';

import { PhotoBank } from './PhotoBank';

var resumableContainer = [];
global.resumableContainer = resumableContainer;

var wrapper = document.getElementById('photobank-wrapper');
global.config = JSON.parse(wrapper.dataset.config);
wrapper.dataset.config="";

if(typeof PhotoBank != 'undefined') ReactDOM.render(<PhotoBank />, wrapper);
