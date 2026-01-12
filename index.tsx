import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// Declare Chart.js, GSAP, and Swiper on window object since we are loading it via CDN
declare global {
  interface Window {
    Chart: any;
    gsap: any;
    ScrollTrigger: any;
    Swiper: any;
  }
}

// --- Constants ---
const LOGO_SVG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDx0ZXh0IHg9IjUiIHk9IjM4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9ImJsYWNrIj5NRURJQ0xJUDwvdGV4dD4KPC9zdmc+";

// *** GOOGLE APPS SCRIPT WEB APP URL ***
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz8bk-iYNoQ9LtarakuqgzY4CJJAL5j-8TPagK5Cn-pcZqof3yh6j4Xvq03u7TYO33mbw/exec";

const NAV_ITEMS = [
  { id: 'intro', label: '메디클립 소개' },
  { id: 'performance', label: '성공사례' },
  { id: 'packages', label: '패키지' },
  { id: 'services', label: '서비스' },
  { id: 'process', label: '진행과정' },
  { id: 'faq', label: 'FAQ' },
];

// --- Components ---

const PrivacyModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white text-navy-900 p-6 md:p-8 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-navy-900 transition text-2xl font-bold"
        >
          ✕
        </button>
        <h3 className="text-xl md:text-2xl font-bold mb-6 border-b border-gray-100 pb-4 text-navy-900">[개인정보 수집 및 이용 동의]</h3>
        
        <div className="prose prose-sm text-gray-600 space-y-6 leading-relaxed">
            <p className="font-medium text-navy-900 text-lg">메디클립(이하 '회사')은 고객님의 마케팅 진단 및 상담 문의를 위하여 아래와 같이 개인정보를 수집·이용합니다.</p>
            
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <strong className="block text-navy-900 mb-2 font-bold text-base">1. 수집 및 이용 목적</strong>
                <ul className="list-disc pl-5 space-y-1">
                    <li>마케팅 무료 진단 제공, 병원 경영 컨설팅 상담</li>
                    <li>견적서 발송 및 관련 서비스 안내</li>
                    <li>고객 문의 응대 및 이력 관리</li>
                </ul>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <strong className="block text-navy-900 mb-2 font-bold text-base">2. 수집하는 개인정보의 항목</strong>
                <ul className="list-disc pl-5 space-y-1">
                    <li>필수항목: 병원명, 성함(담당자명), 연락처(휴대전화번호), 문의내용</li>
                    <li>자동수집: 신청 일시, 접속 로그</li>
                </ul>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <strong className="block text-navy-900 mb-2 font-bold text-base">3. 개인정보의 보유 및 이용 기간</strong>
                <ul className="list-disc pl-5 space-y-1">
                    <li>수집 및 이용 목적 달성 시(상담 종료 시)까지</li>
                    <li>단, 관계 법령에 의하여 보존할 필요가 있는 경우 및 마케팅 활용 동의 시 1년간 보관 후 파기</li>
                </ul>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <strong className="block text-navy-900 mb-2 font-bold text-base">4. 동의 거부 권리 및 불이익</strong>
                <ul className="list-disc pl-5 space-y-1">
                    <li>귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.</li>
                    <li>단, 동의를 거부할 경우 마케팅 진단 및 상담 신청이 제한될 수 있습니다.</li>
                </ul>
            </div>
        </div>

        <div className="mt-8 pt-4 text-center">
            <button 
                onClick={onClose} 
                className="bg-navy-900 text-white px-12 py-3 rounded-xl font-bold hover:bg-navy-800 transition shadow-lg transform active:scale-95"
            >
                확인
            </button>
        </div>
      </div>
    </div>
  );
};

const LandingPage = ({ 
  handleScroll, 
  activeTab, 
  setActiveTab, 
  handleSubmit,
  isSubmitting,
  openPrivacyModal
}: any) => {

  const horizontalRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const PROCESS_STEPS = [
    { step: '01', title: '정밀 문진', sub: '(무료 진단)', desc: '원장님의 고민, 병원 지표,\n마케팅 현황 파악' },
    { step: '02', title: '진단 및 처방', sub: '(제안)', desc: '상권/경쟁사 분석을 통한\n\'최적 패키지\' 및 전략 제안' },
    { step: '03', title: '킥오프', sub: '(계약)', desc: '전담 매니저 배정,\n실행 스케줄 확정' },
    { step: '04', title: '시술 및 케어', sub: '(실행)', desc: '마케팅 집행, 내부 시스템 구축,\n직원 교육 실행' },
    { step: '05', title: '경과 관찰', sub: '(피드백)', desc: '월간 성과 보고,\n데이터 기반 전략 고도화' }
  ];

  // 1. Auto-rotate tabs every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev: string) => {
        if (prev === 'marketing') return 'consulting';
        if (prev === 'consulting') return 'system';
        return 'marketing';
      });
    }, 4000); 

    return () => clearInterval(interval);
  }, [setActiveTab]);

  // 2. Intersection Observer for Scroll Animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // 3. GSAP Horizontal Scroll with MatchMedia (Desktop Only)
  useEffect(() => {
    if (window.gsap && window.ScrollTrigger && horizontalRef.current && trackRef.current) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        
        // Create MatchMedia context
        const mm = window.gsap.matchMedia();

        // Apply animation only on desktop (min-width: 768px)
        mm.add("(min-width: 768px)", () => {
            const sections = window.gsap.utils.toArray('.horizontal-item');
            
            window.gsap.to(sections, {
                xPercent: -100 * (sections.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: horizontalRef.current,
                    pin: true,
                    scrub: 1,
                    snap: {
                        snapTo: 1 / (sections.length - 1),
                        duration: { min: 0.2, max: 0.3 },
                        delay: 0.1,
                        ease: "power1.inOut"
                    },
                    // We increase the end value to make the scroll slower/smoother
                    end: () => "+=" + (horizontalRef.current!.offsetWidth * 2) 
                }
            });
        });

        return () => mm.revert();
    }
  }, []);

  return (
    <>
      {/* 2. Hero Section */}
      <section className="relative h-screen w-full bg-navy-900 overflow-hidden flex items-center justify-center">
        {/* Spline 3D Background */}
        <div className="absolute inset-0 z-0 reveal">
          <iframe 
            src='https://my.spline.design/dashboardui-D3vDc2yU0jX7gzSoqwWVoTOT/' 
            frameBorder='0' 
            width='100%' 
            height='100%'
            className="w-full h-full"
            title="3D Dashboard UI"
          ></iframe>
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent z-10 pointer-events-none"></div>

        {/* Text Content */}
        <div className="relative z-20 flex flex-col justify-center items-center text-center px-6 max-w-7xl mx-auto">
          <h2 className="text-accent-yellow text-sm md:text-2xl font-bold mb-4 md:mb-6 tracking-[0.2em] animate-pulse reveal">MEDICAL MANAGEMENT AGENCY</h2>
          
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold text-white mb-2 leading-tight reveal delay-100">
            병원 성장의 <span className="text-accent-orange">퀀텀 점프</span>
          </h1>
          
          {/* Increased Spacing between sentences */}
          <div className="h-8 md:h-12"></div>
          
          <p className="text-xl md:text-5xl lg:text-5xl font-bold text-white mb-8 leading-tight reveal delay-200 opacity-90 break-keep">
             메디클립이 현실로 만듭니다.
          </p>

          <a href="#cta-section" onClick={(e) => handleScroll(e, 'cta-section')} className="reveal delay-300 mt-6 md:mt-8 bg-accent-yellow hover:bg-yellow-300 text-navy-900 text-lg md:text-2xl px-8 py-4 md:px-12 md:py-5 rounded-full font-bold shadow-2xl shadow-yellow-500/40 transition-all duration-300 transform hover:scale-105 pointer-events-auto">
            마케팅 진단 받기
          </a>
        </div>
      </section>

      {/* 3. Pain Points & Philosophy & 3-Step Engine */}
      <section id="intro" className="py-16 md:py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-6">
          {/* Pain Points */}
          <div className="text-center mb-16 md:mb-20 reveal">
            <h2 className="text-2xl md:text-5xl font-bold text-white mt-4 leading-tight break-keep">
              <span className="text-accent-yellow block mb-2 md:mb-4">원장님,</span>
              혹시 이런 고민으로<br/>밤잠 설치시나요?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-16 md:mb-24">
            {[
              { icon: '💸', title: '고비용 저효율', desc: '마케팅 비용은 쓰는데\n신규 환자는 늘지 않나요?' },
              { icon: '📉', title: '환자 이탈 & 관리 부재', desc: '환자가 와도 관리가 안 돼서\n재방문이 없나요?' },
              { icon: '🐢', title: '성장 정체', desc: '옆 병원은 확장하는데\n우리만 제자리인 것 같나요?' },
            ].map((item, idx) => (
              <div key={idx} className={`bg-navy-800 p-8 md:p-10 rounded-3xl border border-white/5 hover:border-accent-yellow/50 transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-orange/10 reveal delay-${(idx+1)*100}`}>
                <div className="text-5xl md:text-7xl mb-6 animate-float" style={{animationDelay: `${idx * 1}s`}}>{item.icon}</div>
                <h3 className="text-xl md:text-3xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 text-base md:text-xl leading-relaxed whitespace-pre-line">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Philosophy - Visual Enhancement */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-20 shadow-2xl text-center mb-20 md:mb-32 reveal">
            <h3 className="text-xl md:text-5xl font-bold text-navy-900 mb-8 md:mb-12 leading-relaxed break-keep">
              병원은 일반 기업과 다릅니다.<br/>
              <span className="text-base md:text-3xl font-normal text-gray-600 block mt-3 md:mt-6">의료법의 제약, 환자의 심리, 내부 직원의 관리까지.</span>
            </h3>
            
            <div className="max-w-5xl mx-auto">
              <p className="text-lg md:text-3xl font-bold text-navy-900 mb-8 md:mb-12 break-keep">
                메디클립은 <span className="text-accent-orange inline-block border-b-4 border-accent-yellow leading-none pb-1">'마케팅'</span>만 하지 않습니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-10 md:mb-12">
                {[
                  { title: "마케팅", sub: "환자를 부르는", icon: "📢", color: "bg-blue-50 text-blue-900" },
                  { title: "경영 전략", sub: "병원을 키우는", icon: "📈", color: "bg-green-50 text-green-900" },
                  { title: "시스템", sub: "환자를 잡는", icon: "⚙️", color: "bg-orange-50 text-orange-900" }
                ].map((item, idx) => (
                    <div key={idx} className={`${item.color} p-6 rounded-2xl flex flex-col items-center justify-center shadow-sm border border-gray-100/50`}>
                        <div className="text-3xl md:text-4xl mb-3">{item.icon}</div>
                        <span className="text-sm md:text-base font-medium opacity-80 mb-1">{item.sub}</span>
                        <strong className="text-xl md:text-2xl font-bold">[{item.title}]</strong>
                    </div>
                ))}
              </div>

              <p className="text-gray-600 text-base md:text-2xl leading-relaxed break-keep">
                이 3가지 본질을 꿰뚫어,<br className="md:hidden" /> 원장님이 꿈꾸는 <span className="font-bold text-navy-900">병원의 성장</span>을 설계합니다.
              </p>
            </div>
            
            {/* Added CTA Button */}
            <div className="mt-12 text-center">
                 <a href="#cta-section" onClick={(e) => handleScroll(e, 'cta-section')} className="inline-block bg-accent-yellow hover:bg-yellow-300 text-navy-900 font-bold text-lg md:text-xl px-10 py-4 rounded-full shadow-lg transition transform hover:scale-105">
                    마케팅 진단 받기
                 </a>
            </div>
          </div>

          {/* 3-Step Engine (Gears Visualization) - Interlocking Effect */}
          <div className="text-center mb-10 md:mb-20 reveal">
            <h2 className="text-2xl md:text-5xl font-bold text-white break-keep">메디클립의 3-Step 병원성장 엔진</h2>
          </div>
          
          {/* Interlocking Container */}
          <div className="relative flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto md:-space-x-24 space-y-16 md:space-y-0 pb-20 pt-10">
            {[
              { 
                step: 1, 
                title: '마케팅 (유입)', 
                subtitle: '"보이게 만들고,\n오게 만듭니다."', 
                details: ['검색 장악', 'SNS 타겟팅', '브랜딩', '광고'], 
                colorClass: 'text-yellow-400', 
                textColorClass: 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]',
                badgeColorClass: 'bg-yellow-500 text-slate-900',
                rimColorClass: 'stroke-yellow-600/30'
              },
              { 
                step: 2, 
                title: '컨설팅 (전략)', 
                subtitle: '"이기는 싸움의\n판을 짭니다."', 
                details: ['상권 분석', '진료 컨셉 도출', '경쟁 우위 선점'], 
                colorClass: 'text-orange-500', 
                textColorClass: 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]', 
                badgeColorClass: 'bg-orange-600 text-white',
                rimColorClass: 'stroke-orange-700/30'
              },
              { 
                step: 3, 
                title: '시스템 (운영)', 
                subtitle: '"한 번 온 환자를\n충성 고객으로 만듭니다."', 
                details: ['접점별 응대 매뉴얼', 'DB 관리', '업무 효율화'], 
                colorClass: 'text-blue-800', 
                textColorClass: 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]',
                badgeColorClass: 'bg-blue-700 text-white',
                rimColorClass: 'stroke-blue-500/30'
              },
            ].map((item, idx) => (
                <div key={idx} className={`relative group flex flex-col items-center z-10 reveal`} style={{ transitionDelay: `${idx * 150}ms` }}>
                    {/* Gear Wrapper */}
                    <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
                         {/* Rotation Offset for Meshing: Center gear is rotated 22.5deg to align teeth with outer gears (for 8 teeth) */}
                         <div className={`absolute inset-0 w-full h-full flex items-center justify-center ${idx % 2 !== 0 ? 'rotate-[22.5deg]' : ''}`}>
                            {/* Rotating Gear SVG Background - Meshing Effect */}
                            <svg 
                                viewBox="0 0 512 512" 
                                className={`w-full h-full drop-shadow-2xl ${item.colorClass} ${idx % 2 === 0 ? 'animate-[spin_20s_linear_infinite]' : 'animate-[spin_20s_linear_infinite_reverse]'}`}
                                style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.6))' }}
                            >
                                 <path fill="currentColor" d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
                                 {/* Simulated Rim */}
                                 <circle cx="256" cy="256" r="140" strokeWidth="20" fill="none" className={item.rimColorClass} />
                            </svg>
                         </div>
                        
                        {/* Inner Static Circle (Content) - Optimized Text Size & Color */}
                        <div className={`relative z-10 w-40 h-40 md:w-60 md:h-60 rounded-full flex flex-col justify-center items-center p-4 text-center`}>
                            <div className={`text-sm md:text-xl font-black mb-1 md:mb-2 px-4 py-1 md:px-6 md:py-2 rounded-full shadow-lg transform -translate-y-1 ${item.badgeColorClass}`}>
                                STEP 0{item.step}
                            </div>
                            <h3 className={`text-2xl md:text-5xl font-extrabold mb-1 leading-none drop-shadow-md ${item.textColorClass}`}>{item.title.split(' ')[0]}<br/>
                              <span className={`text-base md:text-2xl font-bold mt-1 block opacity-95`}>{item.title.split(' ')[1]}</span>
                            </h3>
                            <p className={`hidden md:block text-xl md:text-2xl font-bold leading-tight mt-3 opacity-90 ${item.textColorClass}`}>{item.subtitle.replace(/"/g, '')}</p>
                        </div>
                    </div>
                    
                    {/* Description Card - Text Size DOUBLED & Container Widened & Visualized */}
                    <div className={`mt-12 md:mt-6 relative z-20 ${idx === 1 ? 'md:mt-6' : ''}`}>
                         <div className="w-1 h-6 md:h-12 bg-gradient-to-b from-white/20 to-transparent mx-auto mb-2"></div>
                         <div className="bg-navy-800/90 p-6 md:p-8 rounded-3xl border border-white/10 text-center w-full max-w-xs md:w-[32rem] shadow-xl hover:border-accent-yellow/50 transition duration-300 transform hover:-translate-y-1 mx-auto">
                             <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                                {item.details.map((detail, dIdx) => (
                                    <div key={dIdx} className="bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-2 md:px-5 md:py-3 rounded-xl shadow-inner flex items-center gap-2 group hover:bg-white/10 transition-colors">
                                        <span className={`text-base md:text-xl font-bold ${item.colorClass.split(' ')[0]}`}>✓</span>
                                        <span className="text-gray-100 font-bold text-base md:text-xl tracking-tight">{detail}</span>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Success Story (Case Study) - Horizontal Scroll GSAP / Stacked on Mobile */}
      <section id="performance" ref={horizontalRef} className="w-full relative bg-white z-20">
          <div className="h-auto w-full md:sticky md:top-0 md:h-screen md:overflow-hidden relative">
            <div ref={trackRef} className="flex flex-col md:flex-row w-full h-auto md:h-full md:will-change-transform">
                
                {/* Panel 1: The Crisis (Before) - Optimized for visibility */}
                <div className="horizontal-item w-full h-auto py-24 md:p-0 md:min-w-full md:w-screen md:h-screen flex flex-col justify-center items-center relative bg-gradient-to-br from-gray-50 via-white to-red-50 flex-shrink-0">
                     <div className="max-w-7xl w-full mx-auto px-6 h-full flex flex-col justify-center">
                        {/* Title Group */}
                        <div className="mb-8 md:mb-12 text-center">
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-navy-900 mb-6 leading-tight break-keep tracking-tight">
                                피부과 A의 <br className="md:hidden" />
                                <span className="relative inline-block z-10">
                                   <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                                     월 매출 260% <br className="md:hidden" /> 폭발적 성장기
                                   </span>
                                   <span className="absolute bottom-2 left-0 w-full h-3 bg-yellow-300/40 -z-10 rounded-sm transform -rotate-1"></span>
                                </span>
                            </h2>
                            <div className="inline-block bg-red-100 text-red-600 font-extrabold text-2xl md:text-3xl px-6 py-2 rounded-full mb-8 tracking-wide shadow-md">1. BEFORE</div>
                            <h3 className="text-lg md:text-2xl font-medium text-gray-500 break-keep">"열심히 진료할수록 <span className="text-gray-800 font-bold decoration-wavy underline decoration-red-400">손해 보는 구조</span>였습니다."</h3>
                        </div>

                        {/* Problem Cards - Optimized Grid for better vertical fit */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 w-full">
                             {[
                                { title: "수익 구조 붕괴", desc: "가격 경쟁으로 인한\n저가 이벤트 반복", icon: "📉", color: "bg-red-50 text-red-600" },
                                { title: "패키지 부재", desc: "고단가 리프팅\n전환율 5% 미만", icon: "📦", color: "bg-gray-50 text-gray-600" },
                                { title: "저효율 마케팅", desc: "월 2천만원 지출\n체리피커 80%", icon: "💸", color: "bg-gray-50 text-gray-600" },
                                { title: "시스템 부재", desc: "상담 실장\n잦은 퇴사", icon: "🚪", color: "bg-gray-50 text-gray-600" },
                                { title: "브랜드 실종", desc: "차별점 없는\n동네 피부과", icon: "😶", color: "bg-gray-50 text-gray-600" },
                             ].map((item, idx) => (
                                <div key={idx} className={`relative p-6 rounded-2xl border ${idx === 0 ? 'border-red-200 shadow-lg shadow-red-100/50' : 'border-gray-100 hover:border-gray-200 shadow-sm'} bg-white transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center h-full justify-center group ${idx === 4 ? 'sm:col-span-2 md:col-span-1' : ''}`}>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</div>
                                    <h4 className="text-lg font-bold text-navy-900 mb-2 break-keep">{item.title}</h4>
                                    <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">{item.desc}</p>
                                </div>
                             ))}
                        </div>
                     </div>
                </div>

                {/* Panel 2: The Solution - Optimized UI */}
                <div className="horizontal-item w-full h-auto py-24 md:p-0 md:min-w-full md:w-screen md:h-screen flex flex-col justify-center items-center relative bg-gradient-to-br from-white to-blue-50 flex-shrink-0">
                     <div className="max-w-7xl w-full mx-auto px-6 h-full flex flex-col justify-center">
                         <div className="mb-8 md:mb-12 text-center">
                            <div className="inline-block bg-blue-100 text-blue-600 font-extrabold text-2xl md:text-3xl px-6 py-2 rounded-full mb-8 tracking-wide shadow-md">2. SOLUTION</div>
                            <h3 className="text-3xl md:text-5xl font-black text-navy-900 break-keep mb-4">
                                수익 극대화를 위한 <br className="md:hidden" />
                                <span className="text-blue-600">3대 체질 개선</span>
                            </h3>
                            <p className="text-gray-500 text-lg md:text-xl">"본질적인 가치를 높여 가격 저항을 없앴습니다."</p>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
                            {[
                                { 
                                    step: "01",
                                    title: "High-End 브랜딩", 
                                    sub: "Price → Value",
                                    desc: "'공장형 피부과' 이미지 탈피.\n'피부 공학 연구소' 컨셉 도입으로\n전문성과 신뢰도 확보",
                                    icon: "💎",
                                    color: "blue",
                                    gradient: "from-blue-500 to-blue-600"
                                },
                                { 
                                    step: "02",
                                    title: "Lock-in 마케팅", 
                                    sub: "Awareness → Trust",
                                    desc: "단순 노출이 아닌 '설득'에 집중.\n유튜브 '닥터 브랜딩' 및\n원내 신뢰 지표 설계",
                                    icon: "🔒",
                                    color: "indigo",
                                    gradient: "from-indigo-500 to-indigo-600"
                                },
                                { 
                                    step: "03",
                                    title: "세일즈 오토메이션", 
                                    sub: "Chaos → System",
                                    desc: "CRM 데이터 기반 자동 타겟팅.\n상담 성공률 65% 달성하는\n표준 스크립트 도입",
                                    icon: "⚙️",
                                    color: "violet",
                                    gradient: "from-violet-500 to-violet-600"
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="relative group h-full">
                                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-[2rem] transform translate-y-2 opacity-0 group-hover:opacity-100 transition duration-300 blur-xl`}></div>
                                    <div className="relative bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] shadow-xl h-full flex flex-col overflow-hidden hover:border-transparent transition-colors z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold bg-${item.color}-50 text-${item.color}-600`}>STEP {item.step}</span>
                                            <div className={`text-4xl p-2 bg-${item.color}-50 rounded-xl`}>{item.icon}</div>
                                        </div>
                                        <h4 className="text-2xl font-bold text-navy-900 mb-1">{item.title}</h4>
                                        <p className={`text-${item.color}-600 font-bold text-sm mb-6 uppercase tracking-wider`}>{item.sub}</p>
                                        <div className="w-full h-px bg-gray-100 mb-6"></div>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-line relative z-10 text-base flex-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                         </div>
                     </div>
                </div>

                {/* Panel 3: The Result (After) - Optimized UI */}
                <div className="horizontal-item w-full h-auto py-24 md:p-0 md:min-w-full md:w-screen md:h-screen flex flex-col justify-center items-center relative bg-navy-900 overflow-hidden flex-shrink-0">
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full filter blur-[120px] pointer-events-none mix-blend-screen"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-orange/10 rounded-full filter blur-[100px] pointer-events-none mix-blend-screen"></div>

                    <div className="max-w-7xl w-full mx-auto px-6 h-full flex flex-col justify-center relative z-10">
                        <div className="mb-8 md:mb-12 text-center">
                            <div className="inline-block bg-accent-yellow text-navy-900 font-extrabold text-2xl md:text-3xl px-6 py-2 rounded-full mb-8 tracking-wide shadow-md">3. AFTER</div>
                            <h3 className="text-3xl md:text-5xl font-black text-white break-keep mb-2">
                                12개월의 기적, <br className="md:hidden" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-yellow to-accent-orange">지역 1등 브랜드</span> 달성
                            </h3>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] pt-20 px-6 pb-8 md:p-12 shadow-2xl relative border border-white/20 overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
                                {/* Left: Revenue Graph Representation */}
                                <div className="flex-1 w-full text-center md:text-left">
                                    <p className="hidden md:block text-gray-400 font-medium mb-4 text-lg">월 평균 매출 변화 추이</p>
                                    <div className="flex items-end gap-4 justify-center md:justify-start">
                                        <div className="group relative">
                                            <div className="h-24 md:h-32 w-16 md:w-20 bg-gray-700/50 rounded-t-xl mx-auto relative group-hover:bg-gray-700 transition-colors">
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-gray-400 font-bold">8.5천</span>
                                            </div>
                                            <span className="block mt-4 text-gray-400 font-bold">Before</span>
                                        </div>
                                        
                                        {/* Growth Arrow */}
                                        <div className="pb-10 text-accent-yellow text-4xl animate-pulse">
                                            ➔
                                        </div>

                                        <div className="group relative">
                                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-bounce whitespace-nowrap">
                                                +317% 성장
                                            </div>
                                            <div className="h-48 md:h-64 w-20 md:w-24 bg-gradient-to-t from-accent-orange to-accent-yellow rounded-t-xl mx-auto relative shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-white font-black text-2xl drop-shadow-md whitespace-nowrap">2.7억</span>
                                            </div>
                                            <span className="block mt-4 text-white font-bold text-xl">After</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Detailed Metrics */}
                                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                                     {[
                                        { label: "객단가 상승", val: "12만→45만", change: "3.7배", icon: "💰" },
                                        { label: "VIP 전환율", val: "5%→48%", change: "안정적", icon: "👑" },
                                        { label: "광고 효율(ROAS)", val: "62%→260%", change: "고효율", icon: "📈" },
                                        { label: "직원 근속률", val: "22%→80%", change: "조직안정", icon: "🤝" },
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-navy-800/50 border border-white/10 rounded-2xl p-4 md:p-5 hover:bg-white/10 transition duration-300">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-2xl">{stat.icon}</div>
                                                <span className="text-accent-orange text-xs font-bold bg-accent-orange/10 px-2 py-1 rounded">{stat.change}</span>
                                            </div>
                                            <p className="text-gray-400 text-xs md:text-sm mb-1">{stat.label}</p>
                                            <div className="text-lg md:text-xl font-bold text-white tracking-tight">{stat.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                         <div className="mt-10 md:mt-12 text-center">
                            <a href="#cta-section" onClick={(e) => handleScroll(e, 'cta-section')} className="inline-flex items-center gap-3 bg-white text-navy-900 font-bold text-lg md:text-xl px-10 py-5 rounded-full shadow-lg shadow-white/10 hover:bg-gray-100 transition transform hover:scale-105 group">
                                <span>우리 병원도 성장할 수 있을까? (무료진단)</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>
                    </div>
                </div>

            </div>
          </div>
      </section>

      {/* 5. Packages */}
      <section id="packages" className="py-16 md:py-24 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20 reveal">
            <h2 className="text-2xl md:text-5xl font-bold text-navy-900 mt-4 break-keep">병원 유형/목적별 맞춤 플랜 패키지</h2>
            <p className="mt-6 text-gray-600 text-base md:text-xl break-keep">원장님의 현재 상황에 딱 맞는 '성장 공식'을 선택하세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-20 items-stretch">
            {/* Package 1: 스타팅 포인트 */}
            <div className="flex flex-col bg-white rounded-[2rem] shadow-xl border-2 border-transparent hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-2 reveal delay-100 overflow-hidden group">
              <div className="bg-gray-100 p-8 text-center group-hover:bg-gray-200 transition-colors">
                 <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🌱</div>
                 <h3 className="text-2xl font-bold text-navy-900">스타팅 포인트</h3>
                 <p className="text-gray-500 mt-2 font-medium">초기 병원 / 1인 의원</p>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <p className="text-center text-lg text-gray-600 italic mb-8 break-keep">"이제 막 시작하는 병원,<br/>저비용으로 기틀을 잡고 싶다면"</p>
                <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3">
                        <span className="text-green-500 text-xl font-bold">✓</span>
                        <span className="text-gray-700 text-lg"><strong>99 마케팅</strong> (기초 노출)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-green-500 text-xl font-bold">✓</span>
                        <span className="text-gray-700 text-lg"><strong>199 컨설팅</strong> (경영 진단)</span>
                    </div>
                </div>
                <div className="mt-auto pt-6 border-t border-gray-100 text-center">
                    <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-bold text-gray-500">개원 1년 미만 추천</span>
                </div>
              </div>
            </div>

            {/* Package 2: 점핑포인트 (BEST) */}
            <div className="flex flex-col bg-navy-900 rounded-[2rem] shadow-2xl border-4 border-accent-orange transform md:scale-110 relative z-10 transition-all duration-300 hover:shadow-accent-orange/30 reveal delay-200 overflow-hidden">
               <div className="absolute top-0 right-0 bg-accent-orange text-white text-sm md:text-base font-bold px-6 py-2 rounded-bl-2xl">BEST CHOICE</div>
               <div className="bg-navy-800 p-8 text-center border-b border-white/10">
                 <div className="text-6xl mb-4 animate-pulse">🚀</div>
                 <h3 className="text-3xl font-bold text-white">점핑 포인트</h3>
                 <p className="text-accent-yellow mt-2 font-bold">성장 정체기 / 경쟁 심화</p>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                 <p className="text-center text-lg text-gray-300 italic mb-8 break-keep">"매출 정체기,<br/>독보적인 컨셉으로 경쟁 우위"</p>
                 <div className="space-y-5 mb-8 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-accent-orange rounded-full p-1"><span className="text-white text-sm font-bold">✓</span></div>
                        <span className="text-white text-xl"><strong>올인원 마케팅</strong> (브랜딩)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-accent-orange rounded-full p-1"><span className="text-white text-sm font-bold">✓</span></div>
                        <span className="text-white text-xl"><strong>199 컨설팅</strong> (전략 수립)</span>
                    </div>
                     <div className="flex items-center gap-3 opacity-80">
                        <div className="bg-gray-600 rounded-full p-1"><span className="text-white text-sm font-bold">+</span></div>
                        <span className="text-gray-300 text-lg">경쟁 병원 분석 포함</span>
                    </div>
                 </div>
                 <div className="mt-auto pt-6 border-t border-white/10 text-center">
                    <span className="inline-block px-4 py-2 bg-accent-orange/20 border border-accent-orange/50 rounded-full text-sm font-bold text-accent-orange">매출 2배 성장 목표</span>
                </div>
              </div>
            </div>

            {/* Package 3: 스케일업 포인트 */}
            <div className="flex flex-col bg-white rounded-[2rem] shadow-xl border-2 border-transparent hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2 reveal delay-300 overflow-hidden group">
              <div className="bg-blue-50 p-8 text-center group-hover:bg-blue-100 transition-colors">
                 <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">💎</div>
                 <h3 className="text-2xl font-bold text-navy-900">스케일업 포인트</h3>
                 <p className="text-blue-600 mt-2 font-medium">병원 확장 / 중형급 병원</p>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <p className="text-center text-lg text-gray-600 italic mb-8 break-keep">"개원부터 확장까지,<br/>경영/마케팅/시스템 완벽 셋팅"</p>
                <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3">
                        <span className="text-blue-500 text-xl font-bold">✓</span>
                        <span className="text-gray-700 text-lg"><strong>올인원 마케팅</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-blue-500 text-xl font-bold">✓</span>
                        <span className="text-gray-700 text-lg"><strong>올인원 컨설팅</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-blue-500 text-xl font-bold">✓</span>
                        <span className="text-gray-700 text-lg"><strong>시스템 플랜</strong> (매뉴얼)</span>
                    </div>
                </div>
                 <div className="mt-auto pt-6 border-t border-gray-100 text-center">
                    <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold">퀀텀 점프 솔루션</span>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials for Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-16">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border-l-8 border-navy-900 reveal delay-100">
              <div className="flex items-start mb-6">
                <span className="text-4xl md:text-6xl mr-4 md:mr-6">❝</span>
                <p className="text-gray-600 italic text-base md:text-xl break-keep">
                  "환자는 늘었는데 수익은 제자리? 시스템이 답이더군요. 마케팅과 시스템을 같이 손보니까 광고비는 줄였는데 전체 매출은 2배가 되었습니다. 이제야 병원 운영이 재밌습니다."
                </p>
              </div>
              <p className="font-bold text-navy-900 text-right text-sm md:text-lg">- OO피부과 강 원장님 (스케일업 포인트 이용)</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border-l-8 border-navy-900 reveal delay-200">
              <div className="flex items-start mb-6">
                <span className="text-4xl md:text-6xl mr-4 md:mr-6">❝</span>
                <p className="text-gray-600 italic text-base md:text-xl break-keep">
                  "주변에 대형 치과가 들어와서 매출이 30%나 빠졌었습니다. 점핑포인트 패키지로 고급화 전략을 썼더니, 이젠 환자분들이 가격 비교 안 하고 찾아오십니다."
                </p>
              </div>
              <p className="font-bold text-navy-900 text-right text-sm md:text-lg">- OO치과 정 원장님 (점핑포인트 이용)</p>
            </div>
          </div>

          {/* Added CTA Button */}
          <div className="text-center reveal">
                 <a href="#cta-section" onClick={(e) => handleScroll(e, 'cta-section')} className="inline-block bg-accent-yellow hover:bg-yellow-300 text-navy-900 font-bold text-lg md:text-xl px-10 py-4 rounded-full shadow-lg transition transform hover:scale-105">
                    마케팅 진단 받기
                 </a>
          </div>
        </div>
      </section>

      {/* 6. Detailed Services (Plans) */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16 reveal">
            <h2 className="text-2xl md:text-5xl font-bold text-navy-900">상황에 맞는 최적의 처방전</h2>
          </div>

          <div className="flex flex-nowrap overflow-x-auto justify-center md:justify-center gap-2 md:gap-6 mb-8 md:mb-16 reveal delay-100 px-1 scrollbar-hide pb-4">
            {['marketing', 'consulting', 'system'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-shrink-0 px-5 py-3 md:px-10 md:py-4 rounded-full font-bold text-sm md:text-xl transition-all duration-300 transform whitespace-nowrap border ${activeTab === tab ? 'bg-navy-900 text-white shadow-xl scale-105 border-transparent' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'}`}
              >
                {tab === 'marketing' ? '마케팅 플랜' : tab === 'consulting' ? '컨설팅 플랜' : '시스템 플랜'}
              </button>
            ))}
          </div>

          <div className="text-center max-w-6xl mx-auto min-h-[400px] reveal delay-200">
            {activeTab === 'marketing' && (
              <div className="animate-fade-in-up">
                <p className="text-lg md:text-3xl text-accent-orange font-bold mb-6 md:mb-10 break-keep">"다르게 접근하고, 확실하게 유입시킵니다."</p>
                <div className="grid md:grid-cols-2 gap-6 md:gap-10 text-left">
                  <div className="p-6 md:p-10 bg-gray-50 rounded-3xl border border-gray-200 hover:shadow-lg transition flex flex-col">
                    <h4 className="text-2xl md:text-4xl font-bold text-navy-900 mb-4">99 마케팅</h4>
                    <p className="text-accent-orange font-bold text-lg md:text-2xl mb-6">"보이게 만듭니다"</p>
                    <ul className="text-gray-600 space-y-3 mb-8 text-base md:text-xl flex-1">
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>네이버 플레이스 관리</li>
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>네이버 브랜드 블로그</li>
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>인스타그램 피드 관리</li>
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>언론보도</li>
                    </ul>
                    <p className="text-gray-600 text-base md:text-xl pt-6 border-t border-gray-100 break-keep">저비용 고효율 가성비 노출.<br/>초기 병원의 온라인 존재감을 확실히 알립니다.</p>
                  </div>
                  <div className="p-6 md:p-10 bg-gray-50 rounded-3xl border border-gray-200 hover:shadow-lg transition flex flex-col">
                    <h4 className="text-2xl md:text-4xl font-bold text-navy-900 mb-4">올인원 마케팅</h4>
                    <p className="text-accent-orange font-bold text-lg md:text-2xl mb-6">"브랜딩으로 설득합니다"</p>
                    <ul className="text-gray-600 space-y-3 mb-8 text-base md:text-xl flex-1">
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>채널별 병원 맞춤 브랜딩</li>
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>오프라인 광고</li>
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>CRM 연동</li>
                    </ul>
                    <p className="text-gray-600 text-base md:text-xl pt-6 border-t border-gray-100 break-keep">단순 노출을 넘어선 팬덤 확보.<br/>병원의 격을 높여 충성 고객을 만듭니다.</p>
                  </div>
                </div>
                <div className="mt-10 bg-gray-100 p-6 md:p-8 rounded-2xl text-left">
                  <p className="text-gray-600 italic text-base md:text-xl break-keep">"개원 초라 막막했는데, 가성비있게 네이버부터 인스타그램까지 병원을 노출시켰어요."</p>
                  <p className="font-bold text-navy-900 mt-4 text-base md:text-xl">- OO정형외과 김원장님 (99마케팅 이용)</p>
                </div>
              </div>
            )}
            {activeTab === 'consulting' && (
              <div className="animate-fade-in-up">
                <p className="text-lg md:text-3xl text-accent-orange font-bold mb-6 md:mb-10 break-keep">"성장의 판을 짜고, 로드맵을 제시합니다."</p>
                <div className="grid md:grid-cols-2 gap-6 md:gap-10 text-left">
                  <div className="p-6 md:p-10 bg-gray-50 rounded-3xl border border-gray-200 hover:shadow-lg transition flex flex-col">
                    <h4 className="text-2xl md:text-4xl font-bold text-navy-900 mb-4">199 컨설팅</h4>
                    <p className="text-accent-orange font-bold text-lg md:text-2xl mb-6">"경영 진단 & 기초 설계"</p>
                    <ul className="text-gray-600 space-y-3 mb-8 text-base md:text-xl flex-1">
                      <li className="flex items-center"><span className="text-blue-500 mr-2">✓</span>마케팅 정밀 진단</li>
                      <li className="flex items-center"><span className="text-blue-500 mr-2">✓</span>기초 진료 전략 수립</li>
                    </ul>
                    <p className="text-gray-600 text-base md:text-xl pt-6 border-t border-gray-100 break-keep">시행착오 최소화.<br/>정밀 진단으로 새는 돈을 막고 기초 체력을 기릅니다.</p>
                  </div>
                  <div className="p-6 md:p-10 bg-gray-50 rounded-3xl border border-gray-200 hover:shadow-lg transition flex flex-col">
                    <h4 className="text-2xl md:text-4xl font-bold text-navy-900 mb-4">올인원 컨설팅</h4>
                    <p className="text-accent-orange font-bold text-lg md:text-2xl mb-6">"퀀텀 성장 설계"</p>
                    <ul className="text-gray-600 space-y-3 mb-8 text-base md:text-xl flex-1">
                      <li className="flex items-center"><span className="text-blue-500 mr-2">✓</span>입지 분석 / 인테리어</li>
                      <li className="flex items-center"><span className="text-blue-500 mr-2">✓</span>HR (직원교육)</li>
                      <li className="flex items-center"><span className="text-blue-500 mr-2">✓</span>온/오프라인 통합 전략</li>
                    </ul>
                    <p className="text-gray-600 text-base md:text-xl pt-6 border-t border-gray-100 break-keep">중장기 매출 향상 & 브랜딩.<br/>개원부터 확장까지 빈틈없는 성공 방정식을 씁니다.</p>
                  </div>
                </div>
                <div className="mt-10 bg-gray-100 p-6 md:p-8 rounded-2xl text-left">
                  <p className="text-gray-600 italic text-base md:text-xl break-keep">"마케팅에 아무리 많은 비용을 쏟아부어도 뭔가 부족한 느낌이 있었는데 ‘199 컨설팅’을 받고 그 부족한 1%를 찾을 수 있었어요."</p>
                  <p className="font-bold text-navy-900 mt-4 text-base md:text-xl">- OO치과 김원장님 (199컨설팅 이용)</p>
                </div>
              </div>
            )}
            {activeTab === 'system' && (
              <div className="animate-fade-in-up">
                <div className="mb-8 md:mb-10">
                   <span className="inline-block bg-navy-900 text-accent-yellow px-4 py-1 rounded-full text-sm md:text-base font-bold mb-3 animate-bounce">오직 메디클립에만 있는 솔루션!</span>
                   <p className="text-lg md:text-3xl text-accent-orange font-bold break-keep">"빈틈없는 병원 운영을 위한 메디클립만의 필살기"</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 md:gap-10 text-left">
                  <div className="p-6 md:p-10 bg-navy-900 rounded-3xl text-white hover:scale-[1.02] transition duration-300 flex flex-col shadow-2xl border border-white/10">
                    <h4 className="text-2xl md:text-4xl font-bold text-accent-yellow mb-4">🔄 DB 새로고침</h4>
                    <p className="text-base md:text-xl font-bold mb-6 text-gray-200 break-keep">"병원 특성에 맞춘 개인화 타겟팅으로<br/>잠자고 있는 환자데이터를 깨웁니다"</p>
                    <ul className="text-gray-300 space-y-3 mb-8 text-base md:text-xl flex-1">
                      <li className="flex items-center"><span className="text-accent-orange mr-2">✓</span>구환 DB 리타겟팅</li>
                      <li className="flex items-center"><span className="text-accent-orange mr-2">✓</span>최신 로직 노출 장악</li>
                    </ul>
                    <p className="text-gray-400 text-base md:text-xl pt-6 border-t border-white/20 break-keep">광고비 '0'원으로 매출 증대.<br/>놓치고 있던 재방문 매출을 확보합니다.</p>
                  </div>
                  <div className="p-6 md:p-10 bg-navy-900 rounded-3xl text-white hover:scale-[1.02] transition duration-300 flex flex-col shadow-2xl border border-white/10">
                    <h4 className="text-2xl md:text-4xl font-bold text-white mb-4">⚙️ 스마트 워크 시스템</h4>
                    <p className="text-base md:text-xl font-bold mb-6 text-gray-200 break-keep">"데스크, 처치실, 마케팅실의 업무가 뒤섞여 있나요?<br/>복잡한 병원 업무, 심플하게 정리!"</p>
                    <ul className="text-gray-300 space-y-3 mb-8 text-base md:text-xl flex-1">
                      <li className="flex items-center"><span className="text-accent-orange mr-2">✓</span>데스크/진료실/마케팅실 업무 통합 및 효율화</li>
                    </ul>
                    <p className="text-gray-400 text-base md:text-xl pt-6 border-t border-white/20 break-keep">의료진이 오직 '진료'와 '환자'에만 집중할 수 있는 환경으로 전환.<br/>직원 효율 상승으로 인건비 절감 효과까지.</p>
                  </div>
                </div>
                <div className="mt-10 bg-gray-100 p-6 md:p-8 rounded-2xl text-left">
                  <p className="text-gray-600 italic text-base md:text-xl break-keep">"마케팅도 중요하지만 내부가 엉망이었죠. 업무 시스템 도입 후엔 직원들이 알아서 움직입니다. 제가 진료에만 집중하게 된 게 가장 큽니다."</p>
                  <p className="font-bold text-navy-900 mt-4 text-base md:text-xl">- OO피부과 박원장 (스마트 워크 시스템 이용)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Process */}
      <section id="process" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20 reveal">
            <h2 className="text-2xl md:text-5xl font-bold text-navy-900 break-keep">체계적인 ‘메디클립’ 업무 프로세스</h2>
            <p className="text-gray-600 mt-6 text-base md:text-xl break-keep">"병원의 진료 프로세스처럼,<br/>메디클립도 체계적으로 진단하고 처방합니다."</p>
          </div>
          
          {/* Mobile View: Vertical Stack for "At a Glance" */}
          <div className="md:hidden px-4 pb-8">
             <div className="space-y-4">
                {PROCESS_STEPS.map((item, idx) => (
                   <div key={idx} className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 text-left flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-accent-orange font-black text-sm">STEP {item.step}</div>
                        <h4 className="font-bold text-navy-900 text-lg">{item.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">{item.sub}</p>
                      <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{item.desc}</p>
                   </div>
                ))}
             </div>
          </div>

          {/* Desktop View: Grid */}
          <div className="hidden md:grid grid-cols-5 gap-4">
            {PROCESS_STEPS.map((item, idx) => (
              <div key={idx} className={`bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-center relative hover:translate-y-[-5px] transition duration-300 reveal delay-${(idx+1)*100}`}>
                {idx < 4 && <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-gray-300 z-10 text-2xl">▶</div>}
                <div className="text-accent-orange font-black text-xl mb-3">STEP {item.step}</div>
                <h4 className="font-bold text-navy-900 text-xl mb-2">{item.title}</h4>
                <p className="text-sm text-gray-500 mb-4">{item.sub}</p>
                <p className="text-base text-gray-600 whitespace-pre-line">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-5xl font-bold text-navy-900 text-center mb-16 reveal break-keep">원장님이 가장 궁금해하시는 질문들</h2>
          <div className="space-y-6">
            {[
              { q: '메디클립은 일반 마케팅 대행사와 무엇이 다른가요?', a: '‘노출’만 시키는 것이 아니라 ‘매출’로 이어지는 구조를 만듭니다. 일반 대행사는 상위 노출이나 클릭 수에만 집중합니다. 하지만 환자가 병원에 와서 실망하고 돌아간다면 마케팅 비용은 낭비된 것입니다. 메디클립은 의료법을 준수하는 전문 마케팅뿐만 아니라, 환자 응대 매뉴얼, 직원 업무 시스템, 재방문 관리(DB 리타겟팅)까지 함께 케어하여 실질적인 병원 성장을 돕습니다.' },
              { q: '개원한 지 얼마 안 된 1인 의원입니다. 비용이 부담스러운데 괜찮을까요?', a: '초기 병원에 딱 맞는 ‘가성비 성장 공식’이 준비되어 있습니다. 무조건 비싼 패키지를 권하지 않습니다. 이제 막 시작하는 병원이라면 저비용으로 지역 내 기반을 다지는 [부스팅 패키지]를 추천해 드립니다. 99마케팅과 기초 경영 컨설팅을 통해 합리적인 예산으로 병원의 기초 체력을 튼튼하게 만들어 드립니다.' },
              { q: '이미 마케팅을 하고 있는데 신규 환자가 늘지 않습니다. 이유가 뭘까요?', a: '‘밑 빠진 독’에 물을 붓고 계실 확률이 높습니다. 광고로 환자를 불러도 내부 시스템(전화 응대, 대기 시간, 상담 프로세스)이 엉망이면 환자는 이탈합니다. 메디클립은 [무료 마케팅 진단]을 통해 우리 병원의 마케팅이 문제인지, 내부 시스템이 문제인지 정확히 진단하고, [스케일업 패키지] 등을 통해 새는 매출을 막아드립니다.' },
              { q: '어떤 패키지를 선택해야 할지 모르겠습니다.', a: '고민하지 마시고 ‘무료 진단’부터 받아보세요. 병원의 규모, 진료 과목, 위치한 상권, 현재 성장 단계(개원/정체/확장)에 따라 필요한 처방은 다릅니다. 메디클립의 전문 컨설턴트가 원장님 병원의 데이터를 분석하여 [부스팅 / 터닝포인트 / 스케일업 / 오프닝 마스터] 중 가장 시급하고 효과적인 솔루션을 제안해 드립니다.' },
              { q: '직원들이 시스템 변화를 거부하거나 힘들어하지 않을까요?', a: '오히려 직원들의 업무가 더 편해지고 심플해집니다. 메디클립의 [컴플릿 업무시스템]은 복잡하게 뒤섞인 데스크, 진료실, 마케팅실의 업무를 효율적으로 정리해 줍니다. 업무 가이드라인과 매뉴얼이 잡히면 직원들은 불필요한 감정 소모 없이 본연의 업무에 집중할 수 있게 되어, 장기적으로는 직원 만족도와 근속 연수까지 올라갑니다.' },
              { q: '계약 후 진행 절차는 어떻게 되나요?', a: '전담 매니저 배정부터 사후 관리까지 체계적으로 진행됩니다. 계약(킥오프)과 동시에 전담 매니저가 배정되며, 실행 스케줄을 확정합니다. 이후 마케팅 집행과 내부 시스템 구축이 동시에 이루어지며, 매월 [경과 관찰 리포트]를 통해 성과를 투명하게 공유하고 데이터에 기반해 다음 전략을 수정/보완합니다.' }
            ].map((item, idx) => (
              <details key={idx} className={`group bg-white p-6 md:p-8 rounded-2xl cursor-pointer border border-gray-100 shadow-sm transition hover:shadow-md reveal delay-${(idx % 3 + 1) * 100}`}>
                <summary className="flex justify-between items-center font-bold text-navy-900 text-lg md:text-2xl">
                  <span className="flex-1 pr-4 break-keep">Q. {item.q}</span>
                  <span className="transition group-open:rotate-180 flex-shrink-0">▼</span>
                </summary>
                <div className="text-gray-600 mt-6 pl-4 md:pl-6 border-l-4 border-accent-orange leading-relaxed text-base md:text-xl animate-fade-in-up break-keep">
                  A. {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA */}
      <section id="cta-section" className="py-16 md:py-24 bg-navy-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20 reveal">
            <h2 className="text-2xl md:text-5xl font-bold text-white mb-6 break-keep">오늘도 환자는 '준비된 병원'을 찾아갑니다.</h2>
            <p className="text-gray-300 text-lg md:text-2xl break-keep">경영 진단부터 마케팅, 시스템 구축까지.<br/>원장님은 진료만 하세요.<br/>나머지는 메디클립이 해결합니다.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="lg:w-1/2 text-white reveal delay-100 w-full">
              <h3 className="text-2xl md:text-4xl font-bold mb-8 text-accent-yellow">문의 채널</h3>
              <div className="space-y-6">
                <a href="http://pf.kakao.com/_xbtRxcn" target="_blank" rel="noreferrer" className="flex items-center space-x-6 bg-[#FEE500] text-black px-6 md:px-8 py-6 rounded-2xl font-bold hover:opacity-90 transition transform hover:scale-105">
                  <span className="text-4xl">💬</span>
                  <div className="text-left">
                    <div className="text-base md:text-lg opacity-70">실시간 상담</div>
                    <div className="text-xl md:text-2xl">카카오톡 채널 상담하기</div>
                  </div>
                </a>
                <a href="https://talk.naver.com/ct/wclj4fn?frm=mnmb&frm=nmb_detail&resizeTo=1423,765nidref=https%3A%2F%2Fpcmap.place.naver.com%2Fplace%2F2058802324%2Fhome%3Fentry%3Dplt%26from%3Dmap%26fromPanelNum%3D1%26additionalHeight%3D76%26timestamp%3D202601091059%26locale%3Dko%26svcName%3Dmap_pcv5" target="_blank" rel="noreferrer" className="flex items-center space-x-6 bg-[#03C75A] text-white px-6 md:px-8 py-6 rounded-2xl font-bold hover:opacity-90 transition transform hover:scale-105">
                  <span className="text-4xl">N</span>
                  <div className="text-left">
                    <div className="text-base md:text-lg opacity-70">빠른 문의</div>
                    <div className="text-xl md:text-2xl">네이버 톡톡 문의하기</div>
                  </div>
                </a>
              </div>
              <div className="mt-12 p-8 bg-navy-800 rounded-2xl border border-white/10">
                <p className="text-gray-300 leading-relaxed text-base md:text-xl break-keep">
                  병원 현장을 잘 아는 병원 경영·마케팅 전문가들이<br/>
                  병원의 진짜 가치를 발굴해 전달하는<br/>
                  <span className="text-white font-bold">메디컬 전문 경영 컨설팅·마케팅 대행사입니다.</span>
                </p>
              </div>
            </div>

            <div className="lg:w-1/2 w-full reveal delay-200">
              <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl">
                <h3 className="text-2xl md:text-4xl font-bold text-navy-900 mb-8">마케팅 진단 신청하기</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-base md:text-lg font-medium text-gray-700 mb-2">병원명</label>
                    <input type="text" name="hospital" required className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-accent-orange focus:border-transparent outline-none transition text-base md:text-lg" placeholder="예: 메디클립 의원" />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-gray-700 mb-2">성함 / 직함</label>
                    <input type="text" name="name" required className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-accent-orange focus:border-transparent outline-none transition text-base md:text-lg" placeholder="예: 김지민 원장" />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-gray-700 mb-2">핸드폰 번호</label>
                    <input type="tel" name="phone" required className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-accent-orange focus:border-transparent outline-none transition text-base md:text-lg" placeholder="010-1234-5678" />
                  </div>
                </div>

                <div className="mt-6 mb-2">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="privacy-agreement"
                                name="privacyAgreement"
                                type="checkbox"
                                required
                                className="w-5 h-5 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-accent-orange cursor-pointer"
                            />
                        </div>
                        <label htmlFor="privacy-agreement" className="ml-3 text-sm font-medium text-gray-500">
                            (필수) <button type="button" onClick={openPrivacyModal} className="text-navy-900 font-bold underline hover:text-accent-orange underline-offset-4">개인정보 수집 및 이용</button>에 동의합니다.
                        </label>
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-accent-yellow text-navy-900 font-bold text-xl md:text-2xl py-5 rounded-2xl mt-4 hover:bg-yellow-300 transition shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? '전송 중...' : '마케팅 진단 받기'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'marketing' | 'consulting' | 'system'>('marketing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScrollListener = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScrollListener);
    return () => window.removeEventListener('scroll', handleScrollListener);
  }, []);

  const handleScroll = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Google Scripts usually require no-cors for simple submission from client
      });
      alert('상담 신청이 완료되었습니다. 담당자가 곧 연락드리겠습니다.');
      form.reset();
    } catch (error) {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans text-navy-900 selection:bg-accent-yellow selection:text-navy-900">
      {/* Header */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div 
            className="cursor-pointer z-50" 
            onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
             {/* Logo Color Change based on background */}
             <img src={LOGO_SVG} alt="MEDICLIP" className={`h-8 md:h-10 transition duration-300 ${scrolled ? 'brightness-100' : 'brightness-0 invert'}`} />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <a 
                key={item.id} 
                href={`#${item.id}`} 
                onClick={(e) => handleScroll(e, item.id)}
                className={`text-sm font-bold hover:text-accent-orange transition ${scrolled ? 'text-navy-900' : 'text-white'}`}
              >
                {item.label}
              </a>
            ))}
            <a 
                href="https://blog.naver.com/1mediclip"
                target="_blank"
                rel="noreferrer"
                className={`text-sm font-bold hover:text-accent-orange transition ${scrolled ? 'text-navy-900' : 'text-white'}`}
            >
                블로그
            </a>
            <a 
              href="#cta-section" 
              onClick={(e) => handleScroll(e, 'cta-section')}
              className="bg-accent-yellow hover:bg-yellow-300 text-navy-900 px-6 py-3 rounded-full font-bold transition transform hover:scale-105 shadow-lg"
            >
              무료 진단 신청
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden z-50 relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className={`w-6 h-0.5 mb-1.5 transition-all ${isMenuOpen ? 'rotate-45 translate-y-2 bg-navy-900' : (scrolled ? 'bg-navy-900' : 'bg-white')}`}></div>
            <div className={`w-6 h-0.5 mb-1.5 transition-all ${isMenuOpen ? 'opacity-0' : (scrolled ? 'bg-navy-900' : 'bg-white')}`}></div>
            <div className={`w-6 h-0.5 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2 bg-navy-900' : (scrolled ? 'bg-navy-900' : 'bg-white')}`}></div>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-white z-40 flex flex-col justify-center items-center transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.id} 
              href={`#${item.id}`}
              onClick={(e) => handleScroll(e, item.id)}
              className="text-2xl font-bold text-navy-900 mb-8 hover:text-accent-orange transition"
            >
              {item.label}
            </a>
          ))}
          <a 
             href="https://blog.naver.com/1mediclip"
             target="_blank"
             rel="noreferrer"
             className="text-2xl font-bold text-navy-900 mb-8 hover:text-accent-orange transition"
             onClick={() => setIsMenuOpen(false)}
          >
              블로그
          </a>
          <a 
            href="#cta-section"
            onClick={(e) => handleScroll(e, 'cta-section')}
            className="text-2xl font-bold text-accent-orange"
          >
            무료 진단 신청
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main>
          <LandingPage 
            handleScroll={handleScroll}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            openPrivacyModal={() => setIsPrivacyOpen(true)}
          />
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12 border-t border-white/10 text-sm">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                    <img src={LOGO_SVG} alt="MEDICLIP" className="h-6 brightness-0 invert opacity-90" />
                    <div className="text-gray-400 leading-relaxed">
                        <p className="font-bold text-white mb-2">메디클립</p>
                        <p>사업자등록번호 702-17-02664</p>
                        <p>서울 강남구 강남대로112길 47 2층</p>
                        <p>1mediclip@gmail.com</p>
                        <p>개인정보관리책임자 김지민</p>
                    </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3 text-gray-500">
                    <button 
                        onClick={() => setIsPrivacyOpen(true)} 
                        className="text-gray-300 hover:text-white font-bold transition underline underline-offset-4"
                    >
                        개인정보처리방침
                    </button>
                    <p>© 2025 MEDICLIP. All rights reserved.</p>
                </div>
            </div>
        </div>
      </footer>

      {/* Privacy Modal */}
      {isPrivacyOpen && <PrivacyModal onClose={() => setIsPrivacyOpen(false)} />}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}