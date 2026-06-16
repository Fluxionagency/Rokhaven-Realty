'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import styles from './page.module.css';

const MARK_PATH = 'M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z';

interface PropertyCard {
  grad: string;
  loc: string;
  name: string;
  price: string;
  specs: string;
  badge: string;
}

interface Message {
  id: number;
  role: 'haven' | 'user';
  text: string;
  cards?: PropertyCard[];
  follow?: string;
  time: string;
  typing?: boolean;
}

const getTime = () => {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h > 12 ? h - 12 : h || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

const RESPONSES: Array<{
  test: (t: string) => boolean;
  reply: (t: string) => { text: string; cards?: PropertyCard[]; follow?: string };
}> = [
  {
    test: t => /\b(find|looking|4.bed|bedroom|pool|property|apartment|house|flat|duplex|villa|ikoyi|banana|vi|victoria|lekki|shortlet)\b/i.test(t),
    reply: t => {
      if (/shortlet/i.test(t)) {
        return {
          text: 'I have curated two exceptional shortlet residences in Victoria Island that match your requirements. Both offer fully managed, hotel-grade amenities with complete privacy.',
          cards: [
            { grad: 'linear-gradient(135deg,#162840,#0D2030)', loc: 'VICTORIA ISLAND', name: 'The Maritime Suite', price: '₦2,800,000/wk', specs: '3 Bed · 3 Bath · Waterfront View · Serviced', badge: 'SHORTLET' },
            { grad: 'linear-gradient(135deg,#1A1A2C,#282840)', loc: 'VICTORIA ISLAND', name: 'Skyloft Penthouse', price: '₦3,500,000/wk', specs: '2 Bed · 2 Bath · Rooftop Terrace · Pool', badge: 'SHORTLET' },
          ],
          follow: 'Both properties are available for your requested period. Shall I arrange a private viewing, or would you like more detail on either residence?',
        };
      }
      return {
        text: "I have identified two properties that align closely with your brief. Both are in Ikoyi's most sought-after pockets, with the amenity profiles and discretion that RokHaven clients expect.",
        cards: [
          { grad: 'linear-gradient(135deg,#0D2540,#162D45)', loc: 'IKOYI, LAGOS', name: 'The Grand Arkadia', price: '₦750,000,000', specs: '4 Bed · 5 Bath · Pool · 680 sqm', badge: 'FOR SALE' },
          { grad: 'linear-gradient(135deg,#0A2218,#173226)', loc: 'OLD IKOYI, LAGOS', name: 'Meridian Estate — No. 7', price: '₦820,000,000', specs: '4 Bed · 4 Bath · Pool · Garden · 720 sqm', badge: 'FOR SALE' },
        ],
        follow: 'Both properties are available for private viewings at your convenience. Would you like me to arrange a tour, or do you have questions about either listing?',
      };
    },
  },
  {
    test: t => /\b(invest|roi|return|yield|portfolio|capital|growth|appreciate|asset|buy.to.let|rental income)\b/i.test(t),
    reply: () => ({
      text: "Nigeria's luxury real estate market continues to present compelling investment opportunities, particularly across these corridors:\n\n• **Ikoyi & Banana Island** — capital appreciation of 14–22% CAGR over the past decade in Naira terms; premium on scarcity.\n\n• **Victoria Island South** — strong rental yields of 6–9% for well-positioned residential stock, driven by corporate demand.\n\n• **Maitama, Abuja** — growing diplomatic and government demand; relatively undersupplied at the ultra-premium end.\n\nThe most resilient assets remain those with water proximity, architectural distinction, and discreet security infrastructure.",
      follow: 'Would you like me to share specific investment listings, or connect you with a RokHaven advisor for a personalised portfolio review?',
    }),
  },
  {
    test: t => /\b(viewing|view|visit|schedule|tour|inspect|appointment|book|see the property)\b/i.test(t),
    reply: () => ({
      text: "I would be delighted to arrange a private viewing at your convenience. Our viewings are conducted with complete discretion, and we can accommodate requests outside standard business hours for clients who prefer it.\n\nTo proceed, I'll need a few details:\n— Which property or properties you wish to view\n— Your preferred date and time\n— Whether you are visiting alone or with advisors",
      follow: 'Alternatively, I can connect you directly with a RokHaven advisor who will personally manage the arrangements.',
    }),
  },
  {
    test: t => /\b(neighbourhood|area|location|banana island|maitama|asokoro|lekki|surulere|where should|which area)\b/i.test(t),
    reply: () => ({
      text: "Each of Lagos and Abuja's premium neighbourhoods offers a distinct character:\n\n• **Banana Island** — Nigeria's most exclusive enclave. Gated, waterfront, unmatched prestige. Entry point circa ₦900M.\n\n• **Old Ikoyi** — Established, leafy, architecturally varied. Strong capital preservation profile.\n\n• **Victoria Island South** — Infrastructure-rich, lifestyle-forward, strong for corporate tenants.\n\n• **Lekki Phase 1** — Growing premium corridor; more inventory, younger demographic, strong rental market.\n\n• **Maitama (Abuja)** — Quiet prestige, diplomatic enclave, excellent long-term hold characteristics.",
      follow: 'Which of these interests you most? I can provide a deeper briefing, or source listings within a specific neighbourhood.',
    }),
  },
  {
    test: t => /\b(hello|hi|hey|good morning|good afternoon|good evening|good day|greet)\b/i.test(t),
    reply: () => ({
      text: 'Good day. It is a pleasure to hear from you. How may I assist you with your property requirements today?',
    }),
  },
  {
    test: t => /\b(market|price|trend|2026|outlook|economy|naira|dollar|foreign|usd)\b/i.test(t),
    reply: () => ({
      text: "Nigeria's luxury property market in 2026 is characterised by resilient demand at the top end, persistent supply constraints in prime locations, and increasing appetite from diaspora and foreign-currency holders.\n\nKey dynamics to note:\n\n— Prime Lagos prices in USD terms have stabilised following the naira float, making current entry points historically attractive for dollar-denominated buyers.\n\n— Demand for turnkey, fully fitted properties at the ₦500M–₦1.2B range is outpacing supply, supporting price floors.\n\n— The shortlet sector continues to grow at roughly 18% annually, driven by corporate demand and tourism.",
      follow: 'Would you like to explore specific listings, or receive our latest market intelligence report?',
    }),
  },
  {
    test: () => true,
    reply: () => ({
      text: 'Thank you for your enquiry. To ensure I provide you with the most relevant guidance, could you share a little more about what you are looking for? For instance:\n\n— Are you searching for a property to purchase, rent, or shortlet?\n— Do you have a preferred location or neighbourhood in mind?\n— What is your approximate budget range?\n\nWith these details, I can curate a selection that meets your exact requirements.',
    }),
  },
];

function getResponse(text: string) {
  for (const r of RESPONSES) {
    if (r.test(text)) return r.reply(text);
  }
  return RESPONSES[RESPONSES.length - 1].reply(text);
}

function formatText(text: string) {
  return text
    .replace(/\n/g, '<br/>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:rgba(244,237,224,.85);font-weight:500">$1</strong>');
}

const WELCOME_MESSAGE: Message = {
  id: 0,
  role: 'haven',
  text: "Good day. I'm Haven — RokHaven's personal property concierge.\n\nWhether you are searching for a new residence, exploring investment opportunities, or seeking insight on a particular neighbourhood, I am here to assist you with care and discretion.\n\nHow may I help you today?",
  time: getTime(),
};

const QUICK_PROMPTS = [
  { label: 'Find a property in Ikoyi', msg: 'Find me a 4-bedroom property in Ikoyi with a pool' },
  { label: 'Investment advice', msg: 'What is the best area in Lagos for property investment right now?' },
  { label: 'Luxury shortlet', msg: 'I need a luxury shortlet in Victoria Island for 2 weeks' },
  { label: 'Schedule a viewing', msg: 'I would like to schedule a viewing' },
];

const SIDEBAR_PROMPTS = [
  { label: 'Find a 4-bed in Ikoyi with a pool', msg: 'Find me a 4-bedroom property in Ikoyi with a pool' },
  { label: 'Best Lagos area for investment', msg: 'What is the best area in Lagos for property investment right now?' },
  { label: 'Luxury shortlet, Victoria Island', msg: 'I need a luxury shortlet in Victoria Island for 2 weeks' },
  { label: 'Schedule a private viewing', msg: 'I would like to schedule a viewing' },
];

export default function HavenPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  let nextId = useRef(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '';
    setShowChips(false);

    const userMsg: Message = {
      id: nextId.current++,
      role: 'user',
      text: msg,
      time: getTime(),
    };
    const typingMsg: Message = {
      id: nextId.current++,
      role: 'haven',
      text: '',
      time: '',
      typing: true,
    };
    setMessages((prev: Message[]) => [...prev, userMsg, typingMsg]);
    setSending(true);

    const delay = 900 + Math.min(msg.length * 10, 1200);
    setTimeout(() => {
      const resp = getResponse(msg);
      const replyMsg: Message = {
        id: nextId.current++,
        role: 'haven',
        text: resp.text,
        cards: resp.cards,
        follow: resp.follow,
        time: getTime(),
      };
      setMessages((prev: Message[]) => [...prev.filter((m: Message) => !m.typing), replyMsg]);
      setSending(false);
    }, delay);
  }

  function clearChat() {
    setMessages([{ ...WELCOME_MESSAGE, time: getTime() }]);
    setShowChips(true);
    setSending(false);
    nextId.current = 1;
  }

  function handleKey(e: { key: string; shiftKey: boolean; preventDefault: () => void }) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  return (
    <div style={{ background: '#060F1C', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div className={styles.appShell}>

        {/* Left Panel */}
        <aside className={styles.leftPanel}>
          <div className={styles.havenIntro}>
            <div className={styles.havenAvatar}>
              <svg width="26" height="26" viewBox="0 0 60 60" fill="#C0A870">
                <path d={MARK_PATH} />
              </svg>
              <div className={styles.statusDot} />
            </div>
            <div className={styles.havenName}>Haven</div>
            <div className={styles.havenRole}>Property Concierge</div>
            <p className={styles.havenDesc}>Your personal guide to Nigeria&apos;s finest properties. I can find listings, advise on neighbourhoods, share market insights, and arrange viewings — discreetly and at your pace.</p>
          </div>

          <div className={styles.panelSection}>
            <div className={styles.panelLbl}>What I Can Do</div>
            <div className={styles.capItem}>
              <div className={styles.capIcon}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <div className={styles.capText}><strong>Find Properties</strong>Match listings to your brief — budget, location, size, and lifestyle.</div>
            </div>
            <div className={styles.capItem}>
              <div className={styles.capIcon}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
              </div>
              <div className={styles.capText}><strong>Neighbourhood Guidance</strong>In-depth insight on Ikoyi, Banana Island, Victoria Island, Maitama and more.</div>
            </div>
            <div className={styles.capItem}>
              <div className={styles.capIcon}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              </div>
              <div className={styles.capText}><strong>Market Intelligence</strong>Valuations, yield analysis, and investment outlook across Nigeria&apos;s premium markets.</div>
            </div>
            <div className={styles.capItem}>
              <div className={styles.capIcon}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className={styles.capText}><strong>Schedule Viewings</strong>Arrange private property tours at a time that suits your schedule.</div>
            </div>
          </div>

          <div className={styles.panelSection}>
            <div className={styles.panelLbl}>Quick Prompts</div>
            {SIDEBAR_PROMPTS.map(p => (
              <button key={p.msg} className={styles.promptBtn} onClick={() => sendMessage(p.msg)}>
                {p.label} <span className={styles.promptArrow}>→</span>
              </button>
            ))}
          </div>

          <button className={styles.newChatBtn} onClick={clearChat}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Conversation
          </button>

          <p className={styles.disclaimer}>Haven provides guidance based on available listings and market data. For formal property advice, please consult a RokHaven advisor.</p>
        </aside>

        {/* Chat Panel */}
        <main className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatAvSm}>
                <svg width="16" height="16" viewBox="0 0 60 60" fill="#C0A870">
                  <path d={MARK_PATH} />
                </svg>
              </div>
              <div>
                <div className={styles.chatHeaderName}>Haven</div>
                <div className={styles.chatHeaderStatus}>● Available now</div>
              </div>
            </div>
            <div className={styles.chatHeaderActions}>
              <Link href="/contact">
                <button className={styles.chatActionBtn} title="Contact an advisor">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
              </Link>
              <button className={styles.chatActionBtn} title="New conversation" onClick={clearChat}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 101.85-5.81"/></svg>
              </button>
            </div>
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => {
              if (m.typing) {
                return (
                  <div key={m.id} className={`${styles.msg} ${styles.msgHaven}`}>
                    <div className={styles.msgAv}>
                      <svg width="14" height="14" viewBox="0 0 60 60" fill="#C0A870"><path d={MARK_PATH} /></svg>
                    </div>
                    <div className={`${styles.bubble} ${styles.bubbleHaven} ${styles.typing}`}>
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                    </div>
                  </div>
                );
              }

              if (m.role === 'user') {
                return (
                  <div key={m.id} className={`${styles.msg} ${styles.msgUser}`}>
                    <div className={`${styles.msgAv} ${styles.msgAvUser}`}>
                      <svg width="13" height="13" fill="none" stroke="rgba(244,237,224,0.5)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <div className={`${styles.bubble} ${styles.bubbleUser}`}>{m.text}</div>
                      <div className={`${styles.msgTime} ${styles.msgTimeUser}`}>{m.time}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className={`${styles.msg} ${styles.msgHaven}`}>
                  <div className={styles.msgAv}>
                    <svg width="14" height="14" viewBox="0 0 60 60" fill="#C0A870"><path d={MARK_PATH} /></svg>
                  </div>
                  <div>
                    <div
                      className={`${styles.bubble} ${styles.bubbleHaven}`}
                      dangerouslySetInnerHTML={{ __html: formatText(m.text) }}
                    />
                    {m.cards && m.cards.length > 0 && (
                      <div className={styles.propCards}>
                        {m.cards.map((card, ci) => (
                          <Link key={ci} href="/listings">
                            <div className={styles.propCard}>
                              <div className={styles.pccImg} style={{ background: card.grad }}>
                                <svg width="60" height="60" viewBox="0 0 60 60" fill="#C0A870" style={{ opacity: .06, position: 'relative' }}>
                                  <path d={MARK_PATH} />
                                </svg>
                                <div className={styles.pccBadge}>{card.badge}</div>
                              </div>
                              <div className={styles.pccBody}>
                                <div className={styles.pccLocation}>{card.loc}</div>
                                <div className={styles.pccName}>{card.name}</div>
                                <div className={styles.pccPrice}>{card.price}</div>
                                <div className={styles.pccSpecs}>{card.specs}</div>
                                <div className={styles.pccBtn}>View Property</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {m.follow && (
                      <div
                        className={`${styles.bubble} ${styles.bubbleHaven}`}
                        style={{ marginTop: 8 }}
                        dangerouslySetInnerHTML={{ __html: formatText(m.follow) }}
                      />
                    )}
                    <div className={`${styles.msgTime} ${styles.msgTimeHaven}`}>{m.time}</div>
                    {i === 0 && showChips && (
                      <div className={styles.promptsRow}>
                        {QUICK_PROMPTS.map(p => (
                          <button key={p.msg} className={styles.promptChip} onClick={() => sendMessage(p.msg)}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputRow}>
              <textarea
                ref={textareaRef}
                className={styles.chatInput}
                placeholder="Ask about properties, neighbourhoods, market insights…"
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  autoResize(e.target);
                }}
                onKeyDown={handleKey}
              />
              <button
                className={styles.sendBtn}
                onClick={() => sendMessage()}
                disabled={sending || !input.trim()}
              >
                <svg width="16" height="16" fill="none" stroke="#060F1C" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div className={styles.inputHint}>Haven uses RokHaven listing data and market intelligence. Responses are for guidance only.</div>
          </div>
        </main>
      </div>
    </div>
  );
}
