Rails.application.routes.draw do
  root to: 'static#index'

  get '/sign_in' =>"static#index"

  scope 'api', defaults: { format: :json } do
    get '/status', to: 'static#status'
    post '/graphql', to: 'graphql#execute'
    get '/auth/:provider/callback' => 'sessions#create'
    get '/sign_out' => 'sessions#destroy', as: :signout
    post '/upload_profile_image' => 'profile_images#upload'

    if Rails.env.development?
      post '/auth/:provider/callback' => 'sessions#create'
    end
  end

  get '/links' => 'links#redirect'
  get 'links/:idtype/:id' => 'links#redirect'

  mount GraphiQL::Rails::Engine, at: "/api/graphiql", graphql_path: "/api/graphql"

  
  require 'sidekiq/web'
  require 'sidekiq/cron/web'
  mount Sidekiq::Web, at: '/jobs', constraints: UserLoggedInConstraint.new
end
