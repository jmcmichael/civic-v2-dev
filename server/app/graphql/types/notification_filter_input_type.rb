module Types
  class NotificationFilterInputType < Types::BaseInputObject
    graphql_name "NotificationFilter"
    description "The notification stream's filter vocabulary, for mutations that apply to every matching notification. Mirrors Resolvers::Notifications' options — keep the two in sync."

    argument :notification_reason, Types::NotificationReasonType, required: false,
      description: "Limit to notifications with this reason."

    argument :subscription_id, Int, required: false,
      description: "Limit to notifications from this subscription."

    argument :originating_object, Types::Subscribable::SubscribableInput, required: false,
      description: "Limit to notifications whose event originated from, or is about, this entity."

    argument :event_type, Types::Events::EventActionType, required: false,
      description: "Limit to notifications whose event performed this action."

    argument :originating_user_id, Int, required: false,
      description: "Limit to notifications originated by this user."

    argument :organization_id, Int, required: false,
      description: "Limit to notifications whose event belongs to this organization."

    argument :include_read, Boolean, required: false, default_value: false,
      description: "Include already-read notifications; defaults to unread only, matching the stream's default view."
  end
end
