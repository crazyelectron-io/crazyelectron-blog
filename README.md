
# Build CrazyElectron Blog site

```Shell
❯ yarn create nuxt-app crazyelectron
yarn create v1.22.10
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
success Installed "create-nuxt-app@3.5.2" with binaries:
      - create-nuxt-app
[##########################################################################################] 342/342
create-nuxt-app v3.5.2
✨  Generating Nuxt.js project in crazyelectron
? Project name: crazyelectron
? Programming language: JavaScript
? Package manager: Yarn
? UI framework: Tailwind CSS
? Nuxt.js modules: Content - Git-based headless CMS
? Linting tools: ESLint
? Testing framework: None
? Rendering mode: Universal (SSR / SSG)
? Deployment target: Server (Node.js hosting)
? Development tools: jsconfig.json (Recommended for VS Code if you\'re not using typescript)
? Continuous integration: None
? Version Control System: Git
yarn run v1.22.10
$ eslint --ext ".js,.vue" --ignore-path .gitignore . --fix
✨  Done in 0.79s.

🎉  Successfully created project crazyelectron

  To get started:

    cd crazyelectron
    yarn dev

  To build & start for production:

    cd crazyelectron
    yarn build
    yarn start
```

Add the TailwindCSS v2 module:

```Shell
❯ cd crazyelectron

❯ git init
Reinitialized existing Git repository in /Users/ron/Documents/projects/crazyelectron/.git/

❯ git-crypt init
Generating key...

❯ git remote add origin git@github.com:crazyelectron-io/crazyelectron.git

❯ git remote -v
origin	git@github.com:crazyelectron-io/crazyelectron.git (fetch)
origin	git@github.com:crazyelectron-io/crazyelectron.git (push)

❯ git push --set-upstream origin master
Enumerating objects: 44, done.
Counting objects: 100% (44/44), done.
Delta compression using up to 8 threads
Compressing objects: 100% (36/36), done.
Writing objects: 100% (44/44), 152.12 KiB | 2.08 MiB/s, done.
Total 44 (delta 2), reused 0 (delta 0)
remote: Resolving deltas: 100% (2/2), done.
To github.com:crazyelectron-io/crazyelectron.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.

❯ yarn add --dev tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9
yarn add v1.22.10
info No lockfile found.
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...

success Saved lockfile.
success Saved 67 new dependencies.
info Direct dependencies
└─ tailwindcss@2.0.3
```

```Shell
❯ yarn add -D sass-loader node-sass nuxt-purgecss
yarn add v1.22.10
warning package.json: No license field
warning No license field
[1/4] 🔍  Resolving packages...
warning node-sass > request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
warning node-sass > node-gyp > request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
warning node-sass > request > har-validator@5.1.5: this library is no longer supported
warning nuxt-purgecss > purgecss-webpack-plugin > webpack > watchpack > watchpack-chokidar2 > chokidar@2.1.8: Chokidar 2 will break on node v14+. Upgrade to chokidar 3 with 15x less dependencies.
warning nuxt-purgecss > purgecss-webpack-plugin > webpack > watchpack > watchpack-chokidar2 > chokidar > fsevents@1.2.13: fsevents 1 will break on node v14+ and could be using insecure binaries. Upgrade to fsevents 2.
warning nuxt-purgecss > purgecss-webpack-plugin > webpack > micromatch > snapdragon > source-map-resolve > resolve-url@0.2.1: https://github.com/lydell/resolve-url#deprecated
warning nuxt-purgecss > purgecss-webpack-plugin > webpack > micromatch > snapdragon > source-map-resolve > urix@0.1.0: Please see https://github.com/lydell/urix#deprecated
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
warning "nuxt-purgecss > purgecss-webpack-plugin@2.3.0" has unmet peer dependency "webpack@*".
warning " > sass-loader@11.0.1" has unmet peer dependency "webpack@^5.0.0".
[4/4] 🔨  Building fresh packages...
success Saved lockfile.
warning No license field
success Saved 306 new dependencies.
info Direct dependencies
├─ node-sass@5.0.0
├─ nuxt-purgecss@1.0.0
└─ sass-loader@11.0.1
```

```Shell
❯ yarn add @nuxt/content
yarn add v1.22.10
[1/4] 🔍  Resolving packages...
warning @nuxt/content > @nuxt/types > @types/autoprefixer > @types/browserslist@4.15.0: This is a stub types definition. browserslist provides its own type definitions, so you do not need this installed.
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
warning "@nuxtjs/eslint-config > eslint-plugin-jest > @typescript-eslint/experimental-utils > @typescript-eslint/typescript-estree > tsutils@3.20.0" has unmet peer dependency "typescript@>=2.8.0 || >= 3.2.0-dev || >= 3.3.0-dev || >= 3.4.0-dev || >= 3.5.0-dev || >= 3.6.0-dev || >= 3.6.0-beta || >= 3.7.0-dev || >= 3.7.0-beta".
warning "@nuxtjs/eslint-module > eslint-webpack-plugin@2.5.0" has unmet peer dependency "webpack@^4.0.0 || ^5.0.0".
warning "nuxt-purgecss > purgecss-webpack-plugin@2.3.0" has unmet peer dependency "webpack@*".
warning " > sass-loader@11.0.1" has unmet peer dependency "webpack@^5.0.0".
[4/4] 🔨  Building fresh packages...
success Saved lockfile.
success Saved 125 new dependencies.
info Direct dependencies
└─ @nuxt/content@1.13.1
```

```Shell
❯ yarn add tailwindcss-dark-mode
yarn add v1.22.10
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
warning "@nuxtjs/eslint-config > eslint-plugin-jest > @typescript-eslint/experimental-utils > @typescript-eslint/typescript-estree > tsutils@3.20.0" has unmet peer dependency "typescript@>=2.8.0 || >= 3.2.0-dev || >= 3.3.0-dev || >= 3.4.0-dev || >= 3.5.0-dev || >= 3.6.0-dev || >= 3.6.0-beta || >= 3.7.0-dev || >= 3.7.0-beta".
warning "@nuxtjs/eslint-module > eslint-webpack-plugin@2.5.0" has unmet peer dependency "webpack@^4.0.0 || ^5.0.0".
warning "nuxt-purgecss > purgecss-webpack-plugin@2.3.0" has unmet peer dependency "webpack@*".
warning " > sass-loader@11.0.1" has unmet peer dependency "webpack@^5.0.0".
[4/4] 🔨  Building fresh packages...
success Saved lockfile.
success Saved 2 new dependencies.
info Direct dependencies
└─ tailwindcss-dark-mode@1.1.7
info All dependencies
├─ normalize.css@8.0.1
└─ tailwindcss-dark-mode@1.1.7
✨  Done in 2.91s.

❯ yarn add @nuxtjs/color-mode
yarn add v1.22.10
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
warning "@nuxtjs/eslint-config > eslint-plugin-jest > @typescript-eslint/experimental-utils > @typescript-eslint/typescript-estree > tsutils@3.20.0" has unmet peer dependency "typescript@>=2.8.0 || >= 3.2.0-dev || >= 3.3.0-dev || >= 3.4.0-dev || >= 3.5.0-dev || >= 3.6.0-dev || >= 3.6.0-beta || >= 3.7.0-dev || >= 3.7.0-beta".
warning "@nuxtjs/eslint-module > eslint-webpack-plugin@2.5.0" has unmet peer dependency "webpack@^4.0.0 || ^5.0.0".
warning "nuxt-purgecss > purgecss-webpack-plugin@2.3.0" has unmet peer dependency "webpack@*".
warning " > sass-loader@11.0.1" has unmet peer dependency "webpack@^5.0.0".
[4/4] 🔨  Building fresh packages...
success Saved lockfile.
success Saved 1 new dependency.
info Direct dependencies
└─ @nuxtjs/color-mode@2.0.3
info All dependencies
└─ @nuxtjs/color-mode@2.0.3
✨  Done in 2.02s.
```
