import idom
from varname import argname

from ..idom_loader import load_component
from . import KERNEL_ID


class Annotation:
    def __init__(
        self,
        data: list = [],
        config: dict = {},
        subset=None,
        resultset=None,
        service=None,
    ):
        self.__data = data
        self.__config = config
        self.__subset = subset
        self.__resultset = resultset
        self.__service = service
        title_mapping = {
            "annotating": "Annotation",
            "verifying": "Verification",
            "reconciling": "Reconciliation",
        }
        if "title" not in self.__config and "mode" in self.__config:
            if self.__config["mode"] in ["annotating", "verifying", "reconciling"]:
                self.__config["title"] = title_mapping[self.__config["mode"]]
        if "data_column_width" in self.__config:
            self.__config["data_column_width"] = max(
                300.0, float(self.__config["data_column_width"])
            )
        if "mode" in self.__config and self.__config["mode"] in [
            "verifying",
            "reconciling",
        ]:
            self.__config["view"] = "table"
        if subset is not None:
            if type(subset) is str:
                self.__subset = subset
            else:
                self.__subset = argname("subset")
        elif resultset is not None:
            if type(resultset) is str:
                self.__resultset = resultset
            else:
                self.__resultset = argname("resultset")
        if service is not None:
            if type(service) is str:
                self.__service = service
            else:
                self.__service = argname("service")
        elif subset is not None or resultset is not None:
            print(
                "Service can not be None when widget is initialized under service mode."
            )
        self.__widget = load_component(name="AnnotationWidget")

    def get_data(self):
        return self.__data

    def __set_data(self, data):
        self.__data = data

    @idom.component
    def show(self):
        subset_mode = None
        subset = None
        # prioritize resultset over subset
        if self.__subset is not None:
            subset_mode = "subset"
            subset = self.__subset
        elif self.__resultset is not None:
            subset_mode = "resultset"
            subset = self.__resultset
        if "height" in self.__config:
            self.__config["height"] = max(500, self.__config["height"])
        return self.__widget(
            {
                "data": self.__data,
                "config": self.__config,
                "ipy_set_data": self.__set_data,
                "ipy_subset": subset,
                "subset_mode": subset_mode,
                "ipy_service": self.__service,
                "ipy_kernel_id": KERNEL_ID,
            }
        )
