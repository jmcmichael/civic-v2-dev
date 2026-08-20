require "search_object"
require "search_object/plugin/graphql"

class Resolvers::BrowseMolecularProfiles < GraphQL::Schema::Resolver
  include SearchObject.module(:graphql)
  include Resolvers::Shared::SearchHelpers

  type Types::BrowseTables::BrowseMolecularProfileType.connection_type, null: false

  # Ordering by the least aggregated name per row, written out per direction
  # instead of interpolated. `Arel.sql` marks a string as trusted SQL, so
  # splicing anything into one is a Brakeman SQL-injection finding even when
  # the spliced value is pinned to two literals a line earlier — and a
  # suppression would have to be re-justified every time this is read. Four
  # constants are cheaper than that, and there is nothing left to trust.
  MIN_NAME_SORTS = {
    [ "features", "ASC" ] => Arel.sql(
      "(SELECT MIN(elem->>'name') FROM json_array_elements(features) elem) ASC, id ASC"
    ),
    [ "features", "DESC" ] => Arel.sql(
      "(SELECT MIN(elem->>'name') FROM json_array_elements(features) elem) DESC, id ASC"
    ),
    [ "variants", "ASC" ] => Arel.sql(
      "(SELECT MIN(elem->>'name') FROM json_array_elements(variants) elem) ASC, id ASC"
    ),
    [ "variants", "DESC" ] => Arel.sql(
      "(SELECT MIN(elem->>'name') FROM json_array_elements(variants) elem) DESC, id ASC"
    ),
  }.freeze

  scope do
    MaterializedViews::MolecularProfileBrowseTableRow
      .all
      .order("evidence_score DESC, id ASC")
  end

  option(:ids, type: [ Int ], description: "Filter by internal CIViC ids") do |scope, value|
    scope.where(id: value)
  end

  option(:molecular_profile_name, type: String) do |scope, value|
    results = Searchkick.search(
                  value,
                  models: [ MolecularProfile ],
                  fields: [ "name" ],
                  match: :word_start,
                  misspellings: { below: 1 }
    ).where(name: { ilike: "%#{value}%" })

    ids = results.hits.map { |x| x["_id"] }

    scope.where(id: ids)
  end

  option(:variant_name, type: String)  do |scope, value|
    scope.where(json_name_query_for_column(scope.table_name, "variants"), "#{value}%")
      .or(scope.where(json_name_query_for_column(scope.table_name, "features"), "#{value}"))
  end

  option(:feature_name, type: String) do |scope, value|
    scope.where(json_name_query_for_column(scope.table_name, "features"), "#{value}%")
  end
  option(:disease_name, type: String) do |scope, value|
    scope.where(json_name_query_for_column(scope.table_name, "diseases"), "%#{value}%")
  end
  option(:therapy_name, type: String) do |scope, value|
    scope.where(json_name_query_for_column(scope.table_name, "therapies"), "%#{value}%")
  end
  option(:molecular_profile_alias, type: String) { |scope, value| scope.where(array_query_for_column("alias_names"), "%#{value}%") }
  option(:variant_id, type: Int) do |scope, value|
    scope.where(id: MolecularProfile.joins(:variants).where(variants: { id: value }).select("molecular_profiles.id"))
  end

  option :sort_by, type: Types::BrowseTables::MolecularProfilesSortType do |scope, value|
    direction = value.direction == "DESC" ? "DESC" : "ASC"
    case value.column
    when "evidenceItemCount"
      scope.reorder "evidence_item_count #{direction}"
    when "assertionCount"
      scope.reorder "assertion_count #{direction}"
    when "molecularProfileScore"
      scope.reorder "evidence_score #{direction}"
    when "variantCount"
      scope.reorder "variant_count #{direction}"
    when "id"
      scope.reorder "id #{direction}"
    # NOTE: no plain name sort — the view's name column stores the
    # tokenized form ('NOT #VID270 AND #VID324'); display names resolve at
    # the GraphQL layer, so ordering by it is variant-id order in disguise.
    # The alphabetical keys are the aggregated features'/variants' REAL
    # names: the least name per row (the json aggregates order by id).
    when "featureName"
      # fetch, not [] — an unknown key must raise rather than quietly return
      # nil and drop the ordering the caller asked for
      scope.reorder MIN_NAME_SORTS.fetch([ "features", direction ])
    when "variantName"
      scope.reorder MIN_NAME_SORTS.fetch([ "variants", direction ])
    end
  end
end
