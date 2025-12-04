# Ara Frontend

What:
For the open-source maintainers, the first PR, monetization platform on the web.
Goal with users:
Let's turn open-source developers into celebrities and whom people could join and build public projects together.

Users change society:
We will change the perception of the celebrities as not only by beauty pictures, or acting roles, but practical, for 
something that's liked by people and used by people. 

This page is dedicated for the open-source maintainers.
If you are not, then for better perspective read from the maintainers point of view.

Ara is the socialization layer on top of the GitHub repository.
All communication with the devs, user requests, contributors regarding your project move to Ara.

In Ara collaboration is gamified. All activities, such as message replies, roadmap planning,
issue reading turns into a 2 click tasks that affects the rating. Most of the ratings comes from
the collective tasks that equally affects all parties. So rating shows how a person works with other people and
with what kind of people and projects. If it doesn't work, then there are always fork who could solve it.

To avoid the bots, and to save your scarce time, for all user's necessary work, for socialization put a paywall.
Ask them to raise an issue on Ara, that will turn for you to 2 click task, speeding up user satisfaction.

We don't charge anything, all goes to you, and to the packages you use in the cascading manner. In return you get the
rating power to pass their paywall, and scarce time. Join to the group of the libraries, favorite languages.
Raise the issues, and features you want. And in Ara it's satisfying, because for your peers its also a two click.

We are just started, and keep the core features. Slowly adding more peers and more features. Want to increase some features,
put the rating votes in the issue, that affects mutual rating by passing the paywall.

This is the frontend of Ara.

### Terminology

* Panel - a block of isolated data with it's own data structure. Sharing only the local storage with other panels. Web page is consists of the panels.
* Container - an effect or UI modifications for any content. All of it's doing is showing the Children as a child element.
* Content - a children of the panel formatted in a custom way. Useful for the panels used as a tab content.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

