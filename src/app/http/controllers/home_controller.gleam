//// Home Controller
////
//// Serves the application's home page.
////

import compiled/loom/home
import glimr/http/response.{type Response}

/// @get "/"
///
pub fn show() -> Response {
  home.render() |> response.string_tree(200)
}
