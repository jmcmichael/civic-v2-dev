// corresponding classes from, mapped to CvcGeneSelectField:
// https://stackoverflow.com/questions/68657071/how-to-extend-class-with-generics-combined-with-mixins-in-angular
// <<mixin>> Table: hasValueChanges.mixin
// BaseList: FieldType<FieldTypeConfig<CvcGeneSelectFieldProps>>
// BaseResourceModel: FieldTypeConfig<T extends FormlyFieldProps>
// ConcreteClass: CvcGeneSelectField
import { OnInit, OnDestroy, Component } from '@angular/core'

export abstract class BaseResourceModel {
  public id?: string
}

type ConcreteClass<C> = new (...args: any[]) => C

export interface IBaseList<T extends BaseResourceModel>
  extends ConcreteClass<BaseList<T>> {}

export function TableMixin<T extends BaseResourceModel>() {
  return function <B extends IBaseList<T>>(Base: B) {
    class Temporary extends Base implements OnInit {
      ngOnInit(): void {}
    }
    return Temporary
  }
}

@Component({ template: '' })
export abstract class BaseList<T extends BaseResourceModel>
  implements OnInit, OnDestroy
{
  ngOnInit(): void {}
  ngOnDestroy(): void {}
}

@Component({ template: '' })
export abstract class BaseServerList<
  T extends BaseResourceModel
> extends BaseList<T> {}

const TMBRM = TableMixin<BaseResourceModel>()
/* const TMBRM: <B extends IBaseList<BaseResourceModel>>(Base: B) => {
    new (...args: any[]): TableMixin<BaseResourceModel>.(Anonymous function)<B>.Temporary;
    prototype: TableMixin<...>.(Anonymous function)<...>.Temporary;
} & B */

class DummyBaseList<T> extends BaseList<T> {}

const TMBRMDBL = TMBRM(DummyBaseList)
/*const TMBRMDBL: {
    new (...args: any[]): TableMixin<BaseResourceModel>.(Anonymous function)<typeof DummyBaseList>.Temporary;
    prototype: TableMixin<...>.(Anonymous function)<...>.Temporary;
} & typeof DummyBaseList */

class BST<T> extends TMBRMDBL<T> {} // okay

class BaseServerTable<T> extends TableMixin<BaseResourceModel>()(
  DummyBaseList
)<T> {}
