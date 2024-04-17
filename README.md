# meganno-ui

## **Prerequisite Knowledge**
Documentation for [MEGAnno concepts](https://meganno.megagon.info) 

MEGAnno-client github repository for [installation instructions](https://github.com/megagonlabs/meganno-client)

## To use in Python Notebook
![version](https://img.shields.io/badge/meganno--ui%20latest-v1.5.6-blue)

You can use either `SSH` or `HTTPS` to install this python package
- Run `pip install git+ssh://git@github.com/megagonlabs/meganno-ui.git`
- Run `pip install git+https://github.com/megagonlabs/meganno-ui.git`
  - You may need to use [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) instead of password
- To update the package: add `--upgrade` flag
- To install a specific version: add `@vx.x.x` tag after the github URL

```python
# To use library modules
from meganno_ui import ...
```
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
  
P.S. Periodically delete JS files created by meganno-ui under `/Users/[username]/Library/Application Support/idom-jupyter/` (run `whoami` to get username from the terminal [macOS])

## Disclosure
This software may include, incorporate, or access open source software (OSS) components, datasets and other third party components, including those identified below. The license terms respectively governing the datasets and third-party components continue to govern those portions, and you agree to those license terms may limit any distribution. You may  use any OSS components under the terms of their respective licenses, which may include BSD 3, Apache 2.0, or other licenses. In the event of conflicts between Megagon Labs, Inc. (“Megagon”) license conditions and the OSS license conditions, the applicable OSS conditions governing the corresponding OSS components shall prevail. 
You agree not to, and are not permitted to, distribute actual datasets used with the OSS components listed below. You agree and are limited to distribute only links to datasets from known sources by listing them in the datasets overview table below. You agree that any right to modify datasets originating from parties other than Megagon  are governed by the respective third party’s license conditions. 
You agree that Megagon grants no license as to any of its intellectual property and patent rights.  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS (INCLUDING MEGAGON) “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. You agree to cease using and distributing any part of the provided materials if you do not agree with the terms or the lack of any warranty herein.
While Megagon makes commercially reasonable efforts to ensure that citations in this document are complete and accurate, errors may occur. If you see any error or omission, please help us improve this document by sending information to contact_oss@megagon.ai.

All open source software components used within the product are listed below (including their copyright holders and the license information).
For OSS components having different portions released under different licenses, please refer to the included Upstream link(s) specified for each of the respective OSS components for identifications of code files released under the identified licenses.

| ID  | OSS Component Name | Modified | Copyright Holder | Upstream Link | License  |
|-----|----------------------------------|----------|------------------|-----------------------------------------------------------------------------------------------------------|--------------------|
| 01 | idom | No  | Ryan S. Morshead | [link](https://github.com/reactive-python/reactpy) | MIT License |
| 02 | idom_jupyter | No  | Ryan S. Morshead | [link](https://github.com/reactive-python/reactpy-jupyter) | MIT License |
| 03 | ipykernel | No  | IPython Development Team | [link](https://github.com/ipython/ipykernel) | BSD 3-Clause License |
| 04 | pydash | No  | Derrick Gilland | [link](https://github.com/dgilland/pydash) | MIT License |
| 05 | requests | No  |  | [link](https://github.com/psf/requests) | Apache License Version 2.0 |
| 06 | varname | No  | pwwang | [link](https://github.com/pwwang/python-varname) | MIT License |

