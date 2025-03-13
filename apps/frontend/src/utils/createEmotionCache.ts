import createCache from '@emotion/cache';

const isBrowser = typeof document !== 'undefined';

// Create emotion cache for client side
const createEmotionCache = () => {
  let insertionPoint;

  if (isBrowser) {
    // Find the insertion point for emotion styles
    const emotionInsertionPoint = document.querySelector<HTMLMetaElement>(
      'meta[name="emotion-insertion-point"]'
    );
    insertionPoint = emotionInsertionPoint ?? undefined;
  }

  return createCache({ 
    key: 'mui-style', 
    insertionPoint 
  });
};

export default createEmotionCache; 