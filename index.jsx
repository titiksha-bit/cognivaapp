import { useState, useEffect, useRef } from "react";

/* ─── tiny backend ─────────────────────────────────────────────────────────── */
const Backend = {
  otpStore: {},
  async sendOTP(phone) {
    await delay(900);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    Backend.otpStore[phone] = { code, exp: Date.now() + 5 * 60 * 1000 };
    console.log(`[Cogniva OTP] ${phone} → ${code}`);   // visible in console
    return { ok: true, message: `OTP sent to ${phone}` };
  },
  async verifyOTP(phone, code) {
    await delay(700);
    const rec = Backend.otpStore[phone];
    if (!rec) return { ok: false, error: "No OTP found. Please resend." };
    if (Date.now() > rec.exp) return { ok: false, error: "OTP expired. Please resend." };
    if (rec.code !== code.trim()) return { ok: false, error: "Incorrect OTP. Try again." };
    delete Backend.otpStore[phone];
    return { ok: true, token: `tok_${Math.random().toString(36).slice(2)}`, user: { phone, name: "Aryan Kumar" } };
  },
  async loginEmail(email, password) {
    await delay(1200);
    if (!email.includes("@")) return { ok: false, error: "Invalid email address." };
    if (password.length < 6) return { ok: false, error: "Password too short." };
    return { ok: true, token: `tok_${Math.random().toString(36).slice(2)}`, user: { email, name: "Aryan Kumar" } };
  },
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ─── particles ────────────────────────────────────────────────────────────── */
const PTS = Array.from({ length: 36 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  s: Math.random() * 3 + 1, dur: Math.random() * 14 + 8,
  del: Math.random() * 8, op: Math.random() * 0.3 + 0.06,
}));

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function useIn(ms) {
  const [v, set] = useState(false);
  useEffect(() => { const t = setTimeout(() => set(true), ms); return () => clearTimeout(t); }, []);
  return v;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function CognivaLogin() {
  const [phase, setPhase]       = useState("splash");   // splash | expand | login
  const [tab, setTab]           = useState("email");     // email | phone
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [phone, setPhone]       = useState("");
  const [otp, setOtp]           = useState(["","","","","",""]);
  const [otpSent, setOtpSent]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");
  const [success, setSuccess]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const [shake, setShake]       = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const logoIn  = useIn(200);
  const formIn  = useIn(100);

  /* splash → expand after 1.6 s */
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("expand"), 1600);
    const t2 = setTimeout(() => setPhase("login"),  2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* resend countdown */
  useEffect(() => {
    if (resendTimer <= 0) return;
    timerRef.current = setInterval(() => setResendTimer(t => { if (t <= 1) clearInterval(timerRef.current); return t - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, [resendTimer]);

  function doShake(msg) { setErr(msg); setShake(true); setTimeout(() => setShake(false), 600); }

  /* OTP input handling */
  function handleOtpKey(i, e) {
    const val = e.target.value.replace(/\D/, "");
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  async function sendOtp() {
    if (phone.replace(/\D/, "").length < 10) { doShake("Enter a valid 10-digit number"); return; }
    setErr(""); setLoading(true);
    const res = await Backend.sendOTP(phone);
    setLoading(false);
    if (res.ok) { setOtpSent(true); setResendTimer(30); setTimeout(() => otpRefs.current[0]?.focus(), 100); }
  }

  async function verifyOtp() {
    const code = otp.join("");
    if (code.length < 6) { doShake("Enter all 6 digits"); return; }
    setErr(""); setLoading(true);
    const res = await Backend.verifyOTP(phone, code);
    setLoading(false);
    if (!res.ok) { doShake(res.error); setOtp(["","","","","",""]); otpRefs.current[0]?.focus(); return; }
    setSuccess(true);
  }

  async function loginEmail() {
    if (!email || !password) { doShake("Fill in all fields"); return; }
    setErr(""); setLoading(true);
    const res = await Backend.loginEmail(email, password);
    setLoading(false);
    if (!res.ok) { doShake(res.error); return; }
    setSuccess(true);
  }

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: "100vh", width: "100%", overflow: "hidden",
      background: "radial-gradient(ellipse at 30% 20%, #0a2040 0%, #060c1a 60%, #020610 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes floatBob {
          0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-28px) scale(1.15);}
        }
        @keyframes ringPulse {
          0%{transform:translate(-50%,-50%) scale(.8);opacity:.7;}
          70%{transform:translate(-50%,-50%) scale(1.3);opacity:0;}
          100%{transform:translate(-50%,-50%) scale(.8);opacity:0;}
        }
        @keyframes logoSplash {
          0%{transform:scale(0) rotate(-15deg);opacity:0;}
          60%{transform:scale(1.12) rotate(3deg);opacity:1;}
          100%{transform:scale(1) rotate(0deg);opacity:1;}
        }
        @keyframes logoShrink {
          0%{transform:scale(1) translateY(0);}
          100%{transform:scale(0.42) translateY(-82px);}
        }
        @keyframes pageReveal {
          0%{clip-path:circle(5% at 50% 38%);opacity:.4;}
          100%{clip-path:circle(150% at 50% 38%);opacity:1;}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(20px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes shimmerText {
          0%,100%{background-position:0% 50%;}
          50%{background-position:100% 50%;}
        }
        @keyframes gradBtn {
          0%,100%{background-position:0% 50%;}
          50%{background-position:100% 50%;}
        }
        @keyframes shake {
          0%,100%{transform:translateX(0);}
          20%{transform:translateX(-9px);}
          40%{transform:translateX(9px);}
          60%{transform:translateX(-5px);}
          80%{transform:translateX(5px);}
        }
        @keyframes dotBounce {
          0%,80%,100%{transform:scale(.65);opacity:.35;}
          40%{transform:scale(1);opacity:1;}
        }
        @keyframes successPop {
          0%{transform:scale(0) rotate(-180deg);opacity:0;}
          70%{transform:scale(1.2) rotate(8deg);}
          100%{transform:scale(1) rotate(0deg);opacity:1;}
        }
        @keyframes orbitA {
          from{transform:rotate(0deg) translateX(54px) rotate(0deg);}
          to{transform:rotate(360deg) translateX(54px) rotate(-360deg);}
        }
        @keyframes orbitB {
          from{transform:rotate(180deg) translateX(36px) rotate(-180deg);}
          to{transform:rotate(540deg) translateX(36px) rotate(-540deg);}
        }
        @keyframes scanLine {
          0%{top:12%;opacity:1;}
          90%{top:88%;opacity:.7;}
          100%{top:12%;opacity:1;}
        }
        @keyframes otpPop {
          0%{transform:scale(.7);opacity:0;}
          70%{transform:scale(1.08);}
          100%{transform:scale(1);opacity:1;}
        }
        .inp {
          width:100%; background:rgba(255,255,255,0.045);
          border:1px solid rgba(80,190,220,0.2); border-radius:12px;
          padding:13px 16px 13px 42px; color:#e8f0ff; font-size:14px;
          outline:none; box-sizing:border-box; font-family:inherit;
          transition:border-color .3s,background .3s,box-shadow .3s;
        }
        .inp:focus{
          border-color:rgba(30,200,200,.6);
          background:rgba(30,200,200,0.07);
          box-shadow:0 0 0 3px rgba(30,200,200,0.1);
        }
        .inp::placeholder{color:rgba(120,170,200,0.42);}
        .cta {
          width:100%; padding:14px; border:none; border-radius:12px;
          color:#fff; font-size:15px; font-weight:500; cursor:pointer;
          background:linear-gradient(135deg,#1dbba8,#3a9ef0,#1dbba8);
          background-size:200% 200%;
          animation:gradBtn 3s ease infinite;
          transition:transform .2s,box-shadow .2s;
          font-family:inherit;
        }
        .cta:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(30,200,180,.28);}
        .cta:active{transform:scale(.98);}
        .cta:disabled{opacity:.55;cursor:default;}
        .tab {
          flex:1; padding:9px; border:none; border-radius:9px;
          font-size:13px; font-weight:500; cursor:pointer;
          font-family:inherit; transition:all .25s;
        }
        .otp-box {
          width:40px; height:48px; background:rgba(255,255,255,0.05);
          border:1px solid rgba(80,190,220,0.25); border-radius:10px;
          color:#e8f0ff; font-size:20px; font-weight:600; text-align:center;
          outline:none; font-family:inherit; caret-color:#1dbba8;
          transition:border-color .3s,box-shadow .3s;
        }
        .otp-box:focus{border-color:#1dbba8;box-shadow:0 0 0 3px rgba(29,187,168,.18);}
        .social-btn {
          flex:1; padding:10px 8px; background:rgba(255,255,255,0.04);
          border:1px solid rgba(80,190,220,0.18); border-radius:10px;
          color:#8bbfd4; font-size:12.5px; cursor:pointer;
          transition:all .2s; font-family:inherit;
          display:flex; align-items:center; justify-content:center; gap:6px;
        }
        .social-btn:hover{background:rgba(30,200,200,0.1);border-color:rgba(30,200,200,.4);color:#e8f0ff;}
      `}</style>

      {/* ── floating particles ── */}
      {phase === "login" && PTS.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:`${p.y}%`,
          width:p.s, height:p.s, borderRadius:"50%",
          background:`rgba(30,190,200,${p.op})`,
          animation:`floatBob ${p.dur}s ${p.del}s infinite ease-in-out`,
          pointerEvents:"none",
        }}/>
      ))}

      {/* ── pulse rings (always, behind logo) ── */}
      {[340,230,140].map((sz,i) => (
        <div key={i} style={{
          position:"absolute", left:"50%",
          top: phase === "login" ? "82px" : "40%",
          width:sz, height:sz,
          transform:"translate(-50%,-50%)",
          borderRadius:"50%",
          border:`1px solid rgba(30,190,200,${0.06 + i*0.03})`,
          animation:`ringPulse ${12+i*4}s ${i*2.5}s infinite ease-out`,
          pointerEvents:"none",
          transition:"top .9s cubic-bezier(.4,0,.2,1)",
        }}/>
      ))}

      {/* ── orbiting dots ── */}
      {phase !== "splash" && (
        <>
          <div style={{
            position:"absolute", left:"50%",
            top: phase === "login" ? "82px" : "40%",
            width:0, height:0,
            animation:"none",
            transition:"top .9s cubic-bezier(.4,0,.2,1)",
          }}>
            <div style={{width:9,height:9,borderRadius:"50%",background:"rgba(30,200,200,.75)",
              animation:"orbitA 9s linear infinite",position:"absolute",
              top:0,left:0,marginTop:-4.5,marginLeft:-4.5}}/>
            <div style={{width:6,height:6,borderRadius:"50%",background:"rgba(58,158,240,.8)",
              animation:"orbitB 6s linear infinite",position:"absolute",
              top:0,left:0,marginTop:-3,marginLeft:-3}}/>
          </div>
        </>
      )}

      {/* ══════════════════════ SPLASH PHASE ══════════════════════ */}
      {phase === "splash" && (
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center", gap:20,
          animation: logoIn ? "logoSplash .8s cubic-bezier(.34,1.56,.64,1) forwards" : "none",
          opacity: logoIn ? undefined : 0,
        }}>
          <LogoIcon size={110} />
          <div style={{
            background:"linear-gradient(135deg,#1dbba8,#3a9ef0,#1dbba8)",
            backgroundSize:"200% auto",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            fontSize:28, fontWeight:600, animation:"shimmerText 2.5s linear infinite",
            letterSpacing:.5,
          }}>Cogniva</div>
        </div>
      )}

      {/* ══════════════════════ EXPAND / LOGIN PHASE ══════════════════════ */}
      {(phase === "expand" || phase === "login") && (
        <div style={{
          position:"relative", zIndex:10, width:"100%", maxWidth:390,
          padding:"0 20px",
          animation: formIn ? "pageReveal .9s cubic-bezier(.4,0,.2,1) forwards" : "none",
        }}>

          {/* shrunken logo top */}
          <div style={{
            display:"flex", flexDirection:"column", alignItems:"center",
            marginBottom:20,
            animation: phase === "login" ? "fadeUp .5s .1s both" : "none",
          }}>
            <LogoIcon size={56} />
            <div style={{
              marginTop:8, fontSize:20, fontWeight:600,
              background:"linear-gradient(135deg,#1dbba8,#7de8f0,#3a9ef0)",
              backgroundSize:"200% auto", WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent", animation:"shimmerText 3s linear infinite",
            }}>Cogniva</div>
            <div style={{color:"rgba(120,170,200,.6)", fontSize:12, marginTop:3}}>
              Your complete health, powered by AI
            </div>
          </div>

          {/* welcome */}
          <div style={{
            textAlign:"center", marginBottom:22,
            animation:"fadeUp .5s .25s both",
          }}>
            <div style={{color:"#e8f0ff", fontSize:19, fontWeight:500}}>Welcome back 👋</div>
          </div>

          {/* card */}
          <div style={{
            background:"rgba(8,14,34,0.82)",
            border:"1px solid rgba(30,190,200,0.14)",
            borderRadius:20, padding:"24px 22px",
            backdropFilter:"blur(18px)",
            animation: shake ? "shake .5s ease" : "fadeUp .6s .35s both",
          }}>

            {success ? <SuccessView /> : (
              <>
                {/* tabs */}
                <div style={{
                  display:"flex", background:"rgba(255,255,255,0.05)",
                  borderRadius:11, padding:3, marginBottom:20, gap:3,
                }}>
                  {["email","phone"].map(t => (
                    <button key={t} className="tab" onClick={() => { setTab(t); setErr(""); setOtpSent(false); setOtp(["","","","","",""]); }}
                      style={{
                        background: tab===t ? "linear-gradient(135deg,#1dbba8,#3a9ef0)" : "transparent",
                        color: tab===t ? "#fff" : "rgba(120,170,200,.65)",
                      }}>
                      {t === "email" ? "✉ Email" : "📱 Mobile"}
                    </button>
                  ))}
                </div>

                {tab === "email" && (
                  <EmailForm
                    email={email} setEmail={setEmail}
                    password={password} setPassword={setPassword}
                    showPw={showPw} setShowPw={setShowPw}
                    focused={focused} setFocused={setFocused}
                    loading={loading} onSubmit={loginEmail}
                  />
                )}
                {tab === "phone" && (
                  <PhoneForm
                    phone={phone} setPhone={setPhone}
                    otp={otp} otpRefs={otpRefs}
                    otpSent={otpSent} loading={loading}
                    resendTimer={resendTimer}
                    focused={focused} setFocused={setFocused}
                    handleOtpKey={handleOtpKey}
                    onSend={sendOtp} onVerify={verifyOtp}
                    onResend={() => { setOtp(["","","","","",""]); sendOtp(); }}
                  />
                )}

                {err && (
                  <div style={{
                    marginTop:12, background:"rgba(224,96,126,0.12)",
                    border:"1px solid rgba(224,96,126,0.3)", borderRadius:9,
                    padding:"9px 12px", color:"#f08090", fontSize:12.5, textAlign:"center",
                  }}>{err}</div>
                )}

                {/* divider */}
                <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0 14px"}}>
                  <div style={{flex:1,height:".5px",background:"rgba(30,190,200,0.13)"}}/>
                  <span style={{color:"rgba(120,170,200,.4)",fontSize:11.5}}>or continue with</span>
                  <div style={{flex:1,height:".5px",background:"rgba(30,190,200,0.13)"}}/>
                </div>

                {/* social */}
                <div style={{display:"flex",gap:9}}>
                  <button className="social-btn"><span>G</span> Google</button>
                  <button className="social-btn"><span>🍎</span> Apple</button>
                </div>
              </>
            )}
          </div>

          {/* footer */}
          <div style={{textAlign:"center",marginTop:18,animation:"fadeUp .5s .8s both"}}>
            <span style={{color:"rgba(120,170,200,.45)",fontSize:13}}>New here? </span>
            <span style={{color:"#1dbba8",fontSize:13,fontWeight:500,cursor:"pointer"}}>Create account →</span>
          </div>
          <div style={{textAlign:"center",marginTop:9,animation:"fadeUp .5s 1s both"}}>
            <span style={{color:"rgba(100,140,180,.32)",fontSize:11}}>
              🔒 256-bit encrypted · HIPAA compliant
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Logo component ────────────────────────────────────────────────────────── */
function LogoIcon({ size = 80 }) {
  const r = size * 0.22;
  return (
    <div style={{
      width:size, height:size, borderRadius:size*0.26,
      background:"linear-gradient(135deg,#1dbba8 0%,#3a9ef0 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow:`0 0 ${size*.4}px rgba(30,190,200,0.3)`,
      position:"relative", flexShrink:0,
    }}>
      {/* the bold C from the logo */}
      <div style={{
        width:size*.52, height:size*.52, borderRadius:"50%",
        border:`${size*.1}px solid #fff`,
        borderRightColor:"transparent",
        transform:"rotate(-30deg) scaleX(1.15)",
      }}/>
    </div>
  );
}

/* ─── Email form ────────────────────────────────────────────────────────────── */
function EmailForm({ email, setEmail, password, setPassword, showPw, setShowPw, focused, setFocused, loading, onSubmit }) {
  return (
    <div style={{animation:"fadeUp .4s ease both"}}>
      <div style={{marginBottom:13, position:"relative"}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",
          fontSize:15, color: focused==="em" ? "#1dbba8" : "rgba(100,150,190,.4)",
          transition:"color .2s", pointerEvents:"none"}}>✉</span>
        <input className="inp" type="email" placeholder="Email address"
          value={email} onChange={e=>setEmail(e.target.value)}
          onFocus={()=>setFocused("em")} onBlur={()=>setFocused(null)}/>
      </div>
      <div style={{marginBottom:6, position:"relative"}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",
          fontSize:15, color: focused==="pw" ? "#1dbba8" : "rgba(100,150,190,.4)",
          transition:"color .2s", pointerEvents:"none"}}>🔒</span>
        <input className="inp" type={showPw?"text":"password"} placeholder="Password"
          value={password} onChange={e=>setPassword(e.target.value)}
          onFocus={()=>setFocused("pw")} onBlur={()=>setFocused(null)}
          style={{paddingRight:44}}/>
        <button onClick={()=>setShowPw(s=>!s)} style={{
          position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",
          background:"none",border:"none",cursor:"pointer",
          color:"rgba(100,150,190,.45)",fontSize:14,padding:0,
        }}>{showPw?"🙈":"👁"}</button>
      </div>
      <div style={{textAlign:"right",marginBottom:18}}>
        <span style={{color:"#1dbba8",fontSize:12,cursor:"pointer",opacity:.8}}>Forgot password?</span>
      </div>
      <button className="cta" onClick={onSubmit} disabled={loading}>
        {loading ? <Dots /> : "Sign in →"}
      </button>
    </div>
  );
}

/* ─── Phone / OTP form ──────────────────────────────────────────────────────── */
function PhoneForm({ phone, setPhone, otp, otpRefs, otpSent, loading, resendTimer, focused, setFocused, handleOtpKey, onSend, onVerify, onResend }) {
  return (
    <div style={{animation:"fadeUp .4s ease both"}}>
      <div style={{marginBottom:13, position:"relative"}}>
        {/* country prefix */}
        <div style={{
          position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
          color:"#1dbba8", fontSize:13, fontWeight:500, pointerEvents:"none",
          display:"flex", alignItems:"center", gap:4,
        }}>🇮🇳 +91</div>
        <input className="inp"
          style={{paddingLeft:70}}
          type="tel" placeholder="Mobile number"
          value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/,"").slice(0,10))}
          onFocus={()=>setFocused("ph")} onBlur={()=>setFocused(null)}
          disabled={otpSent}/>
      </div>

      {!otpSent ? (
        <button className="cta" onClick={onSend} disabled={loading}>
          {loading ? <Dots /> : "Send OTP →"}
        </button>
      ) : (
        <>
          <div style={{
            textAlign:"center", color:"rgba(30,190,180,.7)", fontSize:12.5, marginBottom:16,
            animation:"fadeUp .4s ease both",
          }}>
            OTP sent to +91 {phone} ·{" "}
            <span style={{color:"#e8f0ff",fontWeight:500}}>Check console for demo code</span>
          </div>

          {/* OTP boxes */}
          <div style={{
            display:"flex", gap:8, justifyContent:"center", marginBottom:20,
            animation:"otpPop .5s cubic-bezier(.34,1.56,.64,1) both",
          }}>
            {otp.map((v,i) => (
              <input key={i} className="otp-box"
                ref={el=>otpRefs.current[i]=el}
                type="text" inputMode="numeric" maxLength={1}
                value={v}
                onChange={e=>handleOtpKey(i,e)}
                onKeyDown={e=>{ if(e.key==="Backspace"&&!otp[i]&&i>0) otpRefs.current[i-1]?.focus(); }}
              />
            ))}
          </div>

          <button className="cta" onClick={onVerify} disabled={loading}>
            {loading ? <Dots /> : "Verify & Sign in →"}
          </button>

          <div style={{textAlign:"center",marginTop:12}}>
            {resendTimer > 0 ? (
              <span style={{color:"rgba(120,170,200,.45)",fontSize:12.5}}>
                Resend in {resendTimer}s
              </span>
            ) : (
              <span onClick={onResend}
                style={{color:"#1dbba8",fontSize:12.5,cursor:"pointer",fontWeight:500}}>
                Resend OTP
              </span>
            )}
            {" · "}
            <span onClick={()=>{ }} style={{color:"rgba(120,170,200,.45)",fontSize:12.5,cursor:"pointer"}}>
              Change number
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Success view ──────────────────────────────────────────────────────────── */
function SuccessView() {
  return (
    <div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{
        width:62,height:62,
        background:"linear-gradient(135deg,rgba(29,187,168,.2),rgba(58,158,240,.2))",
        border:"2px solid #1dbba8", borderRadius:"50%",
        margin:"0 auto 14px",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:26, animation:"successPop .7s cubic-bezier(.34,1.56,.64,1) forwards",
      }}>✓</div>
      <div style={{color:"#e8f0ff",fontSize:16,fontWeight:500,marginBottom:4}}>You're in!</div>
      <div style={{color:"rgba(120,170,200,.6)",fontSize:13}}>Redirecting to your dashboard…</div>
      <div style={{
        marginTop:16, height:2, borderRadius:2,
        background:"linear-gradient(90deg,#1dbba8,#3a9ef0)",
        animation:"gradBtn 1.5s linear infinite", backgroundSize:"200% 100%",
      }}/>
    </div>
  );
}

/* ─── Loading dots ──────────────────────────────────────────────────────────── */
function Dots() {
  return (
    <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
      {[0,1,2].map(i=>(
        <span key={i} style={{
          width:7,height:7,borderRadius:"50%",background:"#fff",display:"inline-block",
          animation:`dotBounce 1.2s ${i*.2}s infinite ease-in-out`,
        }}/>
      ))}
    </span>
  );
}
