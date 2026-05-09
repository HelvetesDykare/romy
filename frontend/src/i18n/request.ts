import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
    // Default to English — locale is handled client-side via UserProfileContext
    return {
        locale: "en",
        messages: (await import(`../messages/en.json`)).default,
    };
});
