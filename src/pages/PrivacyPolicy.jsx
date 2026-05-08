import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '80px 40px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <a href="/" style={{ fontFamily: 'Inter', fontSize: '14px', color: '#9C2000', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '40px' }}>
          ← Back to home
        </a>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: '40px', color: '#F2EDE8', letterSpacing: '-0.03em', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#44403C', marginBottom: '48px' }}>Last updated: May 8, 2026</p>
        <div style={{ fontFamily: 'Inter', fontSize: '15px', color: '#7A7672', lineHeight: 1.8 }}>
          <p style={{ marginBottom: '20px' }}>Welcome to Vibe Promote ("Vibe Promote", "we", "our", or "us"). This Privacy Policy explains how we collect, use, and protect your information when you use our website, products, and services.</p>
          <p style={{ marginBottom: '32px' }}>By using Vibe Promote, you agree to the collection and use of information in accordance with this Privacy Policy.</p>

          {[
            { title: '1. Information We Collect', content: `We may collect the following information:\n\nPersonal Information\n• Email address\n• Name or username (if provided)\n• Payment-related information\n\nUsage Information\n• Browser type\n• Device information\n• IP address\n• Pages visited\n• Session activity\n• Survey responses\n• User interactions with the platform\n\nCookies & Analytics\nWe may use cookies, analytics tools, and tracking technologies to improve user experience and understand product performance.` },
            { title: '2. How We Use Your Information', content: `We use collected information to:\n\n• Provide and improve the platform\n• Manage accounts and waitlists\n• Process payments\n• Send updates, announcements, and product-related emails\n• Analyze usage and improve features\n• Prevent spam, abuse, or fraudulent activity` },
            { title: '3. Payments', content: `Payments may be processed through third-party payment providers such as PayPal or other processors.\n\nWe do not store full payment card details on our servers.` },
            { title: '4. Data Sharing', content: `We do not sell your personal data.\n\nWe may share limited data with:\n• Payment providers\n• Analytics services\n• Hosting providers\n• Legal authorities if required by law` },
            { title: '5. Data Security', content: `We take reasonable measures to protect user information. However, no online service or storage method can be guaranteed completely secure.` },
            { title: '6. User Content', content: `Any information, feedback, survey responses, or content submitted through the platform may be stored and used to improve Vibe Promote and related features.` },
            { title: '7. Your Rights', content: `Depending on your location, you may have rights to:\n\n• Access your data\n• Request corrections\n• Request deletion of your data\n• Withdraw consent\n\nTo request account or data deletion, contact:\nvibepromote@gmail.com` },
            { title: '8. Third-Party Services', content: `Vibe Promote may contain links or integrations with third-party services. We are not responsible for the privacy practices or content of those services.` },
            { title: "9. Children's Privacy", content: `Vibe Promote is not intended for users under the age of 13.` },
            { title: '10. Changes to This Privacy Policy', content: `We may update this Privacy Policy at any time. Continued use of the platform after changes means you accept the updated policy.` },
            { title: '11. Contact', content: `If you have questions about this Privacy Policy, contact:\nvibepromote@gmail.com` },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: '36px' }}>
              <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '19px', color: '#F2EDE8', marginBottom: '12px' }}>{s.title}</h2>
              <p style={{ whiteSpace: 'pre-line' }}>{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}