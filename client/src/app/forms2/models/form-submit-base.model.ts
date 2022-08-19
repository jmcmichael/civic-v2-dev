// form-submit base model mirrors the Submit Item models, with all fields optional.
// specific form model extend this base type by assigning to the fields attribute
// a copy of its Submit...Input type with all Nullable types converted to optional
// base enums/primitives such that all fields are enums, primitives, or arrays of
// enums/primitives
export interface FormSubmitBaseModel {
  clientMutationId?: string
  comment?: string
  organizationId?: number
  fields: any
}
