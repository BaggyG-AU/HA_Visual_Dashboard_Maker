Read docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md in full.

Activate governance mode for:

PHASE_NAME: Phase X
CURRENT_VERSION: <version>
INITIATION_VERSION: <version>

Constraints:

- Governance mode only.
- Do NOT implement code.
- Write the governance blueprint directly to:
  docs/governance/phases/<phase-name-slug>-blueprint.md
- Include required metadata header.
- Validate version bump logic.
- Enforce ai_rules.md compliance.
- Produce executable feature prompts for every slice.
- Include packaging plan.
- Include Stop Conditions.
- Include Medium Gate prompt.
- Stage file and prepare commit message.
- Ask before committing.

Output only:
- Confirmation that file was written.
- Filename.
- Proposed commit message.
