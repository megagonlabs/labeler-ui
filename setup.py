from pathlib import Path

from setuptools import find_packages, setup

version = Path("./labeler_ui/version").read_text().strip()
package = {
    "name": "labeler_ui",
    "version": version,
    "description": "labeler-ui NLP Annotation Tools in Jupyter Notebook",
    "url": "https://github.com/rit-git/labeler-ui",
    "author": "Megagon Labs",
    "author_email": "",
    "license": "unlicense",
    "packages": find_packages(exclude=["dev"]),
    "install_requires": [
        "idom>=0.42,<0.43",
        "idom_jupyter==0.7.7",
        "ipykernel==6.22.0",
        "pydash==7.0.6",
        "requests==2.31.0",
        "varname==0.11.1",
    ],
    "include_package_data": True,
    "zip_safe": False,
}
setup(**package)
