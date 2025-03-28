import { useEffect } from 'react';

export const GoogleTranslate = () => {
  const googleTranslateElementInit = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        autoDisplay: false,
      },
      'google_translate_element',
    );
  };

  useEffect(() => {
    console.log(import.meta.env.PROD)
    const getCookie = (name: string) => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) {
          return decodeURIComponent(value);
        }
      }
      return null;
    };

    const existingLang = getCookie('googtrans');
    if (!existingLang && import.meta.env.PROD) {
      const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
      const detectedLocale = browserLang.toLowerCase();

      if (detectedLocale && detectedLocale !== 'en') {
        const cookieValue = encodeURIComponent(`/en/${detectedLocale}`);
        document.cookie = `googtrans=${cookieValue}; path=/`;
      }
    }

    if (!(window as any).googleTranslateElementInit) {
      const addScript = document.createElement('script');
      addScript.setAttribute(
        'src',
        '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
      );
      document.body.appendChild(addScript);
      (window as any).googleTranslateElementInit = googleTranslateElementInit;
    }
  }, []);

  return (
    <>
      <div id="google_translate_element"></div>
    </>
  );
};