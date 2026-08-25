require "test_helper"

# Guards the three sort columns `evidenceItems(sortBy:)` gained for the
# evidence manager.
#
# All three columns already had sorters in the client table, and none of them
# worked: `molecularProfile` and `therapyInteractionType` had no entry in the
# column-to-sort-column map, so clicking their headers sent
# `sortBy: { column: undefined }` against a non-null argument and failed the
# whole query, while `therapies` was marked `disabled: true` because there was
# nothing to send. The client now types a column's sort against
# EvidenceSortColumns, so an unmapped sorter cannot compile; this is the other
# half, that the members it can name actually order rows.
#
# THERAPY_NAME is the one worth testing hardest. Therapies are habtm, so the
# obvious join multiplies rows — and since the resolver's DISTINCT ON list ends
# in `id`, each therapy would survive as its own tuple and an evidence item
# would come back once per therapy.
class EvidenceItemsSortTest < ActiveSupport::TestCase
  def setup
    @user = users(:curator)
  end

  def sorted_ids(column, direction = "ASC")
    query = <<~GRAPHQL
      query($sortBy: EvidenceSort) {
        evidenceItems(sortBy: $sortBy, first: 100) {
          nodes { id }
        }
      }
    GRAPHQL

    response = Civic2Schema.execute(
      query,
      variables: { "sortBy" => { "column" => column, "direction" => direction } },
      context: { current_user: @user }
    )

    assert_nil response["errors"], response["errors"].inspect
    response.dig("data", "evidenceItems", "nodes").map { |node| node["id"] }
  end

  def names_in_returned_order(ids, &block)
    items = EvidenceItem.where(id: ids).index_by(&:id)
    ids.map { |id| block.call(items.fetch(id)) }
  end

  test "molecular profile name orders rows and reverses" do
    ascending = sorted_ids("MOLECULAR_PROFILE_NAME")
    descending = sorted_ids("MOLECULAR_PROFILE_NAME", "DESC")

    names = names_in_returned_order(ascending) { |ei| ei.molecular_profile.name }

    assert_equal names.sort, names
    assert_equal ascending.to_set, descending.to_set,
      "reversing the direction should reorder the same rows, not select different ones"
    refute_equal ascending, descending
  end

  # The regression this column exists to prevent: one row per evidence item,
  # however many therapies it has. Built rather than found, because no fixture
  # carries two therapies and this is the whole reason the sort is a subquery
  # instead of a join. Rolled back with the test transaction.
  test "therapy name does not duplicate an item with several therapies" do
    multi = EvidenceItem.where.not(status: "rejected").first
    # only one therapy fixture exists, so the second and third are built here
    multi.therapies = [
      Therapy.first,
      Therapy.create!(name: "Zzz Late Therapy", ncit_id: "C99901"),
      Therapy.create!(name: "Aaa Early Therapy", ncit_id: "C99902"),
    ]

    assert_operator multi.therapies.size, :>, 1, "test setup did not attach several therapies"

    ids = sorted_ids("THERAPY_NAME")

    assert_equal 1, ids.count(multi.id),
      "evidence item #{multi.id} has #{multi.therapies.size} therapies and came back #{ids.count(multi.id)} times"
  end

  test "therapy name orders by the alphabetically first therapy" do
    ids = sorted_ids("THERAPY_NAME")

    names = names_in_returned_order(ids) { |ei| ei.therapies.map(&:name).min }
    # rows with no therapy sort last, so only the named ones need to be ordered
    named = names.compact

    assert_equal named.sort, named
    assert_equal names.compact, names.first(named.length),
      "items with no therapy should sort after the ones that have them"
  end

  test "therapy interaction type orders rows with the unset ones last" do
    combination, sequential, unset = EvidenceItem.where.not(status: "rejected").first(3)
    # an interaction type is only valid on an item with two or more therapies
    # (evidence_item_validator.rb:43), which is irrelevant to ordering — set the
    # column directly rather than perturb associations. Rolled back with the test.
    combination.update_column(:therapy_interaction_type, "Combination")
    sequential.update_column(:therapy_interaction_type, "Sequential")
    unset.update_column(:therapy_interaction_type, nil)

    ids = sorted_ids("THERAPY_INTERACTION_TYPE")

    assert_operator ids.index(combination.id), :<, ids.index(sequential.id)
    assert_operator ids.index(sequential.id), :<, ids.index(unset.id),
      "NULLS LAST should keep unset interaction types at the end"
  end

  test "every declared sort column is accepted by the resolver" do
    columns = Types::BrowseTables::EvidenceSortColumns.values.keys

    columns.each do |column|
      assert_nothing_raised { sorted_ids(column) }
    end
  end
end
