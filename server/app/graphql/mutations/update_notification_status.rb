class Mutations::UpdateNotificationStatus < Mutations::BaseMutation
  description "Mark notifications as read/unread — either an explicit list of IDs, or every notification matching a filter set (the notification stream's select-all-matching). The notifications must belong to the requesting user."

  argument :ids, [ Int ], required: false,
    description: "A list of one or more Notification IDs. Provide exactly one of ids or filters."

  argument :filters, Types::NotificationFilterInputType, required: false,
    description: "Apply to every notification of the requesting user matching these filters. Provide exactly one of ids or filters."

  argument :new_status, Types::ReadStatus, required: true,
    description: "The new status of the selected notifications."

  field :notifications, [ Types::Entities::NotificationType ],
    null: false,
    description: "The notifications in their new state. Empty for a filters-mode update — refetch the stream for the new set."

  field :updated_count, Int,
    null: false,
    description: "How many notifications changed status."

  attr_reader :notifications

  def ready?(ids: nil, filters: nil, **_)
    validate_user_logged_in

    if ids.blank? == filters.nil?
      raise GraphQL::ExecutionError, "Provide exactly one of ids or filters."
    end

    if ids.present?
      @notifications = ids.map do |id|
        notification = Notification.find_by(id: id)
        if notification.nil?
          raise GraphQL::ExecutionError, "Notification with id #{id} doesn't exist."
        end
        notification
      end
    end

    return true
  end

  def authorized?(**_)
    (notifications || []).each do |notification|
      if notification.notified_user != context[:current_user]
        raise GraphQL::ExecutionError, "You are only allowed to mark your own notifications as read."
      end
    end

    return true
  end

  def resolve(new_status:, filters: nil, **_)
    if notifications
      notifications.map do |notification|
        notification.seen = new_status
        notification.save!
      end

      {
        notifications: notifications,
        updated_count: notifications.size,
      }
    else
      # filters mode is scoped to the requesting user by construction;
      # the id subquery keeps update_all correct over the joined scope
      count = Notification
        .where(id: filtered_scope(filters).select(:id))
        .update_all(seen: new_status)

      {
        notifications: [],
        updated_count: count,
      }
    end
  end

  private

  # Mirrors Resolvers::Notifications' option clauses — the stream's
  # filter vocabulary. Keep the two in sync.
  def filtered_scope(f)
    scope = Notification.joins(:event).where(notified_user: context[:current_user])
    scope = scope.where(type: f.notification_reason) if f.notification_reason
    scope = scope.where(subscription_id: f.subscription_id) if f.subscription_id
    if f.originating_object
      scope = scope.where(events: { originating_object: f.originating_object })
        .or(scope.where(events: { subject: f.originating_object }))
    end
    scope = scope.where(events: { action: f.event_type }) if f.event_type
    scope = scope.where(originating_user_id: f.originating_user_id) if f.originating_user_id
    scope = scope.where(events: { organization_id: f.organization_id }) if f.organization_id
    scope = scope.where(seen: false) unless f.include_read
    scope
  end
end
