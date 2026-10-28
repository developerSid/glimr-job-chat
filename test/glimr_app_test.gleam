import compiled/loom/home
import gleam/string
import gleam/string_tree
import gleeunit

pub fn main() -> Nil {
  gleeunit.main()
}

// gleeunit test functions end in `_test`
pub fn home_page_renders_title_test() {
  let html = home.render() |> string_tree.to_string

  assert string.contains(html, "<h1>Job Chat</h1>")
}
