import React from 'react';
import { LinkManager } from '../../account/link-manager/components/LinkManager';
import { LinkAdder } from '../../account/link-manager/components/LinkAdder';
import { LinkList } from '../../account/link-manager/components/LinkList';
import { LinkAddForm } from '../../account/link-manager/components/LinkAddForm';
import { LinkResource } from '../../account/link-manager/components/LinkResource';
import { ResourceExplorer } from '../../account/link-manager/components/ResourceExplorer';
import { ResourceSearchForm } from '../../account/link-manager/components/ResourceSearchForm';
import { ResourceSearchResults } from '../../account/link-manager/components/ResourceSearchResults';
import Enzyme, {render, shallow,mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import {store} from '../../account/link-manager/store/';
import {Provider} from 'react-redux';

Enzyme.configure({adapter: new Adapter()});

describe('snapshot testing', ()=>{
    it('LinkManager рендерится правильно', () => {
      const tree = render(<Provider store={store}><LinkManager /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('LinkAdder рендерится правильно', () => {
      const tree = render(<Provider store={store}><LinkAdder /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('LinkList рендерится правильно', () => {
      const tree = render(<Provider store={store}><LinkList links={[]} /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('LinkAddForm рендерится правильно', () => {
      const tree = render(<Provider store={store}><LinkAddForm resource_chosen={[]} /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('LinkResource рендерится правильно', () => {
      const tree = render(<Provider store={store}><LinkResource resources={[]} /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('ResourceExplorer рендерится правильно', () => {
      const tree = render(<Provider store={store}><ResourceExplorer /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('ResourceSearchForm рендерится правильно', () => {
      const tree = render(<Provider store={store}><ResourceSearchForm /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('ResourceSearchResults рендерится правильно', () => {
      const tree = render(<Provider store={store}><ResourceSearchResults resources_found={[]} /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
  }
)
