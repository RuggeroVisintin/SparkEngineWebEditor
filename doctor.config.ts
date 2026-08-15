// doctor.config.ts
import { defineConfig } from "react-doctor/api";

export default defineConfig({
  ignore: {
    rules: ["react-doctor/no-barrel-import"],
  },
});