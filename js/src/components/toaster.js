import { Position, Toaster } from "@blueprintjs/core";
import _ from "lodash";
import { faIcon } from "./icon";
export const actionToaster =
    typeof window !== "undefined"
        ? Toaster.create({
              position: Position.BOTTOM,
          })
        : null;
export const createToast = (toast, theme = "") => ({
    className: theme,
    icon: _.isNil(toast.icon)
        ? null
        : faIcon({
              icon: toast.icon,
          }),
    action: toast.action,
    intent: toast.intent,
    message: toast.message,
    timeout: _.isUndefined(toast.timeout) ? 5000 : toast.timeout,
});
