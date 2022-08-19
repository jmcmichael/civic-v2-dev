import { Maybe } from '@app/generated/civic.apollo'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { FormSubmitBaseModel } from '../models/form-submit-base.model'

export default function assignFieldConfigDefaultValues(
  fieldGroup: FormlyFieldConfig[],
  initialModel: any
): FormlyFieldConfig[] {
  // finds field config object in nested FormlyFieldConfig[]
  const findConfig = (
    fg: FormlyFieldConfig[],
    key: string
  ): Maybe<FormlyFieldConfig> => {
    let found: Maybe<FormlyFieldConfig> = undefined
    for (let ffc of fg) {
      if (ffc.fieldGroup) {
        found = findConfig(ffc.fieldGroup, key)
      } else if (ffc.key === key) {
        found = ffc
        break
      }
    }
    return found
  }

  // for each attribute key in the initial model, finds the
  // field config object matching the key and assigns
  // its default value from the initia model
  const assignDefs = (fg: FormlyFieldConfig[], model: any) => {
    // iterate over keys of initialModel, recursively
    for (let key of Object.keys(model)) {
      if (model[key] instanceof Object && !Array.isArray(model[key])) {
        assignDefs(fg, model[key])
      } else {
        // find field config with same key & assign default value
        const ffc = findConfig(fg, key)
        if (ffc) {
          ffc.defaultValue = model[key]
        } else {
          console.warn(
            `initial model specified ${key}, but no field config with that key found.`
          )
        }
      }
    }
    return fg
  }
  return assignDefs(fieldGroup, initialModel)
}

// function newUserMenu(original: Array<IMenuNode>): Array<IMenuNode> {
//     const newMenu: Array<IMenuNode> = []
//     for (let menu of original) {
//         if (User.hasAccess(menu)) { // Or other conditions

//             // To ensure new reference
//             // Note not passing the children, it must pass through recursive method below
//             const newNode = new DataNode(menu.title, menu.haveChildren, menu.id, null, menu.link, menu.img, menu.value);
//             newMenu.push(newNode);
//             if (newNode.haveChildren) {
//                 newNode.node = newUserMenu(menu.node);
//             }
//         }
//     }
//     return newMenu;
// }
