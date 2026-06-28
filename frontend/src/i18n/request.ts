import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "de")) {
    locale = routing.defaultLocale;
  }

  const [nav, theme, language, login, register] = await Promise.all([
    import(`../messages/${locale}/nav.json`),
    import(`../messages/${locale}/theme.json`),
    import(`../messages/${locale}/language.json`),
    import(`../messages/${locale}/login.json`),
    import(`../messages/${locale}/register.json`),
  ]);

  return {
    locale,
    messages: {
      nav: nav.default,
      theme: theme.default,
      language: language.default,
      login: login.default,
      register: register.default,
    },
  };
});