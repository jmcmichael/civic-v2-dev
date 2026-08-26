require "test_helper"

class UpdateNotificationStatusTest < ActiveSupport::TestCase
  def setup
    @curator = users(:curator)
    @editor = users(:editor)
    @notification = notifications(:curator_notification)
    @update_status_mutation = <<-GRAPHQL
      mutation($ids: [Int!]!, $newStatus: ReadStatus!) {
        updateNotificationStatus(input: { ids: $ids, newStatus: $newStatus }) {
          notifications {
            id
            seen
          }
        }
      }
    GRAPHQL
  end

  test "requires authentication" do
    response = execute_mutation(
      @update_status_mutation,
      variables: { ids: [ @notification.id ], newStatus: "READ" },
    )
    assert_graphql_error(response, /must log in/i)
  end

  test "marks notification as read" do
    refute @notification.seen
    response = execute_mutation(
      @update_status_mutation,
      user: @curator,
      variables: { ids: [ @notification.id ], newStatus: "READ" },
    )
    result = response.dig("data", "updateNotificationStatus", "notifications")
    assert_not_nil result
    assert_equal 1, result.length
    assert result[0]["seen"]

    @notification.reload
    assert @notification.seen
  end

  test "marks notification as unread" do
    @notification.update!(seen: true)
    response = execute_mutation(
      @update_status_mutation,
      user: @curator,
      variables: { ids: [ @notification.id ], newStatus: "UNREAD" },
    )
    result = response.dig("data", "updateNotificationStatus", "notifications")
    assert_not_nil result
    refute result[0]["seen"]
  end

  test "rejects non-existent notification id" do
    response = execute_mutation(
      @update_status_mutation,
      user: @curator,
      variables: { ids: [ 999999 ], newStatus: "READ" },
    )
    assert_graphql_error(response, /notification with id .* does(n't| not) exist/i)
  end

  test "rejects marking another user's notification" do
    response = execute_mutation(
      @update_status_mutation,
      user: @editor,
      variables: { ids: [ @notification.id ], newStatus: "READ" },
    )
    assert_graphql_error(response, /only allowed to mark your own notifications as read/i)
  end

  # -- filters mode: the notification stream's select-all-matching --

  def filters_mutation
    <<-GRAPHQL
      mutation($filters: NotificationFilter, $ids: [Int!], $newStatus: ReadStatus!) {
        updateNotificationStatus(input: { filters: $filters, ids: $ids, newStatus: $newStatus }) {
          updatedCount
          notifications { id }
        }
      }
    GRAPHQL
  end

  def build_notification(user, seen:)
    Notification.create!(
      notified_user: user,
      originating_user: @editor,
      event: @notification.event,
      subscription: @notification.subscription,
      seen: seen,
      type: :subscribed_event,
      description: "extra"
    )
  end

  test "filters mode marks every matching unread notification, scoped to the requesting user" do
    mine_unread = build_notification(@curator, seen: false)
    mine_read = build_notification(@curator, seen: true)
    theirs = build_notification(@editor, seen: false)

    response = execute_mutation(
      filters_mutation,
      user: @curator,
      variables: { filters: {}, newStatus: "READ" },
    )

    result = response.dig("data", "updateNotificationStatus")
    # the fixture notification plus mine_unread; the read one is outside
    # the default unread-only filter and the other user's is out of scope
    assert_equal 2, result["updatedCount"]
    assert_equal [], result["notifications"]
    assert @notification.reload.seen
    assert mine_unread.reload.seen
    assert mine_read.reload.seen
    refute theirs.reload.seen
  end

  test "filters mode honors includeRead" do
    mine_read = build_notification(@curator, seen: true)

    response = execute_mutation(
      filters_mutation,
      user: @curator,
      variables: { filters: { includeRead: true }, newStatus: "UNREAD" },
    )

    assert_equal 2, response.dig("data", "updateNotificationStatus", "updatedCount")
    refute mine_read.reload.seen
  end

  test "requires exactly one of ids or filters" do
    neither = execute_mutation(
      filters_mutation,
      user: @curator,
      variables: { newStatus: "READ" },
    )
    assert_graphql_error(neither, /exactly one of ids or filters/i)

    both = execute_mutation(
      filters_mutation,
      user: @curator,
      variables: { ids: [ @notification.id ], filters: {}, newStatus: "READ" },
    )
    assert_graphql_error(both, /exactly one of ids or filters/i)
  end
end
