import {
  Ability,
  AbilityBuilder,
  defineAbility,
  ForbiddenError,
} from "@casl/ability";

const p = (input) => console.log(input);

class Entity {
  constructor(attrs) {
    Object.assign(this, attrs);
  }
}

class Article extends Entity {}

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

{
  p("--- example 5 ---");

  const ability = defineAbility((can, cannot) => {
    can("manage", "all");
    cannot("delete", "all");
  });

  p(ability.can("read", "Post")); // direct rules are checked by logical "OR"
  p(ability.can("delete", "Post")); // inverted rules are checked by logical "AND"
}

{
  p("--- example 6 ---");

  const user = { id: 1 };
  const ability = defineAbility((can, cannot) => {
    cannot("read", "all", { private: true });
    can("read", "all", { authorId: user.id });
  });

  p(ability.can("read", { private: true }));
  p(ability.can("read", { authorId: user.id }));
  p(ability.can("read", { authorId: user.id, private: true })); // -> true. always remember to put inverted rules after the direct one!
}

{
  p("--- example 7 ---");

  const ability = defineAbility((can, cannot) => {
    can("read", "all");
    cannot("read", "all", { private: true }).because(
      "You are not allowed to read private information"
    );
  });

  try {
    ForbiddenError.from(ability).throwUnlessCan("read", { private: true });
  } catch (e) {
    p(e.message);
  }
}

{
  p("--- example 8 ---");

  const ability = new Ability();

  const unsubscribe = ability.on("update", ({ rules, target }) => {
    p(rules);
    p(target);
  });

  const { can, rules } = new AbilityBuilder();
  can("read", "all");

  ability.update(rules);

  unsubscribe();
}
