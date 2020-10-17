import { Injectable } from '@angular/core';
import { Node } from '../../models';
import { isEmpty, xor } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  validateCustomOrder<T>(node:Node<T>, customColumnOrderKeys: Array<keyof T> & string[]): { valid: boolean, xor: string[] } {
     console.log({customColumnOrderKeys})
    const xorN = xor(Object.keys(node.value), customColumnOrderKeys);
    return {
      valid: isEmpty(xorN),
      xor: xorN
    };
  }
}
