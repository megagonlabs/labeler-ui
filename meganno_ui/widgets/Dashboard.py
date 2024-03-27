import time

import idom
from varname import argname

from ..idom_loader import load_component
from . import KERNEL_ID


class Dashboard:
    def __init__(self, service=None, config: dict = {}):
        self.__widget = load_component(name="DashboardWidget")
        self.__service = service
        self.__config = config
        if service is not None:
            if type(service) is str:
                self.__service = service
            else:
                self.__service = argname("service")

    @idom.component
    def show(self):
        return self.__widget(
            {
                "config": self.__config,
                "ipy_service": self.__service,
                "ipy_kernel_id": KERNEL_ID,
                "wid": int(time.time() * 1000),
            }
        )
