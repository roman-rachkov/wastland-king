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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!window.googleTranslateElementInit) {
      const addScript = document.createElement('script');
      addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
      document.body.appendChild(addScript);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.googleTranslateElementInit = googleTranslateElementInit;
    }
  }, []);
  return (
    <>
      <div id="google_translate_element"></div>
    </>
  );
};
