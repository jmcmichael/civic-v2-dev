class Mutations::CreateMolecularProfile < Mutations::BaseMutation
  description 'Create a new Molecular Profile in order to attach Evidence Items to it.'

  argument :structure, Types::MolecularProfile::MolecularProfileComponentInput,
    required: true,
    validates: { Types::MolecularProfile::MolecularProfileComponentValidator => {} },
    description: 'Representation of the constituent parts of the Molecular Profile along with the logic used to combine them.'

  field :molecular_profile, Types::Entities::MolecularProfileType, null: false,
   description: 'The newly created (or already existing) Molecular Profile.'

  attr_reader :variants

  def ready?(structure: )
    validate_user_logged_in
    variant_ids = structure.variant_ids.uniq

    @variants = Variant.where(id: variant_ids)

    if variants.size !=  variant_ids.size
      missing = variant_ids - variants.map(&:id)
      raise  GraphQL::ExecutionError, "Variants with ID [#{missing.join(', ')}] were not found."
    end

    return true
  end

  def resolve(structure: )
    cmd = Actions::CreateComplexMolecularProfile.new(
      variants: variants,
      structure: structure,
    )

    res = cmd.perform

    if res.succeeded?
      {
        molecular_profile: res.molecular_profile
      }
    else
      raise GraphQL::ExecutionError, res.errors.join(', ')
    end
  end
end
