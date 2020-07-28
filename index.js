const DJANGO_MIGRATION_REGEX = /src\/django_apps\/[^/]+\/migrations\/[^/]+.py$/;
const DJANGO_MIGRATION_BACKWARDS_COMPAT_WARNING =
  "This pull request contains Django migrations. Please ensure that the migrations are backwards compatible and will not cause issues during deployment when old code tries to run against the newly migrated database.";

module.exports = app => {
  app.on("pull_request.opened", async context => {
    app.log("Pull Request opened");

    const allFiles = await context.github.paginate(
      context.github.pulls.listFiles.endpoint.merge(context.issue()),
      response => response.data
    );
    const containsDjangoMigrations = allFiles.some(file =>
      DJANGO_MIGRATION_REGEX.test(file.filename)
    );

    if (containsDjangoMigrations) {
      const params = context.issue({ body: DJANGO_MIGRATION_BACKWARDS_COMPAT_WARNING });
      return context.github.issues.createComment(params);
    }
  });
};
