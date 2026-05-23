// RokHaven Wireframes — Shared UI Primitives
// All components exported to window for use in Wireframes.html

const WF = {
  bg:     '#0A1520',
  surf:   '#101C2A',
  border: '#1C3048',
  borderA:'#C0A870',
  img:    '#132030',
  label:  '#6A90A8',
  muted:  '#2C4258',
  accent: '#C0A870',
  text:   '#C0D0E0',
  dim:    '#263A4E',
};

const WBox = ({ style, children, accent, dashed, lbl }) => (
  <div style={{ border:`1px ${dashed?'dashed':'solid'} ${accent?WF.borderA:WF.border}`, borderRadius:3, position:'relative', ...style }}>
    {lbl && <span style={{ position:'absolute',top:-9,left:8,background:WF.bg,padding:'0 5px',fontSize:7.5,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:accent?WF.accent:WF.muted,fontFamily:"'DM Sans',sans-serif" }}>{lbl}</span>}
    {children}
  </div>
);

const WImg = ({ lbl='IMAGE', style }) => (
  <div style={{ background:WF.img,border:`1px solid ${WF.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:6,...style }}>
    <svg width="24" height="24" style={{opacity:0.35}}><line x1="0" y1="0" x2="24" y2="24" stroke={WF.label} strokeWidth="1.5"/><line x1="24" y1="0" x2="0" y2="24" stroke={WF.label} strokeWidth="1.5"/></svg>
    <span style={{fontSize:8.5,fontWeight:500,letterSpacing:'0.25em',color:WF.muted,fontFamily:"'DM Sans',sans-serif",textTransform:'uppercase',textAlign:'center',padding:'0 8px'}}>{lbl}</span>
  </div>
);

const WLbl = ({ children, style, accent }) => (
  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,fontWeight:500,letterSpacing:'0.32em',textTransform:'uppercase',color:accent?WF.accent:WF.label,...style}}>{children}</div>
);

const WStr = ({ children, size=12, bold, muted, accent, style }) => (
  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:size,fontWeight:bold?500:300,color:accent?WF.accent:muted?WF.label:WF.text,lineHeight:1.5,...style}}>{children}</div>
);

const WH = ({ children, size=18, style }) => (
  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:size,color:WF.text,lineHeight:1.2,...style}}>{children}</div>
);

const WBtn = ({ children, style, accent, ghost, sm }) => (
  <div style={{
    display:'inline-flex',alignItems:'center',justifyContent:'center',
    padding:`0 ${sm?12:20}px`,height:sm?32:42,flexShrink:0,
    border:`1px solid ${accent?WF.borderA:WF.border}`,borderRadius:3,
    background:accent?'rgba(192,168,112,0.1)':'transparent',
    fontFamily:"'DM Sans',sans-serif",fontSize:sm?8.5:10,fontWeight:500,
    letterSpacing:'0.2em',textTransform:'uppercase',
    color:accent?WF.accent:WF.label,cursor:'default',...style
  }}>{children}</div>
);

const WInput = ({ placeholder, style }) => (
  <div style={{height:44,border:`1px solid ${WF.border}`,borderRadius:3,padding:'0 14px',display:'flex',alignItems:'center',background:WF.surf,...style}}>
    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:WF.dim,fontWeight:300}}>{placeholder}</span>
  </div>
);

const WDrop = ({ label, style }) => (
  <div style={{display:'flex',alignItems:'center',gap:8,padding:'0 14px',height:44,border:`1px solid ${WF.border}`,borderRadius:3,background:WF.surf,cursor:'default',...style}}>
    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:300,color:WF.dim,flex:1}}>{label}</span>
    <span style={{color:WF.muted,fontSize:10}}>▾</span>
  </div>
);

const WPill = ({ label, active }) => (
  <div style={{padding:'5px 13px',border:`1px solid ${active?WF.borderA:WF.border}`,borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:active?500:300,color:active?WF.accent:WF.label,background:active?'rgba(192,168,112,0.1)':'transparent',cursor:'default',flexShrink:0}}>{label}</div>
);

const WTag = ({ children }) => (
  <div style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 10px',background:'rgba(192,168,112,0.08)',border:`1px solid ${WF.borderA}`,borderRadius:3}}>
    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:500,color:WF.accent,letterSpacing:'0.08em'}}>{children}</span>
    <span style={{color:WF.accent,fontSize:12,opacity:0.6,lineHeight:1}}>×</span>
  </div>
);

const WNav = () => (
  <div style={{height:64,background:WF.surf,borderBottom:`1px solid ${WF.border}`,display:'flex',alignItems:'center',padding:'0 40px',gap:20,flexShrink:0}}>
    <div style={{display:'flex',alignItems:'center',gap:8,minWidth:160}}>
      <svg width="18" height="18" viewBox="0 0 60 60" fill={WF.accent}><path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z"/></svg>
      <div>
        <div style={{fontSize:11,fontFamily:"'DM Serif Display',serif",color:WF.accent,letterSpacing:'0.22em'}}>ROKHAVEN</div>
        <div style={{fontSize:7,fontFamily:"'DM Sans',sans-serif",color:WF.accent,letterSpacing:'0.4em',opacity:0.6}}>REALTY</div>
      </div>
    </div>
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:32}}>
      {['Sales','Rent','Shortlets','About','Contact'].map(l=>(
        <span key={l} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:400,color:WF.label,letterSpacing:'0.08em'}}>{l}</span>
      ))}
    </div>
    <WBtn>List a Property</WBtn>
  </div>
);

const WCard = ({ badge, style }) => (
  <WBox style={{background:WF.surf,overflow:'hidden',...style}}>
    <WImg style={{height:160}} lbl="PROPERTY PHOTO"/>
    <div style={{padding:'12px 14px 14px'}}>
      {badge && <div style={{display:'inline-block',fontSize:8,fontWeight:500,letterSpacing:'0.25em',padding:'2px 7px',border:`1px solid ${WF.borderA}`,color:WF.accent,borderRadius:2,marginBottom:8,textTransform:'uppercase'}}>{badge}</div>}
      <WH size={13} style={{marginBottom:4}}>Property Name</WH>
      <WStr size={14} accent bold style={{marginBottom:4}}>₦ Price</WStr>
      <WStr size={11} muted style={{marginBottom:10}}>Location, Lagos</WStr>
      <div style={{display:'flex',gap:12,borderTop:`1px solid ${WF.border}`,paddingTop:10}}>
        {['3 Beds','4 Baths','420 sqm'].map(i=><WStr key={i} size={10} muted>{i}</WStr>)}
      </div>
    </div>
  </WBox>
);

const WFooter = () => (
  <div style={{background:'#060F1C',borderTop:`1px solid ${WF.border}`,padding:'48px 48px 28px',flexShrink:0}}>
    <div style={{display:'flex',gap:48,marginBottom:32}}>
      <div style={{flex:1.5}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <svg width="18" height="18" viewBox="0 0 60 60" fill={WF.accent}><path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z"/></svg>
          <div style={{fontSize:11,fontFamily:"'DM Serif Display',serif",color:WF.accent,letterSpacing:'0.22em'}}>ROKHAVEN</div>
        </div>
        <WStr size={11} muted>Where Legacy Lives</WStr>
      </div>
      {['Properties','Company','Legal'].map(col=>(
        <div key={col} style={{flex:1}}>
          <WLbl style={{marginBottom:12}}>{col}</WLbl>
          {[1,2,3].map(i=><div key={i} style={{height:9,background:WF.muted,borderRadius:2,opacity:0.2,marginBottom:8,width:'70%'}}/>)}
        </div>
      ))}
      <div style={{flex:1}}>
        <WLbl style={{marginBottom:12}}>Connect</WLbl>
        <div style={{display:'flex',gap:8}}>
          {[1,2,3].map(i=><div key={i} style={{width:30,height:30,border:`1px solid ${WF.border}`,borderRadius:3}}/>)}
        </div>
      </div>
    </div>
    <div style={{borderTop:`1px solid ${WF.border}`,paddingTop:16,display:'flex',justifyContent:'space-between'}}>
      <WStr size={10} muted>© 2025 RokHaven Realty. All rights reserved.</WStr>
      <WStr size={10} muted>Where Legacy Lives · Where Every Detail Matters.</WStr>
    </div>
  </div>
);

const WAdminSidebar = ({ active = 0 }) => (
  <div style={{width:240,background:'#060F1C',borderRight:`1px solid ${WF.border}`,padding:'28px 0',flexShrink:0}}>
    <div style={{padding:'0 20px',marginBottom:40,display:'flex',alignItems:'center',gap:8}}>
      <svg width="16" height="16" viewBox="0 0 60 60" fill={WF.accent}><path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z"/></svg>
      <div style={{fontSize:10,fontFamily:"'DM Serif Display',serif",color:WF.accent,letterSpacing:'0.22em'}}>ROKHAVEN</div>
    </div>
    {['Dashboard','Listings','Inspection Requests','Settings'].map((l,i)=>(
      <div key={l} style={{padding:'13px 20px',background:i===active?'rgba(192,168,112,0.08)':'transparent',borderLeft:i===active?`2px solid ${WF.accent}`:'2px solid transparent'}}>
        <WStr size={12} accent={i===active} muted={i!==active}>{l}</WStr>
      </div>
    ))}
  </div>
);

const Ann = ({ children, style }) => (
  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:8,fontWeight:500,color:'#3A6A90',letterSpacing:'0.18em',textTransform:'uppercase',...style}}>↳ {children}</div>
);

Object.assign(window, { WF, WBox, WImg, WLbl, WStr, WH, WBtn, WInput, WDrop, WPill, WTag, WNav, WCard, WFooter, WAdminSidebar, Ann });
