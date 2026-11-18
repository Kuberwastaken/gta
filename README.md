# GTA VI Wire

An independent, sourced Grand Theft Auto VI reference: guides, news, release details, characters, the Leonida map, music, trailers and a graded leaks ledger.

**Read the site: https://gta.kuber.studio/**

## Contributions welcome as pull requests

Found a better source, factual error or useful guide improvement? Fork this repo and open a focused PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for source standards, checks and rights. Keep claims graded, cite primary sources and preserve the existing design. Issues can hold bugs/source leads; PRs are the preferred contribution route.

**[Contribution steps](CONTRIBUTING.md) · [Fork](https://github.com/Kuberwastaken/gta/fork) · [Open a PR](https://github.com/Kuberwastaken/gta/compare) · [PR template](.github/pull_request_template.md)**

The PR description is prefilled with the template after you select a changed branch. Choose base `Kuberwastaken/gta:main` and your fork/branch as head.

## Reuse with credit

Original editorial text is **CC BY 4.0**. Credit the named author(s) and GTA VI Wire, retain the original article link where reasonably practicable, link the license and indicate changes. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md) for scope, exclusions and attribution examples. We appreciate links when you mention the site too, but do not add a nonstandard restriction to CC BY.

Code remains **MIT**, with the existing [LICENSE.txt](LICENSE.txt) and upstream notices preserved. Rockstar/Take-Two and other third-party media, trademarks, quotations, fonts and dependencies keep their own rights and are excluded from the editorial license.

## Development

Built on [Quartz v4](https://quartz.jzhao.xyz/), originally by jackyzha0 and contributors.

```sh
npm ci
node scripts/check-content.mjs
npx tsc --noEmit
npx quartz build
```

Articles live in `content/`; source and editorial notes live in `research/`. Do not commit credentials, private correspondence or unrelated personal files. GTA VI Wire is not affiliated with or endorsed by Rockstar Games or Take-Two Interactive.
