# TheNextWe Dev Challenge

Write a simple HTTP REST API using Node.js and Koa, backed by either MongoDB or a dummy in-memory persistence layer.

It should model the following entities internally:

* User
  * `role`: one of `client`, `coach`, `pm` (project manager), `ops` (operations)
* Project
  * `managerIds`: a list of user ID references
* Coaching
  * `clientId`: ID of the client user (the person being coached)
  * `coachId`: ID of the coach user
  * `projectId`: ID of the project this coaching is associated with

Feel free to add other fields to these entities as they make sense for your implementation – the above just represents the core relations between them.

The API offers the following endpoints:

* `GET /projects`
  * lists _all_ projects for users with the `ops` role
  * for users with the `pm` role, lists the projects that include the user's ID in the `managerIds` list
  * denies access for users with other roles
* `GET /coachings`
  * lists _all_ coachings for users with the `ops` role
  * for users with the `pm` role, lists coachings whose `projectId` refers to a project that includes the user's ID in the `managerIds` list
  * for users with the `client` or `coach` role, only returns coachings with that user's ID in the `clientId` resp. `coachId` field

Consider the fact that a real-life system will have other resources (e.g. coaching calls, module results) that need the same or similar levels of role- and project-based access restrictions.

Ignore unrelated API aspects (e.g. response data pagination), or stub them (e.g. in terms of authentication, it's fine if requests just include a user ID as the "password").

Feel free to use suitable npm packages.

There should be unit tests that verify correct authorization functionality of the endpoints.

Please share the project as a git repo (I'm @yelworc on GitHub and GitLab if you'd like to keep it a private repo).
