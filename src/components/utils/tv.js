import { createTV } from "tailwind-variants";
import _appConfig from "#build/app.config";
const appConfigTv = _appConfig;
export const tv = createTV(appConfigTv.ui?.tv);
