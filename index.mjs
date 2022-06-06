import { defineAbility } from "@casl/ability";

const p = (input) => console.log(input);

{
  p("--- example 1 ---");

  const ability = defineAbility((can, cannot) => {
    can("manage", "all");
    cannot("delete", "User");
  });

  p(ability.can("read", "Post"));
  p(ability.can("read", "User"));
  p(ability.can("update", "User"));
  p(ability.can("delete", "User"));
  p(ability.cannot("delete", "User"));
}

class Entity {
  constructor(attrs) {
    Object.assign(this, attrs);
  }
}

class Article extends Entity {}

{
  p("--- example 2 ---");

  const defineAbilityFor = (user) =>
    defineAbility((can) => {
      can("read", "Article");

      if (user.isLoggedIn) {
        can("update", "Article", { authorId: user.id });
        can("create", "Comment");
        can("update", "Comment", { authorId: user.id });
      }
    });

  const user = { id: 1, isLoggedIn: true };
  const ownArticle = new Article({ authorId: user.id });
  const anotherArticle = new Article({ authorId: 2 });
  const ability = defineAbilityFor(user);

  p(ability.can("read", "Article"));
  p(ability.can("update", "Article"));
  p(ability.can("update", ownArticle));
  p(ability.can("update", anotherArticle));
}

{
  p("--- example 3 ---");

  const defineAbilityFor = (user) =>
    defineAbility((can) => {
      can("read", "Article");
      can("update", "Article", ["title", "description"], { authorId: user.id });

      if (user.isModerator) {
        can("update", "Article", ["published"]);
      }
    });

  const moderator = { id: 2, isModerator: true };
  const ownArticle = new Article({ authorId: moderator.id });
  const foreignArticle = new Article({ authorId: 10 });
  const ability = defineAbilityFor(moderator);

  p(ability.can("read", "Article"));
  p(ability.can("update", "Article", "published"));
  p(ability.can("update", ownArticle, "published"));
  p(ability.can("update", foreignArticle, "title"));
}

{
  p("--- example 4 ---");

  const ability = defineAbility((can) => {
    can("read", "Article", { published: true });
  });
  const article = new Article({ published: true });

  p(ability.can("read", article));
  p(ability.can("do", "SomethingUndeclared"));
  p(ability.can("read", "Article")); // -> true. "can I read SOME article?"
}
