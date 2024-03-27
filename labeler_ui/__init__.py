from pathlib import Path

import idom_jupyter

PRODUCTION = True
BUNDLE_JS = "bundle.min.js"
try:
    from .dev.development import get_epoch

    PRODUCTION = False
    BUNDLE_JS = "bundle.js"
except ImportError or ModuleNotFoundError:
    pass
_VERSION_PATH = Path(__file__).parent / "version"
VERSION = Path(_VERSION_PATH).read_text().strip()
print("labeler-ui: " + VERSION)
MODULE_NAME = f"labeler_ui@{VERSION}"
BUNDLE_PATH = Path(__file__).parent / BUNDLE_JS
FALLBACK = "Failed to display labeler_ui widget."

# register callback for colab
try:
    import IPython
    from google.colab import output as colab_output

    def labeler_colab_callback(code):
        import json
        from contextlib import redirect_stdout
        from io import StringIO

        colab_callback_result = StringIO()
        with redirect_stdout(colab_callback_result):
            exec(code)
        return IPython.display.JSON(
            json.loads(colab_callback_result.getvalue().strip())
        )

    colab_output.register_callback(
        "notebook.labeler_colab_callback", labeler_colab_callback
    )
except Exception as ex:
    pass

from .widgets.Annotation import Annotation
