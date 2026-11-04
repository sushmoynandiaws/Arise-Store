import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Language = "bn" | "en";

export const translations = {
  en: {
    // Nav
    allProducts: "All products",
    shops: "Independent shops",
    trackOrder: "Track order",
    myPurchases: "My purchases",
    openShop: "Open your shop",
    howItWorks: "How it works",
    wishlist: "Wishlist",
    savedItems: "Saved items",
    noSavedItems: "Your wishlist is empty",
    browseProducts: "Browse products",

    // Track order
    trackTitle: "Track your orders",
    trackSubtitle: "Find your purchases and follow their payment and delivery status.",
    emailLabel: "Email address",
    emailPlaceholder: "e.g. name@example.com",
    phoneLabel: "Phone number",
    phonePlaceholder: "e.g. 01712345678",

    // Payment
    receivingAccount: "Receiving account",
    exactAmount: "Exact amount",
    enterTrxPrompt: "After payment, enter your Transaction ID (TrxID) below:",
    verifyPaymentBtn: "Submit TrxID & verify payment",
    copyBtn: "Copy",
    copiedBtn: "Copied!",
    payWith: "Pay with",
    merchantAccount: "Merchant Account",
    personalAccount: "Personal Account",
    makePaymentOption: "Make Payment (পেমেন্ট)",
    sendMoneyOption: "Send Money (সেন্ড মানি)",
    merchantAlert: "Important: This is a Merchant Account. In your mobile wallet, you MUST choose 'Payment' (পেমেন্ট). Do NOT choose Send Money.",
    personalAlert: "Important: This is a Personal Account. In your mobile wallet, you MUST choose 'Send Money' (সেন্ড মানি). Do NOT choose Payment.",
    stepOpenWallet: "Open your wallet app",
    stepSelectPaymentOption: "Select transaction option:",
    stepSubmitTrxId: "Submit Transaction ID (TrxID) below",
  },
  bn: {
    // Nav
    allProducts: "সব প্রোডাক্ট",
    shops: "স্বাধীন শপসমূহ",
    trackOrder: "অর্ডার ট্র্যাক",
    myPurchases: "আমার অর্ডার",
    openShop: "দোকান খুলুন",
    howItWorks: "কীভাবে কাজ করে",
    wishlist: "উইশলিস্ট",
    savedItems: "পছন্দের তালিকা",
    noSavedItems: "আপনার উইশলিস্টে কোনো পণ্য নেই",
    browseProducts: "প্রোডাক্ট ব্রাউজ করুন",

    // Track order
    trackTitle: "আপনার অর্ডার ট্র্যাক করুন",
    trackSubtitle: "আমার অর্ডারসমূহ থেকে পেমেন্ট ও ডেলিভারির অবস্থা দেখুন।",
    emailLabel: "ইমেইল অ্যাড্রেস",
    emailPlaceholder: "যেমন: name@example.com",
    phoneLabel: "ফোন নম্বর",
    phonePlaceholder: "যেমন: ০১৭১২৩৪৫৬৭৮",

    // Payment
    receivingAccount: "সেলার একাউন্ট নম্বর",
    exactAmount: "প্রদেয় টাকা",
    enterTrxPrompt: "পেমেন্ট সম্পন্ন হলে Transaction ID (TrxID) নিচে দিন:",
    verifyPaymentBtn: "TrxID সাবমিট করে ভেরিফাই করুন",
    copyBtn: "কপি",
    copiedBtn: "কপি হয়েছে!",
    payWith: "পেমেন্ট মাধ্যম:",
    merchantAccount: "মার্চেন্ট একাউন্ট",
    personalAccount: "পার্সোনাল একাউন্ট",
    makePaymentOption: "পেমেন্ট করুন (Make Payment)",
    sendMoneyOption: "সেন্ড মানি করুন (Send Money)",
    merchantAlert: "সতর্কতা: এটি একটি মার্চেন্ট একাউন্ট। আপনার ওয়ালেট অ্যাপ থেকে অবশ্যই 'Payment' (পেমেন্ট করুন) অপশন ব্যবহার করবেন। সেন্ড মানি (Send Money) করবেন না।",
    personalAlert: "সতর্কতা: এটি একটি পার্সোনাল একাউন্ট। আপনার ওয়ালেট অ্যাপ থেকে অবশ্যই 'Send Money' (সেন্ড মানি করুন) অপশন ব্যবহার করবেন। পেমেন্ট (Payment) করবেন না।",
    stepOpenWallet: "আপনার মোবাইল ওয়ালেট অ্যাপ খুলুন",
    stepSelectPaymentOption: "মেনু থেকে অপশন নির্বাচন করুন:",
    stepSubmitTrxId: "নিচের ঘরে TrxID প্রদান করুন",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

type LangContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
};

const LangContext = createContext<LangContextType>({
  lang: "bn",
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => translations.bn[key] || key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("arise_lang");
      return saved === "en" || saved === "bn" ? saved : "bn";
    } catch {
      return "bn";
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("arise_lang", newLang);
    } catch {}
  };

  const toggleLang = () => {
    setLang(lang === "bn" ? "en" : "bn");
  };

  const t = (key: TranslationKey): string => {
    const table = translations[lang] || translations.bn;
    return table[key] || translations.en[key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
