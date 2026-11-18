# Contribute through pull requests

Help make GTA VI Wire useful, accurate and easy to read. Submit changes as a pull request to https://github.com/Kuberwastaken/gta . Issues are welcome for reproducible bugs and source leads, but a PR is the preferred way to contribute a fix.

**[Fork the repository](https://github.com/Kuberwastaken/gta/fork) · [Open a pull request](https://github.com/Kuberwastaken/gta/compare) · [Preview the PR template](.github/pull_request_template.md)**

## First contribution

1. Fork the repository and create a focused branch. A GitHub account is needed; small text changes can use GitHub's file editor.
2. Edit the relevant Markdown page in `content/`, or the site code. Update an existing page before adding a duplicate.
3. Cite direct sources and date-sensitive evidence. Separate confirmed facts from reporting, rumours and speculation. Never submit stolen/leaked footage, private information, credentials or material you cannot share.
4. Preserve the design, body wikilinks, metadata and topic-graph connections. Keep the homepage ASCII hero free of images; credit and source permitted article imagery separately.
5. Run `npm ci`, `node scripts/check-content.mjs`, `npx tsc --noEmit` and `npx quartz build`. For visual changes inspect mobile and desktop screenshots. Include checks and screenshots in your PR. If you cannot run a check, leave its box unchecked and explain what remains for review.
6. Open the comparison link above. Select base `Kuberwastaken/gta:main` and your fork/changed branch as head ("compare across forks" if needed). There must be a change before GitHub offers "Create pull request".
7. The default `.github/pull_request_template.md` fills the PR description automatically. Fill in the affected page, change, sources, checks and remaining uncertainty. If it is blank, copy the linked template. Maintainers review before merging; a PR is not automatic publication.

## Rights and credit

Submit only work you own or have permission to contribute. Original editorial text is contributed under CC BY 4.0 as described in LICENSE-CONTENT.md; code uses MIT with existing notices preserved. Keep third-party credits and licenses intact and identify exceptions explicitly. You retain ownership. Do not imply the site can relicense Rockstar or other third-party media.

For republication or content-bearing forks, credit the author(s), GTA VI Wire and the original article URL, link the license and mark changes as the license requires. A mere mention does not automatically trigger copyright licensing obligations; linking back is appreciated.
