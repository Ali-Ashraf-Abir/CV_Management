import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "de")) {
    locale = routing.defaultLocale;
  }

  const [nav, theme, language, login, register, attributes, cv, cvProfile, profile, adminUsers, positions] =
    await Promise.all([
      import(`../messages/${locale}/nav.json`),
      import(`../messages/${locale}/theme.json`),
      import(`../messages/${locale}/language.json`),
      import(`../messages/${locale}/login.json`),
      import(`../messages/${locale}/register.json`),
      import(`../messages/${locale}/attributes.json`),
      import(`../messages/${locale}/cv.json`),
      import(`../messages/${locale}/cvProfile.json`),
      import(`../messages/${locale}/profile.json`),
      import(`../messages/${locale}/admin-users.json`),
      import(`../messages/${locale}/positions.json`),
    ]);

  return {
    locale,
    messages: {
      nav: nav.default,
      theme: theme.default,
      language: language.default,
      login: login.default,
      register: register.default,
      attributes: attributes.default,
      cv: cv.default,
      cvProfile: cvProfile.default,
      profile: profile.default,
      adminUsers: adminUsers.default,
      positions: positions.default,
    },
  };
});