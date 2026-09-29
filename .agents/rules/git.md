---
trigger: always_on
---

---

trigger: always_on
description: Git and team collaboration rules for the hackathon repository.

---

# Git & Team Collaboration Rules

## Repository Safety

GitHub is the shared source of truth for the project.

Before making significant changes:

- Check the current Git status.
- Inspect the current branch.
- Inspect recent commits when context is unclear.
- Understand existing changes before modifying related files.

Never assume the working tree is clean.

## Protect Other People's Work

The repository is shared by multiple humans and agents.

- Never overwrite unrelated changes.
- Never discard another person's uncommitted work.
- Never revert files simply because they differ from the agent's expected state.
- Preserve existing functionality unless the task explicitly requires changing it.
- If two implementations conflict, stop and report the conflict.

## Branches

Prefer focused branches for substantial independent work.

Use descriptive branch names such as:

- `feature/auth`
- `feature/dashboard`
- `feature/api`
- `fix/login-error`
- `integration/backend-frontend`

Do not create unnecessary branches for tiny changes.

## Commits

When committing is requested:

- Make focused commits.
- Use clear imperative commit messages.
- Avoid mixing unrelated changes in one commit.

Examples:

```text
feat: add user authentication
feat: add dashboard API
fix: handle invalid login response
test: add authentication API tests
refactor: simplify API client
```

Do not create meaningless commits such as:

- update
- changes
- final
- test
- asdf

## Pull Requests

When pull requests are used:

- Keep them focused.
- Explain what changed.
- Mention relevant testing.
- Identify known limitations.
- Do not merge unrelated work.

## Forbidden Destructive Git Operations

git reset --hard
git clean -fd
git clean -fdx
git push --force
git push --force-with-lease
git branch -D

Do not rewrite shared branch history.

## Main Branch

Treat the main branch as protected.

Do not directly make risky experimental changes on main.

Before merging substantial work into main:

- Verify the application builds.
- Run relevant tests.
- Check for unresolved errors.
- Review the changed files.

## Before Commit

Check:

git status

Review:

- Changed files
- Untracked files
- Deleted files
- Unexpected modifications

Never commit:

- .env
- .env.local
- credentials
- API keys
- private keys
- generated secrets
- large datasets
- machine-specific configuration

## Before Push

Confirm:

- The intended branch is checked out.
- The intended files are being pushed.
- No secrets are included.
- Tests/build checks have passed where practical.
- The push does not overwrite another person's work.

## Conflict Handling

If a merge conflict occurs:

- Do not blindly choose one side.
- Understand what each side changed.
- Preserve required functionality from both sides where appropriate.
- Resolve the conflict.
- Run relevant tests.
- Report the resolution.

## Multi-Agent Coordination

Before editing a file that another agent is likely modifying:

- Check the current state.
- Avoid simultaneous conflicting edits.
- Prefer clearly separated file ownership.

If ownership is unclear, ask the Project Lead rather than guessing.

## Hackathon Priority

During time-critical development:

1. Keep main stable.
2. Prefer small, reversible changes.
3. Integrate frequently.
4. Test after integration.
5. Avoid large unreviewed changes near the final demo.

A working simpler implementation is preferable to an unstable sophisticated implementation.
