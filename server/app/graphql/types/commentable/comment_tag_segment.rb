module Types::Commentable
  class CommentTagSegment < Types::BaseObject
    field :entity_id, GraphQL::Types::Int, null: false
    field :display_name, GraphQL::Types::String, null: false
    field :tag_type, Types::Commentable::TaggableEntity, null: false
    field :status, Types::EvidenceStatusType, null: true
    field :deprecated, GraphQL::Types::Boolean, null: true
    field :link, GraphQL::Types::String, null: false
    field :revision_set_id, GraphQL::Types::Int, null: true
  end
end
