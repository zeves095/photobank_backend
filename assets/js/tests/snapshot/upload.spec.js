import React from 'react';
import { CatalogueTree } from '../../photobank/components/CatalogueTree';
import { DownloadPool } from '../../photobank/components/DownloadPool';
import { ExistingResource } from '../../photobank/components/ExistingResource';
import { ExistingResources } from '../../photobank/components/ExistingResources';
import { ItemList } from '../../photobank/components/ItemList';
import { ItemSearch } from '../../photobank/components/ItemSearch';
import { ItemSection } from '../../photobank/components/ItemSection';
import { NodeViewer} from '../../photobank/components/NodeViewer';
import { Photobank} from '../../photobank/components/Photobank';
import { PhotoBankWrapper } from '../../photobank/components/PhotoBankWrapper';
import { UnfinishedUploads } from '../../photobank/components/UnfinishedUploads';
import { UploadPool } from '../../photobank/components/UploadPool';
import { Uploads} from '../../photobank/components/Uploads';
import Enzyme, {render, shallow,mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import {store} from '../../account/link-manager/store/'
import {Provider} from 'react-redux';

Enzyme.configure({adapter: new Adapter()});

describe('snapshot testing', ()=>{
    it('CatalogueTree рендерится правильно', () => {
      const tree = render(<Provider store={store}><CatalogueTree /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('DownloadPool рендерится правильно', () => {
      const tree = render(<Provider store={store}><DownloadPool /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('ExistingResource рендерится правильно', () => {
      const tree = render(<Provider store={store}><ExistingResource /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('ExistingResources рендерится правильно', () => {
      const tree = render(<Provider store={store}><ExistingResources /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('ItemList рендерится правильно', () => {
      const tree = render(<Provider store={store}><ItemList /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('ItemSearch рендерится правильно', () => {
      const tree = render(<Provider store={store}><ItemSearch /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('ItemSection рендерится правильно', () => {
      const tree = render(<Provider store={store}><ItemSection /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('NodeViewer рендерится правильно', () => {
      const tree = render(<Provider store={store}><NodeViewer /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('Photobank рендерится правильно', () => {
      const tree = render(<Provider store={store}><Photobank /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('PhotoBankWrapper рендерится правильно', () => {
      const tree = render(<Provider store={store}><PhotoBankWrapper /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('UnfinishedUploads рендерится правильно', () => {
      const tree = render(<Provider store={store}><UnfinishedUploads /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('UploadPool рендерится правильно', () => {
      const tree = render(<Provider store={store}><UploadPool /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('Uploads рендерится правильно', () => {
      const tree = render(<Provider store={store}><Uploads /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
  }
)
