import React, { useEffect } from 'react';
import './AdSense.css';

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdSense: React.FC<AdSenseProps> = ({ 
  adSlot, 
  adFormat = 'auto',
  style = { display: 'block' },
  className = ''
}) => {
  useEffect(() => {
    try {
      // 确保 adsbygoogle 存在并推送广告
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client="ca-pub-8802339305248769"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
}; 