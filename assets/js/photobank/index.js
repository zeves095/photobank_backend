import React from 'react';
import ReactDOM from 'react-dom';

import { PhotoBankWrapper } from './components/PhotoBankWrapper';

var resumableContainer = [];
global.resumableContainer = resumableContainer;

var wrapper = document.getElementById('photobank-wrapper');
global.config = JSON.parse(wrapper.dataset.config);
wrapper.dataset.config="";

if(typeof PhotoBankWrapper != 'undefined') ReactDOM.render(<PhotoBankWrapper />, wrapper);
