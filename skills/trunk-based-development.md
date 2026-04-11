---
name: Trunk Based Development
description: Use this skill to produce small, short-lived branches that are easy to review and merge on main trunk
---

### Branch naming convention

Whenever starting a new task create a short lived branch formatted like so

`<username>/issue-<issue-number>/<iteration>`

For example

`ruggerovisintin/issue-123/1`

### Small changes only

* Try to keep the size of the branch small, around 500 changed LOCs max
* Make sure unfinished code is not executed by leveraging techniques such as: 
    - Feature Flagging for user facing features
    - Branch by abstraction for refactorings
    - Dark releases for new pieces of code

### Unfinished does not mean broken

Even though unfinished, implemented code still need to be tested and working


## Related Skills

* [Feature Flagging](./feature-flagging.md): Hide user-facing unfinished work while keeping the branch releasable.
* [Test Driven Development](./test-driven-development.md): Keep small, frequent, and safe changes validated continuously.
* [Acceptance Test Driven Development](./acceptance-test-driven-development.md): Define behavior from user scenarios before implementation.

## Additional resources

See: [https://trunkbaseddevelopment.com/](https://trunkbaseddevelopment.com/)