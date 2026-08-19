module Types::BrowseTables
  class MolecularProfilesSortColumns < Types::BaseEnum
    value "evidenceItemCount"
    value "assertionCount"
    value "molecularProfileScore"
    value "variantCount"
    value "id"
    value "featureName", description: "Sorts by the alphabetically first feature name among the profile's variants."
    value "variantName", description: "Sorts by the alphabetically first variant name in the profile."
  end
end
