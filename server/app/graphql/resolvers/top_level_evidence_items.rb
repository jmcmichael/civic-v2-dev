require "search_object/plugin/graphql"

class Resolvers::TopLevelEvidenceItems < GraphQL::Schema::Resolver
  @@base_select_fields = [ "evidence_level", "rating", "id" ]

  include SearchObject.module(:graphql)

  type Types::Entities::EvidenceItemType.connection_type, null: false

  description "List and filter evidence items."

  scope {
    EvidenceItem
      .all
      .order("evidence_level ASC, rating DESC, id ASC")
      .where.not(status: "rejected")
      .select(generate_select)
  }

  def generate_select(field = nil)
    query_fields = @@base_select_fields.dup.prepend(field).compact
    "DISTINCT ON (#{query_fields.join(",")}) evidence_items.*"
  end

  option(:id, type: GraphQL::Types::Int, description: "Exact match filtering on the ID of the evidence item.") do |scope, value|
    scope.where("evidence_items.id = ?", value)
  end
  option(:ids, type: [ GraphQL::Types::Int ], description: "Filter to evidence matching a list of EIDs") do |scope, value|
    scope.where("evidence_items.id IN (?)", value)
  end
  option(:variant_id, type: GraphQL::Types::Int, description: "Exact match filtering on the ID of the variant.") do |scope, value|
    scope.joins(molecular_profile: [ :variants ]).where("variants.id = ?", value)
  end
  option(:molecular_profile_id, type: GraphQL::Types::Int, description: "Exact match filtering on the ID of the molecular profile.") do |scope, value|
    scope.where("evidence_items.molecular_profile_id = ?", value)
  end
  option(:assertion_id, type: GraphQL::Types::Int, description: "Exact match filtering on the ID of the assertion.") do |scope, value|
    scope.joins(:assertions).where("assertions.id = ?", value)
  end
  option(:organization, type: Types::OrganizationFilterType, description: "Filter EIDs on the organization the evidence item was submitted under.") do  |scope, value|
    if value.include_subgroups && !value.ids.blank?
      org_ids = Organization.where(id: value.ids).flat_map { |o| o.org_and_suborg_ids }
      scope.joins(:submission_event).where({ events: { organization_id: org_ids } })
    elsif !value.ids.blank?
      scope.joins(:submission_event).where({ events: { organization_id: value.ids } })
    elsif !value.name.blank?
      scope.joins(submission_event: [ :organization ]).where("organizations.name ILIKE ?", "#{value.name}%")
    else
      scope
    end
  end
  option(:user_id, type: GraphQL::Types::Int, description: "Exact match filtering on the ID of the user who submitted the evidence item.") do |scope, value|
    scope.joins(:submission_event).where("events.originating_user_id = ?", value)
  end
  option(:disease_name, type: GraphQL::Types::String, description: "Substring filtering on disease name.") do |scope, value|
    scope.joins("INNER JOIN diseases AS disease_names ON evidence_items.disease_id = disease_names.id ")
      .where("disease_names.name ILIKE ?", "%#{value}%")
  end
  option(:therapy_name, type: GraphQL::Types::String, description: "Substring filtering on therapy name.") do |scope, value|
    scope.joins("INNER JOIN evidence_items_therapies AS eit_names on eit_names.evidence_item_id = evidence_items.id")
      .joins("INNER JOIN therapies AS therapy_names ON therapy_names.id = eit_names.therapy_id")
      .where("therapy_names.name ILIKE ?", "%#{value}%")
  end
  option(:description, type: GraphQL::Types::String, description: "Substring filtering on evidence item description.") do |scope, value|
    scope.where("evidence_items.description ILIKE ?", "%#{value}%")
  end
  option(:evidence_level, type: Types::EvidenceLevelType, description: "Filtering on the evidence level.") do |scope, value|
    scope.where(evidence_level: value)
  end
  option(:evidence_type, type: Types::EvidenceTypeType, description: "Filtering on the evidence type.") do |scope, value|
    scope.where(evidence_type: value)
  end
  option(:evidence_direction, type: Types::EvidenceDirectionType, description: "Filtering on the evidence direction.") do |scope, value|
    scope.where(evidence_direction: value)
  end
  option(:significance, type: Types::EvidenceSignificanceType, description: "Filtering on the evidence significance.") do |scope, value|
    scope.where(significance: value)
  end
  option(:variant_origin, type: Types::VariantOriginType, description: "Filtering on the evidence variant origin.") do |scope, value|
    scope.where(variant_origin: value)
  end
  option(:therapy_interaction_type, type: Types::TherapyInteractionType, description: "Filtering on how an evidence item's multiple therapies interact.") do |scope, value|
    scope.where(therapy_interaction_type: value)
  end
  option(:evidence_rating, type: GraphQL::Types::Int, description: "Filtering on the evidence rating. Valid values: 1, 2, 3, 4, 5") do |scope, value|
    scope.where(rating: value)
  end
  option(:status, type: Types::EvidenceStatusFilterType, description: "Filtering on the evidence status.") do |scope, value|
    if value == "ALL"
      scope.unscope(where: :status)
    elsif value == "NON_REJECTED"
      scope.unscope(where: :status).where.not(status: "rejected")
    else
      scope.unscope(where: :status).where(status: value)
    end
  end
  option(:phenotype_id, type: GraphQL::Types::Int, description: "Exact match filtering of the evidence items based on the internal CIViC phenotype id") do |scope, value|
    scope.joins(:phenotypes).where("phenotypes.id = ?", value)
  end
  option(:disease_id, type: GraphQL::Types::Int, description: "Exact match filtering of the evidence items based on the internal CIViC disease id") do |scope, value|
    scope.joins(:disease).where("diseases.id = ?", value)
  end
  option(:therapy_id, type: GraphQL::Types::Int, description: "Exact match filtering of the evidence items based on the internal CIViC therapy id") do |scope, value|
    scope.joins(:therapies).where("therapies.id = ?", value)
  end
  option(:source_id, type: GraphQL::Types::Int, description: "Exact match filtering of the evidence items based on the interal CIViC source id") do |scope, value|
    scope.joins(:source).where("sources.id = ?", value)
  end
  option(:clinical_trial_id, type: GraphQL::Types::Int, description: "Exact match filtering of the evidence items based on the CIViC clinical trial id linked to the evidence item's source") do |scope, value|
    scope.joins(source: [ :clinical_trials ]).where("clinical_trials.id = ?", value)
  end
  option(:molecular_profile_name, type: GraphQL::Types::String, description: "Substring filtering on molecular profile name") do |scope, value|
    results = Searchkick.search(
                  value,
                  models: [ MolecularProfile ],
                  fields: [ "name" ],
                  match: :word_start,
                  misspellings: { below: 1 }
    ).where(name: { ilike: "%#{value}%" })

    ids = results.hits.map { |x| x["_id"] }
    scope.joins(:molecular_profile).where(molecular_profiles: { id: ids })
  end


  # The name of the alphabetically first therapy attached to an evidence item,
  # as a correlated subquery.
  #
  # Therapies are habtm, so joining them multiplies rows — and because the
  # DISTINCT ON list ends in `id`, every therapy would survive as its own
  # distinct tuple and the evidence item would appear once per therapy. A
  # scalar subquery keeps one row per evidence item. It also has to appear in
  # the DISTINCT ON list verbatim, since Postgres requires those expressions to
  # match the leading ORDER BY ones.
  FIRST_THERAPY_NAME = <<~SQL.squish
    (SELECT MIN(therapies.name)
       FROM therapies
       INNER JOIN evidence_items_therapies
               ON evidence_items_therapies.therapy_id = therapies.id
      WHERE evidence_items_therapies.evidence_item_id = evidence_items.id)
  SQL

  option :sort_by, type: Types::BrowseTables::EvidenceSortType, description: "Columm and direction to sort evidence on." do |scope, value|
    case value.column
    when "DISEASE_NAME"
      scope.left_joins(:disease).reorder("diseases.name #{value.direction} NULLS LAST")
        .reselect(generate_select("diseases.name"))
    when "MOLECULAR_PROFILE_NAME"
      # molecular_profile is a required belongs_to, so an inner join cannot drop
      # rows the way it would for the optional disease above
      scope.joins(:molecular_profile).reorder("molecular_profiles.name #{value.direction} NULLS LAST")
        .reselect(generate_select("molecular_profiles.name"))
    when "THERAPY_NAME"
      # Arel.sql because Rails' raw-SQL guard rejects an ORDER BY that is not a
      # plain column reference. The string is a constant above and the only
      # interpolation is `direction`, which the SortDirection enum constrains to
      # ASC or DESC.
      scope.reorder(Arel.sql("#{FIRST_THERAPY_NAME} #{value.direction} NULLS LAST"))
        .reselect(Arel.sql(generate_select(FIRST_THERAPY_NAME)))
    when "THERAPY_INTERACTION_TYPE"
      # an integer-backed enum, and Constants::THERAPY_INTERACTION_TYPES happens
      # to be declared alphabetically, so the column sorts the way the labels
      # read. Given its own branch rather than falling through below only for
      # NULLS LAST — most evidence items have no interaction type, and the
      # default puts nulls first on DESC.
      scope.reorder("therapy_interaction_type #{value.direction} NULLS LAST")
        .reselect(generate_select("therapy_interaction_type"))
    when "EVIDENCE_RATING"
      scope.reorder("rating #{value.direction} NULLS LAST")
    else
      scope.reorder("#{value.column.downcase} #{value.direction}")
        .reselect(generate_select(value.column.downcase))
    end
  end
end
