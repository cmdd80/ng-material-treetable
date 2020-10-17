import { Component, ViewEncapsulation } from "@angular/core";
import { Node, Options } from "./treetable/models";
import { mockTree } from "./treetable/mocks/mockTree";
import { mockTreeAsArrayOfNodes } from "./treetable/mocks/mockTreeAsArrayOfNodes";
import { Folder, Task } from "./treetable/mocks/models";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  singleRootTree: Node<Folder> = mockTree;
  arrayOfNodesTree: Node<Task>[] = mockTreeAsArrayOfNodes;
  options: Options<Task> = {
    expanded: true,
    customColumnOrder: [
      { key: "name", title: "Nome" },
      { key: "completed", title: "Completato" },
      { key: "owner", title: "Proprietario" },
    ],
  };

  onRowClicked(element: any): void {
    console.log({ element });
  }
}
