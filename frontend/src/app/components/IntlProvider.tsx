"use client";

import { NextIntlClientProvider } from "next-intl";
import { useUserProfile } from "@/contexts/UserProfileContext";

import en from "../../../messages/en.json";
import fr from "../../../messages/fr.json";
import es from "../../../messages/es.json";

type Messages = Record<string, unknown>;

const MESSAGE_MAP: Record<string, Messages> = {
    en: en as Messages,
    fr: fr as Messages,
    es: es as Messages,
};

interface Props {
    children: React.ReactNode;
}

export function IntlProvider({ children }: Props) {
    const { profile } = useUserProfile();
    const locale = profile?.language ?? "en";
    const supported = ["en", "fr", "es"];
    const resolvedLocale = supported.includes(locale) ? locale : "en";
    const messages = MESSAGE_MAP[resolvedLocale] ?? MESSAGE_MAP["en"];

    return (
        <NextIntlClientProvider key={resolvedLocale} locale={resolvedLocale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}