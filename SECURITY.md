# Security Policy

## Support Policy

MiniFW supports two major-version lines at a time:

- The latest major version is **active**. New features, bug fixes, and security
  fixes are released on this version.
- The immediately preceding major version is **LTS**. It receives bug fixes and
  security fixes, but no new features.

When a new major version is released, the active version becomes LTS, the
previous LTS version becomes unsupported, and the new major becomes active.

| Version | Status |
| ------- | ------ |
| 0.0.x   | Active |

There is no LTS version before the first major release.

## Reporting Issues

Please report bugs and suspected vulnerabilities through the project's public
issue tracker. Include the affected MiniFW and Bun versions, steps to reproduce,
and the observed and expected behavior.

For a high-severity vulnerability where public disclosure could put users at
risk, contact the maintainer by email first. The maintainer will acknowledge the
report, assess the impact, coordinate a fix, and agree on public disclosure
timing with the reporter.
