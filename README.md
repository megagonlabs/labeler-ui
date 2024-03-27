# labeler-ui
## To use in Python Notebook
![version](https://img.shields.io/badge/labeler--ui%20latest-v1.5.6-blue)

You can use either `SSH` or `HTTPS` to install this python package
- Run `pip install git+ssh://git@github.com/rit-git/labeler-ui.git`
- Run `pip install git+https://github.com/rit-git/labeler-ui.git`
  - You may need to use [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) instead of password
- To update the package: add `--upgrade` flag
- To install a specific version: add `@vx.x.x` tag after the github URL

```python
# To use library modules
from labeler_ui import ...
```
For detailed documentation, please refer to [GitHub Wiki](https://github.com/rit-git/labeler-ui/wiki).
## For UI development
- Clone and [create your own branch](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository)
- Under **root** folder
  - Run `pip install -e .`
- Under **/js** folder
  - Run `npm install`
  - Run `npm run watch`: this automatically rebundles JS components for you; then restart the notebook to test
- [Submit pull-request](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) to `stage` branch
  - `stage` branch is a **development** branch.
  - `main` branch is a **production** branch.
  
P.S. Periodically delete JS files created by labeler-ui under `/Users/[username]/Library/Application Support/idom-jupyter/` (run `whoami` to get username from the terminal [macOS])