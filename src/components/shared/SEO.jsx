"use client";

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reusable SEO component for managing page metadata, canonical URLs,
 * Open Graph, Twitter Cards, and JSON-LD structured data.
 */
export default function SEO({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://vibepromote.tech/favicon.png',
  schema,
  keywords = []
}) {
  const location = useLocation();
  const currentUrl = canonicalUrl || `https://vibepromote.tech${location.pathname}`;
  const siteTitle = title ? `${title} | Vibe Promote` : 'Vibe Promote – AI Marketing Automation for SaaS Founders';

  useEffect(() => {
    // 1. Update Document Title
    document.title = siteTitle;

    // Helper to set or create meta tags
    const setMetaTag = (attrName, attrValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set or create link tags
    const setLinkTag = (rel, href) => {
      if (!href) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Set Standard Meta Tags
    setMetaTag('name', 'description', description || 'Stop guessing what to post. Vibe Promote automates audience discovery, content creation, and growth strategy for bootstrapped founders.');
    if (keywords.length > 0) {
      setMetaTag('name', 'keywords', keywords.join(', '));
    }

    // 3. Set Canonical URL
    setLinkTag('canonical', currentUrl);

    // 4. Set Open Graph Tags
    setMetaTag('property', 'og:title', title || 'Vibe Promote');
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', 'Vibe Promote');

    // 5. Set Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title || 'Vibe Promote');
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. Inject JSON-LD Schema
    let schemaScript = document.getElementById('json-ld-schema');
    if (schemaScript) {
      schemaScript.remove();
    }

    if (schema) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'json-ld-schema';
      schemaScript.type = 'application/ld+json';
      schemaScript.innerHTML = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }

    return () => {
      // Clean up schema script on unmount
      const scriptToRemove = document.getElementById('json-ld-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [siteTitle, description, currentUrl, ogType, ogImage, schema, keywords]);

  return null;
}

// --- Schema Generator Utilities ---

export const getWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Vibe Promote",
  "url": "https://vibepromote.tech",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://vibepromote.tech/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Vibe Promote",
  "url": "https://vibepromote.tech",
  "logo": "https://vibepromote.tech/logo.png",
  "sameAs": [
    "https://x.com/vibepromote",
    "https://www.linkedin.com/company/vibe-promote"
  ]
});

export const getPersonSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Hiten Sapra",
  "jobTitle": "Founder",
  "worksFor": {
    "@type": "Organization",
    "name": "Vibe Promote"
  },
  "url": "https://vibepromote.tech/founder",
  "sameAs": [
    "https://x.com/hitensapra11"
  ]
});

export const getBreadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url ? `https://vibepromote.tech${item.url}` : undefined
  }))
});

export const getArticleSchema = ({ title, description, datePublished, dateModified, authorName, authorUrl, imageUrl, articleUrl }) => ({
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": title,
  "description": description,
  "image": imageUrl || "https://vibepromote.tech/favicon.png",
  "datePublished": datePublished,
  "dateModified": dateModified || datePublished,
  "author": {
    "@type": "Person",
    "name": authorName || "Hiten Sapra",
    "url": authorUrl || "https://vibepromote.tech/founder"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Vibe Promote",
    "logo": {
      "@type": "ImageObject",
      "url": "https://vibepromote.tech/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": articleUrl
  }
});

export const getFAQSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
});