import { useEffect } from 'react';

export const GoogleTranslate = () => {
  const googleTranslateElementInit = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        autoDisplay: false,
        // Явно указываем поддерживаемые языки, включая японский
        includedLanguages: 'en,ja,ko,zh,zh-CN,zh-TW,ru,es,fr,de,it,pt,ar,hi,th,vi,id,ms,fil,tr,pl,cs,sk,hu,ro,bg,hr,sl,et,lv,lt,fi,sv,da,no,nl,el,he,uk,be,mk,sr,bs,me,al,sq',
        // Используем простой layout для лучшей совместимости
        layout: (window as any).google?.translate?.TranslateElement?.InlineLayout?.SIMPLE || 0,
        // Включаем поддержку многоязычного контента
        multilanguagePage: true,
        // Добавляем гаджет для лучшего отображения
        gaTrack: false,
      },
      'google_translate_element',
    );
  };

  useEffect(() => {
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

      // Расширенная логика определения языка браузера
      if (detectedLocale && detectedLocale !== 'en') {
        // Маппинг языков для лучшей совместимости
        const languageMapping: { [key: string]: string } = {
          'ja': 'ja',
          'ja-jp': 'ja',
          'ko': 'ko',
          'ko-kr': 'ko',
          'zh': 'zh-CN',
          'zh-cn': 'zh-CN',
          'zh-tw': 'zh-TW',
          'zh-hk': 'zh-TW',
          'ru': 'ru',
          'ru-ru': 'ru',
          'es': 'es',
          'es-es': 'es',
          'es-mx': 'es',
          'fr': 'fr',
          'fr-fr': 'fr',
          'fr-ca': 'fr',
          'de': 'de',
          'de-de': 'de',
          'de-at': 'de',
          'it': 'it',
          'it-it': 'it',
          'pt': 'pt',
          'pt-br': 'pt',
          'pt-pt': 'pt',
        };

        const targetLang = languageMapping[detectedLocale] || detectedLocale.split('-')[0];
        
        if (targetLang && targetLang !== 'en') {
          const cookieValue = encodeURIComponent(`/en/${targetLang}`);
          document.cookie = `googtrans=${cookieValue}; path=/; max-age=86400`; // 24 часа
        }
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