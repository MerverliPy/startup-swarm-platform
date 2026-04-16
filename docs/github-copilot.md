# GitHub Copilot in this platform

## Short answer

Yes, this platform can be designed so users authenticate with GitHub and then use GitHub Copilot features inside the platform.

## The correct mental model

There are two different things here:

1. **GitHub login for your app**
2. **GitHub Copilot API access on behalf of the logged-in user**

They are related, but not identical.

## Recommended setup

### MVP
- GitHub OAuth App for sign-in
- reuse the resulting user token for Copilot SDK requests where supported

### Production-safe upgrade
- GitHub App for repo automation and fine-grained repo permissions
- GitHub App user-to-server tokens or GitHub OAuth user tokens for user-attributed Copilot calls

## Practical constraints

- Copilot is tied to the authenticated user's GitHub identity and subscription
- your app should make Copilot calls on behalf of the user, not with a single shared token for everyone
- your app should keep Copilot and repository access permissions separate in your product design
