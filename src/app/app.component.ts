import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Node, Options } from './treetable/models';
import { mockTree } from './treetable/mocks/mockTree';
import { mockTreeAsArrayOfNodes } from './treetable/mocks/mockTreeAsArrayOfNodes';
import { Folder, Task } from './treetable/mocks/models';
import { TreetableComponent } from './treetable/component/treetable.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  @ViewChild(TreetableComponent) treetable: any;

  singleRootTree: Node<Folder> = mockTree;
  arrayOfNodesTree: Node<Task>[] = mockTreeAsArrayOfNodes;
  options: Options<Task> = {
    expanded: true,
    customColumnOrder: [
      { key: 'name', title: 'Nome', visible: true },
      { key: 'completed', title: 'Completato',  visible: true },
      { key: 'owner', title: 'Proprietario', visible: true  },
    ],
  };

  query: string;

  onRowClicked(element: any): void {
    console.log({ element });
  }

  onSearch(): void {
    // Implicit fCompare
    // this.treetable.filterData(this.query, '*');
    this.treetable.filterData(this.query, 'owner');

    // Explicit fCompare
    // this.treetable.filterData(this.query, 'owner', function (node: any, key: string, query: string) {
    //   return node.value[key] == query;
    // });
  }
}
