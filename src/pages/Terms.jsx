import React from 'react';

export default function Terms() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '80px 40px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <a href="/" style={{ fontFamily: 'Inter', fontSize: '14px', color: '#9C2000', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '40px' }}>
          ← Back to home
        </a>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: '40px', color: '#F2EDE8', letterSpacing: '-0.03em', marginBottom: '8px' }}>Terms & Conditions</h1>
        <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#44403C', marginBottom: '20px' }}>Last updated: May 8, 2026</p>
        <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#7A7672', lineHeight: 1.8, marginBottom: '32px' }}>Welcome to Vibe Promote. By accessing or using our website and services, you agree to these Terms & Conditions. If you do not agree with these terms, do not use the platform.</p>
        <div style={{ fontFamily: 'Inter', fontSize: '15px', color: '#7A7672', lineHeight: 1.8 }}>
          {[
            { title: '1. Use of the Platform', content: `You agree to use Vibe Promote only for lawful purposes.\n\nYou may not:\n• Attempt unauthorized access\n• Abuse or disrupt the platform\n• Upload harmful or malicious content\n• Use the service for illegal activities\n• Reverse engineer or copy the platform` },
            { title: '2. Accounts', content: `You are responsible for maintaining the security of your account and login credentials.\n\nWe reserve the right to suspend or terminate accounts that violate these Terms.` },
            { title: '3. Payments & Refunds', content: `Some features may require payment.\n\nUnless otherwise stated:\n• Payments are non-refundable\n• Pricing may change at any time\n• Access may be revoked for abuse or fraudulent activity` },
            { title: '4. AI-Generated Content', content: `Vibe Promote may provide AI-generated suggestions, automation, or content tools.\n\nYou are responsible for reviewing and using generated content appropriately. We do not guarantee accuracy, performance, reach, or business results.` },
            { title: '5. Intellectual Property', content: `All platform content, branding, software, and materials belong to Vibe Promote unless otherwise stated.\n\nYou may not:\n• Copy or redistribute platform materials\n• Resell access to the service\n• Use branding without permission\n• Reproduce the software or design` },
            { title: '6. Limitation of Liability', content: `Vibe Promote is provided "as is" without warranties of any kind.\n\nWe are not liable for:\n• Lost profits or revenue\n• Data loss\n• Service interruptions\n• Indirect or consequential damages\n\nYour use of the platform is at your own risk.` },
            { title: '7. Service Availability', content: `We may modify, suspend, or discontinue any part of the platform at any time without notice.` },
            { title: '8. Termination', content: `We reserve the right to suspend or terminate access to users who violate these Terms or misuse the platform.` },
            { title: '9. Governing Law', content: `These Terms shall be governed by and interpreted according to applicable laws in your jurisdiction.` },
            { title: '10. Contact', content: `For questions regarding these Terms & Conditions, contact:\nvibepromote@gmail.com` },
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